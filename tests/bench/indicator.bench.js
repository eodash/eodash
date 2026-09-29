/**
 * The static-mode baseline the other journeys are read against: selecting an
 * indicator end to end.
 *
 * A journey rather than a unit, because one call drives five stages that only
 * meet here: the collection fetch, one collection object per child, the
 * datetime written back into the ref being watched, the layer build over every
 * collection, and the widget gates re-evaluating. This boots the real expert
 * template, so the widgets are part of what is measured. That is the point.
 */
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { buildCatalog } from "../support/catalog";
import {
  defineBenchmark,
  bootBench,
  expectDistinct,
  expectConstant,
  reportMetrics,
  runBenchmark,
  TEST_TIMEOUT,
  waitUntil,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const INDICATOR_ID = "multi";
const RESET_INDICATOR_ID = "neutral";

/**
 * Three children on the subject so the fan-out is real, one on the reset target
 * so resetting stays cheap, and distinct extents so each selection is a genuine
 * state change.
 */
const catalog = buildCatalog([
  { id: INDICATOR_ID, children: 3 },
  { id: RESET_INDICATOR_ID, bbox: [20, 10, 30, 20] },
]);

describe("expert indicator selection", () => {
  test(
    "loads a multi-collection indicator and its widgets",
    { timeout: TEST_TIMEOUT },
    async (ctx) => {
      const {
        app,
        query,
        store,
        served,
        getLayerId,
        isOnMap,
        readLedgerEntry,
      } = await bootBench(axiosMock, catalog, { template: "expert" });

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
      /** @param {string} id */
      const pick = (id) =>
        page
          .elementLocator(document.querySelector("eox-itemfilter"))
          .getByText(id, { exact: true })
          .element()
          .click();

      /** @param {string} id */
      const isSelected = (id) => Boolean(getLayerId()?.startsWith(id));

      await openPicker();
      await pick(INDICATOR_ID);
      await waitUntil(
        () => isOnMap(() => isSelected(INDICATOR_ID)),
        "the indicator never rendered",
      );

      const selection = defineBenchmark(ctx, "select indicator", {
        // Land on the plain indicator, then reopen so the act is one click.
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
          pick(INDICATOR_ID);
        },
        isFinished: () => isOnMap(() => isSelected(INDICATOR_ID)),
        record: readLedgerEntry,
      });

      try {
        await runBenchmark(selection);
        await reportMetrics(selection);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        expectConstant(selection, "layers", 3);
        expectDistinct(selection, "identity");

        // Mirrors `boot.test.js :: selecting an indicator renders its layers and
        // gated widgets`, so this benchmark and that test cannot drift apart.
        expect(store.selectedStac?.id).toBe(INDICATOR_ID);
        expect(query("eox-layercontrol")).toBeTruthy();
        expect(query("eox-stacinfo")).toBeTruthy();
      } finally {
        app.unmount();
      }
    },
  );
});
