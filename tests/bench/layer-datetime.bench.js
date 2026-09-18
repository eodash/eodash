/**
 * Changing one layer's date from the layer control. It replaces a single layer
 * and lets eox-map diff the source underneath, where the global date rebuilds
 * every collection, so only this can tell whether the single-layer path stays
 * single.
 *
 * The control's debounce is a prop now, so the bench passes `0` and measures the
 * work rather than the wait; the app keeps its 500ms default.
 */
import { describe, expect, test, vi } from "vitest";
import { buildCatalog, DATES } from "../support/catalog";
import { MAP_ONLY } from "../support/template";
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

const INDICATOR = "single";

const catalog = buildCatalog([{ id: INDICATOR }]);

/** The map plus the control under test, with its debounce removed. */
const MAP_AND_CONTROL = {
  ...MAP_ONLY,
  widgets: [
    {
      id: "Layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: 0, y: 1, w: "3/3/2", h: 10 },
      widget: {
        name: "EodashLayerControl",
        properties: { datetimeDebounce: 0 },
      },
    },
  ],
};

describe("layer control datetime", () => {
  test(
    "changing one layer's date replaces only that layer",
    { timeout: TEST_TIMEOUT },
    async ({ bench }) => {
      const {
        app,
        query,
        store,
        served,
        getLayerId,
        isOnMap,
        readLedgerEntry,
      } = await bootBench(axiosMock, catalog, {
        template: "bench",
        over: { templates: { bench: MAP_AND_CONTROL } },
      });

      await store.loadSelectedSTAC(catalog.hrefOf(INDICATOR));
      await waitUntil(
        () => isOnMap(() => Boolean(getLayerId())),
        "the indicator never rendered",
      );
      await waitUntil(
        () => Boolean(query("eox-layercontrol")),
        "the layer control never mounted",
      );

      /**
       * The event `eox-layercontrol` emits when a layer's date is changed. The
       * control renders its own datetime tab inside a third-party shadow root,
       * so this is the closest door the app owns.
       *
       * @param {string} datetime
       */
      const setLayerDate = (datetime) =>
        query("eox-layercontrol").dispatchEvent(
          new CustomEvent("datetime:updated", {
            detail: {
              layer: query("eox-map").getLayerById(getLayerId()),
              datetime,
            },
          }),
        );

      const newest = getLayerId();
      setLayerDate(DATES[0]);
      await waitUntil(
        () => isOnMap(() => getLayerId() !== newest),
        "the layer date never moved",
      );
      const oldest = getLayerId();
      setLayerDate(DATES[2]);
      await waitUntil(
        () => isOnMap(() => getLayerId() === newest),
        "the layer date never came back",
      );

      const single = defineBenchmark(bench, "layer datetime", {
        reset: async () => {
          setLayerDate(DATES[0]);
          await waitUntil(
            () => isOnMap(() => getLayerId() === oldest),
            "the reset never returned to the oldest date",
          );
        },
        act: () => {
          setLayerDate(DATES[2]);
        },
        isFinished: () => isOnMap(() => getLayerId() === newest),
        record: readLedgerEntry,
      });

      try {
        await runBenchmark(single);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        expectConstant(single, "id", newest);
        expectConstant(single, "layers", 1);
        expectDistinct(single, "identity");
        // Only the analysis group is rebuilt; the base layers are passed through.
        expectConstant(single, "baseLayers");
      } finally {
        app.unmount();
      }
    },
  );
});
