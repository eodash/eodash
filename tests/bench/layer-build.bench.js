/**
 * How the layer build scales with the number of layers one collection
 * contributes. The shape of the curve is the finding: superlinear is a defect
 * no single-size measurement can see.
 *
 * Size is driven by how many `xyz` links one item carries, so the number of
 * round trips is identical at every size and the intercept is shared. Those
 * layers are built but not drawn: their tiles would load after the window
 * closes, during the next iteration. What a drawn layer costs is
 * `layer-render.bench.js`.
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
  reportMetrics,
  TEST_TIMEOUT,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const RESET_INDICATOR_ID = "neutral";
/** Real catalogs carry single digits; 100 is where the curve can show. */
const SIZES = [1, 10, 100];

/**
 * Padded, or `sub-1` prefixes `sub-10` and a `startsWith` predicate lies.
 * @param {number} n
 */
const getCollectionId = (n) => `sub-${String(n).padStart(4, "0")}`;

const catalog = buildCatalog([
  { id: RESET_INDICATOR_ID },
  ...SIZES.map((n) => ({
    id: getCollectionId(n),
    links: xyzLinks(n).map((link) => ({ ...link, roles: ["invisible"] })),
  })),
]);

describe("layer construction", () => {
  test(
    "scales with the number of layers a collection contributes",
    { timeout: TEST_TIMEOUT },
    async (ctx) => {
      const { app, served, createSelectionSpec } = await bootBench(
        axiosMock,
        catalog,
        {
          template: "bench",
          over: { templates: { bench: MAP_ONLY } },
        },
      );

      const benchmarks = SIZES.map((n) =>
        defineBenchmark(
          ctx,
          `links=${n}`,
          createSelectionSpec(getCollectionId(n), { from: RESET_INDICATOR_ID }),
        ),
      );

      try {
        await compareBenchmarks(benchmarks);
        await Promise.all(benchmarks.map(reportMetrics));

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        benchmarks.forEach((benchmark, index) => {
          expectConstant(benchmark, "layers", SIZES[index]);
          expectDistinct(benchmark, "identity");
          // Flat across sizes is what makes the curve construction, not latency.
          expectConstant(benchmark, "requests", 3);
        });
      } finally {
        app.unmount();
      }
    },
  );
});
