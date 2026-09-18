/**
 * Selecting an indicator whose child
 * collection mirrors its items from a parquet rather than carrying item links.
 *
 * The largest app-side cost in the tier — hyparquet decodes every column, then
 * one `Blob` and object URL per row, then a sort. No request count moves when
 * this changes, because the items are read over native `fetch` from `blob:`
 * URLs rather than axios.
 *
 * A real 2496-row mirror from the test catalog. Its `xyz` links point at live
 * TiTiler and are answered by the local tile.
 */
import { describe, expect, test, vi } from "vitest";
import { commands, page } from "vitest/browser";
import { buildCatalog } from "../support/catalog";
import {
  defineBenchmark,
  bootBench,
  expectDistinct,
  expectConstant,
  runBenchmark,
  TEST_TIMEOUT,
  waitUntil,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const MIRRORED = "mirrored";
const RESET_INDICATOR_ID = "neutral";
const MIRROR_FILE = "/tests/support/assets/mirror.parquet";
/** Where the mirror's `xyz` links point. */
const TILE_ROUTE = "openveda.cloud/api/raster/cog/tiles";

const catalog = buildCatalog([
  { id: RESET_INDICATOR_ID },
  { id: MIRRORED, mirror: MIRROR_FILE },
]);

// The same bytes on both doors: vite serves the file itself, and the axios
// route holds it as an ArrayBuffer because `readParquetItems` asks for
// `responseType: "arraybuffer"` while `serveByPath` ignores the request config.
// Which door the app takes is then not what decides whether this row runs.
catalog.routes[MIRROR_FILE] = await fetch(MIRROR_FILE).then((response) =>
  response.arrayBuffer(),
);

describe("parquet-mirrored selection", () => {
  test(
    "selecting a mirrored indicator decodes its items and builds a layer",
    { timeout: TEST_TIMEOUT },
    async ({ bench }) => {
      const { app, store, served, getLayerId, isOnMap, readLedgerEntry } =
        await bootBench(axiosMock, catalog);
      await commands.serveFiles({
        [TILE_ROUTE]: "tests/support/assets/tile.png",
      });

      // In-page like `pick`: this runs in the reset, and an awaited CDP round
      // trip there unclamps the poll the timed window depends on.
      const openPicker = async () => {
        page
          .getByRole("button", { name: "Select indicator" })
          .element()
          .click();
        await waitUntil(
          () => Boolean(document.querySelector("eox-itemfilter")),
          "the indicator picker never opened",
        );
      };
      /**
       * In-page, not `userEvent`: a CDP click adds floor and unclamps the poll
       * {@link waitUntil} depends on. Scoped to the picker, because the layer
       * control renders the same title once an indicator is selected.
       * @param {string} id
       */
      const pick = (id) =>
        page
          .elementLocator(document.querySelector("eox-itemfilter"))
          .getByText(id, { exact: true })
          .element()
          .click();

      /** @param {string} id */
      const isSelected = (id) => Boolean(getLayerId()?.startsWith(id));

      await openPicker();
      await pick(MIRRORED);
      await waitUntil(
        () => isOnMap(() => isSelected(MIRRORED)),
        "the mirrored indicator never rendered",
      );

      const selection = defineBenchmark(bench, "mirrored selection", {
        // Land on a plain indicator, then reopen the picker so the act is one
        // click. The reset also revokes the previous run's object URLs, which
        // is real work and belongs outside the window.
        reset: async () => {
          await openPicker();
          await pick(RESET_INDICATOR_ID);
          await waitUntil(
            () => isOnMap(() => isSelected(RESET_INDICATOR_ID)),
            "the reset never landed on the plain indicator",
          );
          await openPicker();
        },
        act: () => {
          pick(MIRRORED);
        },
        isFinished: () => isOnMap(() => isSelected(MIRRORED)),
        record: readLedgerEntry,
      });

      try {
        await runBenchmark(selection);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        // The indicator, its child, and the parquet. The item itself is a blob
        // fetch, so it never reaches the mock.
        expectConstant(selection, "requests", 3);
        expectConstant(selection, "layers", 1);
        expectDistinct(selection, "identity");
        expect(store.selectedStac?.id).toBe(MIRRORED);
      } finally {
        await commands.stopServingFiles();
        app.unmount();
      }
    },
  );
});
