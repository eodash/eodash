/**
 * The only flow that builds the observation-points layer, which deep-clones the
 * collection's links, turns every `child` link carrying `latlng` into a feature,
 * and generates an SVG icon per theme. A locations collection has no items, so
 * the points layer is the group's only layer, and this measures that
 * construction and nothing else.
 *
 * Selection only. Clicking a marker needs a process widget whose drawtools
 * attach a select interaction, so that half is not a map flow.
 */
import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
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

const POIS = "pois";
const RESET_INDICATOR_ID = "neutral";
/** The layer `getObservationPointsLayer` builds. */
const POINTS = "geodb-collection";

/**
 * Twenty observation points. They need no routes of their own: only the link
 * properties are read to build features, and a location is fetched only when
 * its marker is clicked.
 */
const LOCATIONS = Array.from({ length: 20 }, (_, index) => `loc-${index}`);

const catalog = buildCatalog([
  { id: RESET_INDICATOR_ID },
  { id: POIS, locations: LOCATIONS },
]);

describe("POI indicator selection", () => {
  test(
    "selecting a POI indicator builds the observation points layer",
    { timeout: TEST_TIMEOUT },
    async ({ bench }) => {
      const { app, served, getLayerId, isOnMap, readLedgerEntry } =
        await bootBench(axiosMock, catalog);

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

      const hasPoints = () => getLayerId() === POINTS;

      await openPicker();
      await pick(POIS);
      await waitUntil(
        () => isOnMap(hasPoints),
        "the observation points layer never rendered",
      );

      const selection = defineBenchmark(bench, "poi selection", {
        reset: async () => {
          await openPicker();
          await pick(RESET_INDICATOR_ID);
          await waitUntil(
            () =>
              isOnMap(() =>
                Boolean(getLayerId()?.startsWith(RESET_INDICATOR_ID)),
              ),
            "the reset never landed on the plain indicator",
          );
          await openPicker();
        },
        act: () => {
          pick(POIS);
        },
        isFinished: () => isOnMap(hasPoints),
        record: readLedgerEntry,
      });

      try {
        await runBenchmark(selection);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        expectConstant(selection, "id", POINTS);
        // The points layer is the only one: a locations collection has no items.
        expectConstant(selection, "layers", 1);
        expectDistinct(selection, "identity");
      } finally {
        app.unmount();
      }
    },
  );
});
