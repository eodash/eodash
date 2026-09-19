/**
 * What a styled layer costs from selection to drawn frame, once per source
 * type the builder branches on.
 *
 * Both rows take the asset door: a `style` link matched by `asset:keys` is
 * fetched and merged into the definition. Both sources are local — the COG
 * arrives through `provide` as bytes and is rendered off a blob url, the
 * GeoJSON is a committed asset — so the window holds the style resolution, the
 * source setup and the decode, with no network in it.
 */
import { describe, expect, inject, test, vi } from "vitest";
import { buildCatalog } from "../support/catalog";
import { MAP_ONLY } from "../support/template";
import {
  defineBenchmark,
  bootBench,
  expectDistinct,
  expectConstant,
  compareBenchmarks,
  reportMetrics,
  TEST_TIMEOUT,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const RESET_INDICATOR_ID = "neutral";
const GEOTIFF_ID = "styled-geotiff";
const VECTOR_ID = "styled-vector";
const VECTOR_ASSET = "storms";
const VECTOR_FILE = "/tests/support/assets/stormtracker.geojson";

const geotiff = inject("geotiffFixture");

/** In memory, so the row can wait for the decode without waiting on a CDN. */
const cogUrl = URL.createObjectURL(
  new Blob([Uint8Array.from(atob(geotiff.cog), (char) => char.charCodeAt(0))], {
    type: "image/tiff",
  }),
);

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
  {
    id: GEOTIFF_ID,
    links: [],
    assets: { [geotiff.assetKey]: { ...geotiff.asset, href: cogUrl } },
  },
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
catalog.routes[`/c/${GEOTIFF_ID}.json`].links.push(
  styleLink(geotiff.assetKey, `/${GEOTIFF_ID}-style.json`),
);
catalog.routes[`/${GEOTIFF_ID}-style.json`] = geotiff.style;
catalog.routes[`/c/${VECTOR_ID}.json`].links.push(
  styleLink(VECTOR_ASSET, `/${VECTOR_ID}-style.json`),
);
catalog.routes[`/${VECTOR_ID}-style.json`] = vectorStyle;

describe("layer rendering", () => {
  test(
    "draws a styled layer of each source type",
    { timeout: TEST_TIMEOUT },
    async (ctx) => {
      const { app, query, served, createSelectionSpec } = await bootBench(
        axiosMock,
        catalog,
        {
          template: "bench",
          over: { templates: { bench: MAP_ONLY } },
        },
      );

      const olMap = query("eox-map").map;
      const benchmarks = [
        { name: "geotiff rendering", id: GEOTIFF_ID },
        { name: "vector rendering", id: VECTOR_ID },
      ].map(({ name, id }) =>
        defineBenchmark(ctx, name, {
          ...createSelectionSpec(id, { from: RESET_INDICATOR_ID }),
          target: olMap,
          event: "rendercomplete",
        }),
      );

      try {
        await compareBenchmarks(benchmarks);
        await Promise.all(benchmarks.map(reportMetrics));

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        for (const benchmark of benchmarks) {
          expectConstant(benchmark, "layers", 1);
          expectDistinct(benchmark, "identity");
          // Three round trips and the style; the source never touches axios.
          expectConstant(benchmark, "requests", 4);
        }
      } finally {
        app.unmount();
      }
    },
  );
});
