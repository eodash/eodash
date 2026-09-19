/**
 * Moving the global date once an
 * indicator is already rendered.
 *
 * The date-only rebuild loops the collections **sequentially**, one item fetch
 * each, so the cost is N round trips in series. No request count can see that —
 * a fetch added per collection costs N times its latency, and parallelising the
 * loop shows as a drop, while the count is identical either way.
 */
import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
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

/** The top of what a real indicator carries; the loop over them is the cost. */
const CHILDREN = 6;
const INDICATOR = "snap";

const catalog = buildCatalog([{ id: INDICATOR, children: CHILDREN }]);

describe("global date snap", () => {
  test(
    "moving the date rebuilds all six collections' layers",
    { timeout: TEST_TIMEOUT },
    async ({ bench }) => {
      const { app, query, served, getLayerId, isOnMap, readLedgerEntry } =
        await bootBench(axiosMock, catalog);

      /**
       * A real click on the app's own button, in-page. `userEvent.click` drives
       * the same handler but over a CDP round trip, which measured 49.7ms min
       * and ±53% rme on a flow that costs ~28ms — the driver, not the app.
       * @param {string} id
       */
      const click = (id) => query(id).click();

      // Select the indicator the way the toolbar does.
      await userEvent.click(
        page.getByRole("button", { name: "Select indicator" }),
      );
      await userEvent.click(page.getByText(INDICATOR, { exact: true }));
      await waitUntil(
        () => isOnMap(() => Boolean(getLayerId())),
        "the indicator never rendered",
      );
      await waitUntil(
        () => Boolean(query("#eodash-date-oldest")),
        "the date picker never mounted",
      );

      // Selecting lands on the newest date, so that id is the act's target;
      // learn the other end by jumping there once.
      const newest = getLayerId();
      click("#eodash-date-oldest");
      await waitUntil(
        () => isOnMap(() => getLayerId() !== newest),
        "the date never moved",
      );
      const oldest = getLayerId();

      // Leave setup where the act leaves the app, or the first reset has
      // nothing to do and records zero fetches where every other records six.
      click("#eodash-date-newest");
      await waitUntil(
        () => isOnMap(() => getLayerId() === newest),
        "the date never came back",
      );

      /** The id the act started from, so a reset that did not hold is visible. */
      let from = "";
      // The act's own count is `requests`; the reset's is only visible here, and
      // both halves matter because the total alternates 17/17/2.
      let onReset = 0;

      const snap = defineBenchmark(bench, "date snap", {
        reset: async () => {
          const atStart = axiosMock.get.mock.calls.length;
          click("#eodash-date-oldest");
          await waitUntil(
            () => isOnMap(() => getLayerId() === oldest),
            "the reset never returned to the oldest date",
          );
          onReset = axiosMock.get.mock.calls.length - atStart;
        },
        act: () => {
          from = getLayerId();
          click("#eodash-date-newest");
        },
        isFinished: () => isOnMap(() => getLayerId() === newest),
        record: () => ({ ...readLedgerEntry(), from, onReset }),
        isFloored: false,
      });

      try {
        await runBenchmark(snap);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        // Every iteration travelled the same distance, across every collection,
        // and built a new layer rather than finding one already there.
        expectConstant(snap, "from", oldest);
        expectConstant(snap, "id", newest);
        expectConstant(snap, "layers", CHILDREN);
        expectDistinct(snap, "identity");
        // Only the analysis group is rebuilt; the base layers are passed through.
        expectConstant(snap, "baseLayers");
        // One item fetch per collection, on each side. Pinned because a wait
        // that starves the app's timers batches the work into bursts and leaves
        // the act reading ~1ms while the totals still look right.
        expectConstant(snap, "onReset", CHILDREN);
        expectConstant(snap, "requests", CHILDREN);
      } finally {
        app.unmount();
      }
    },
  );
});
