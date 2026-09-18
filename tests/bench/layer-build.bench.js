/**
 * How the layer build scales with the number of layers one collection
 * contributes, and what a styled layer costs on top. The window closes on
 * `layers:updated`, so it holds the build and every layer's tile load. The
 * shape of the curve is the finding: superlinear is a defect no single-size
 * measurement can see.
 *
 * Size is driven by how many `xyz` links one item carries, so the number of
 * round trips is identical at every size and the intercept is shared. Those
 * layers are built but not drawn: visible, each one costs a tile fetch and a
 * 250ms fade, and at ten layers that was 90% of the window and hid the build
 * this row exists to compare.
 *
 * The styled row takes the asset door: a `style` link matched by `asset:keys`
 * is fetched and merged into the definition, and the source is opened by
 * OpenLayers at construction as in the app. The GeoJSON is served by vite; a
 * remote COG was the same code path over the network, and it timed the CDN.
 */
import { describe, expect, test, vi } from "vitest";
import { buildCatalog, xyzLinks } from "../support/catalog";
import { MAP_ONLY } from "../support/template";
import {
  defineBenchmark,
  bootBench,
  expectDistinct,
  expectConstant,
  compareBenchmarks,
  TEST_TIMEOUT,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const RESET_INDICATOR_ID = "neutral";
/**
 * What a real catalog carries. Larger counts only measured the browser loading
 * N tiles: at 100 one iteration took 13.5s, at 1000 it never finished.
 */
const SIZES = [1, 10, 100];
const VECTOR_ID = "styled-vector";
const VECTOR_ASSET = "storms";
const VECTOR_FILE = "/tests/support/assets/stormtracker.geojson";

/**
 * Padded, or `sub-1` prefixes `sub-10` and a `startsWith` predicate lies.
 * @param {number} n
 */
const getCollectionId = (n) => `sub-${String(n).padStart(4, "0")}`;

/** The shape of the catalog's own styles: `variables` driving an expression. */
const vectorStyle = {
  variables: { vmin: 0, vmax: 2000 },
  "circle-radius": 4,
  "circle-fill-color": [
    "interpolate",
    ["linear"],
    [
      "/",
      ["-", ["get", "cluster_lightning"], ["var", "vmin"]],
      ["-", ["var", "vmax"], ["var", "vmin"]],
    ],
    0,
    [68, 1, 84, 1],
    1,
    [253, 231, 37, 1],
  ],
};

/** @param {string} assetKey @param {string} href */
const styleLink = (assetKey, href) => ({
  rel: "style",
  href,
  type: "application/json",
  "asset:keys": [assetKey],
});

const catalog = buildCatalog([
  { id: RESET_INDICATOR_ID },
  ...SIZES.map((n) => ({
    id: getCollectionId(n),
    links: xyzLinks(n).map((link) => ({ ...link, roles: ["invisible"] })),
  })),
  {
    id: VECTOR_ID,
    links: [],
    assets: {
      [VECTOR_ASSET]: {
        href: `${globalThis.location.origin}${VECTOR_FILE}`,
        type: "application/geo+json",
        roles: ["data"],
      },
    },
  },
]);
catalog.routes[`/c/${VECTOR_ID}.json`].links.push(
  styleLink(VECTOR_ASSET, `/${VECTOR_ID}-style.json`),
);
catalog.routes[`/${VECTOR_ID}-style.json`] = vectorStyle;

describe("layer construction", () => {
  test(
    "scales with the number of layers a collection contributes",
    { timeout: TEST_TIMEOUT },
    async ({ bench }) => {
      const { app, served, createSelectionSpec } = await bootBench(
        axiosMock,
        catalog,
        {
          template: "bench",
          over: { templates: { bench: MAP_ONLY } },
        },
      );

      const sized = SIZES.map((n) =>
        defineBenchmark(
          bench,
          `links=${n}`,
          createSelectionSpec(getCollectionId(n), { from: RESET_INDICATOR_ID }),
        ),
      );
      // Three round trips and the style; the source itself never touches axios.
      const styled = defineBenchmark(
        bench,
        "styled vector",
        createSelectionSpec(VECTOR_ID, { from: RESET_INDICATOR_ID }),
      );

      try {
        await compareBenchmarks(bench, [...sized, styled]);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        sized.forEach((benchmark, index) => {
          expectConstant(benchmark, "layers", SIZES[index]);
          expectDistinct(benchmark, "identity");
          // Flat across sizes is what makes the curve construction, not latency.
          expectConstant(benchmark, "requests", 3);
        });
        expectConstant(styled, "layers", 1);
        expectDistinct(styled, "identity");
        expectConstant(styled, "requests", 4);
      } finally {
        app.unmount();
      }
    },
  );
});
