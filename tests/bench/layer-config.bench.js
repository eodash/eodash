/**
 * The zarr door of the bands editor, where eodash rebuilds the `GeoZarr`
 * source: the only client-side source reconstruction in the app.
 *
 * `@eox/layercontrol` throttles a `style` change by 100ms; the reset waits it
 * out. `isFloored: false`: the rebuild is under the 10ms floor.
 */
import { describe, expect, test, vi } from "vitest";
import { buildCatalog } from "../support/catalog";
import {
  bandsOf,
  INDICATOR_ID,
  openBandsEditor,
  style,
  zarrAsset,
  zarrAssetName,
} from "../support/bands";
import {
  defineBenchmark,
  expectConstant,
  expectDistinct,
  runBenchmark,
  TEST_TIMEOUT,
  waitUntil,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const STYLE_ROUTE = "/geozarr-style.json";

describe("geozarr bands", () => {
  test(
    "dragging a band rebuilds the source",
    { timeout: TEST_TIMEOUT },
    async ({ bench }) => {
      const catalog = buildCatalog([
        { id: INDICATOR_ID, links: [], assets: { [zarrAssetName]: zarrAsset } },
      ]);
      catalog.routes[`/c/${INDICATOR_ID}.json`].links.push({
        rel: "style",
        href: STYLE_ROUTE,
        type: "application/json",
        "asset:keys": [zarrAssetName],
      });
      catalog.routes[STYLE_ROUTE] = style;

      const { app, query, served, getLayerId, readLedgerEntry, dropOnRed } =
        await openBandsEditor(axiosMock, catalog);

      // `updateGeoZarrBands` writes the new bands onto this object before
      // swapping the source, so reading it is how the act is seen to land.
      const source = query("eox-map")
        .getLayerById(getLayerId())
        .get("_jsonDefinition").source;
      const [red, otherRed] = bandsOf(style.jsonform?.properties?.bands);
      const isOnRed = (/** @type {string} */ band) => source.bands[0] === band;

      dropOnRed(otherRed);
      await waitUntil(() => isOnRed(otherRed), "the first drag never landed");

      const benchmark = defineBenchmark(bench, "geozarr bands", {
        reset: async () => {
          dropOnRed(otherRed);
          await waitUntil(() => isOnRed(otherRed), "the reset never landed");
          // Past the control's throttle, so the act is a leading-edge call.
          await new Promise((resolve) => setTimeout(resolve, 100));
        },
        act: () => dropOnRed(red),
        isFinished: () => isOnRed(red),
        record: readLedgerEntry,
        isFloored: false,
      });

      try {
        await runBenchmark(benchmark);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        expectConstant(benchmark, "layers", 1);
        // A new source every iteration. Guards the bands-switching bug, where a
        // shared array reference made the equality check short-circuit and the
        // source silently never updated.
        expectDistinct(benchmark, "identity");
      } finally {
        app.unmount();
      }
    },
  );
});
