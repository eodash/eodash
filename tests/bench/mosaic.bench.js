/**
 * Scrubbing the mosaic time range. Every scrub rebuilds the one mosaic layer:
 * a 300ms debounce of eodash's own, then the render preset encoded onto a
 * TiTiler tilejson request, the dates re-read, and the AnalysisGroup replaced.
 * The tilejson route echoes the query into the tile url, so each scrub is a
 * distinct source rather than a no-op in eox-map.
 *
 * The template is sentinel-explorer's `mosaic` without its `loading` widget,
 * a script off a CDN, and without the vnode hooks that belong to entering and
 * leaving the view.
 */
import { mdiMapSearch } from "@mdi/js";
import { fromLonLat } from "ol/proj";
import { describe, expect, test, vi } from "vitest";
import { buildCatalog, BBOX, DATES, xyzLink } from "../support/catalog";
import { MAP_ONLY } from "../support/template";
import {
  defineBenchmark,
  bootBench,
  expectConstant,
  expectDistinct,
  reportMetrics,
  runBenchmark,
  TEST_TIMEOUT,
  waitUntil,
} from "../support/bench";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

const INDICATOR_ID = "mosaicked";
const RASTER_ENDPOINT = `${globalThis.location.origin}/raster`;
const TILEJSON_ROUTE = `/collections/${INDICATOR_ID}/WebMercatorQuad/tilejson.json`;

/**
 * `updateMosaicLayer` sends a single day as `YYYY-MM-DD`.
 * @param {string} iso
 */
const day = (iso) => iso.slice(0, 10);
// Two days apart, so neither url contains the other's day.
const RANGE_A = [DATES[0], DATES[0]];
const RANGE_B = [DATES[2], DATES[2]];

/** The only render preset in any config, `sentinel-explorer.js:129-139`. */
const renders = {
  [INDICATOR_ID]: {
    true_color: {
      title: "True Color",
      assets: ["reflectance|bands=b04,b03,b02"],
      rescale: [[0, 0.5]],
      nodata: 0,
      color_formula: "gamma rgb 1.3, sigmoidal rgb 6 0.1, saturation 1.2",
    },
  },
};

const MOSAIC = {
  background: {
    id: "background-map",
    type: "internal",
    widget: {
      name: "EodashMap",
      properties: {
        zoomToExtent: false,
        enableCompare: true,
        btns: {
          enableZoom: true,
          enableExportMap: true,
          enableChangeProjection: true,
          enableCompareIndicators: {
            fallbackTemplate: "explore",
            compareTemplate: "compare",
            itemFilterConfig: { imageProperty: "assets.thumbnail.href" },
          },
          enableBackToPOIs: false,
          enableSearch: false,
        },
        baseLayers: MAP_ONLY.background.widget.properties.baseLayers,
      },
    },
  },
  widgets: [
    {
      id: "mosaic-layercontrol",
      type: "internal",
      title: "Layers",
      layout: { x: 0, y: 0, w: "3/3/2", h: 7 },
      widget: {
        name: "EodashLayerControl",
        properties: { layoutTarget: "explore", layoutIcon: mdiMapSearch },
      },
    },
    {
      /** @param {unknown} selectedSTAC */
      defineWidget: (selectedSTAC) =>
        selectedSTAC
          ? {
              id: "Information",
              title: "Information",
              layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 8 },
              type: "internal",
              widget: {
                name: "EodashStacInfo",
                properties: {
                  level: "collection",
                  body: ["description"],
                  featured: [
                    "satellite",
                    "sensor",
                    "agency",
                    "extent",
                    "providers",
                    "assets",
                    "links",
                  ],
                },
              },
            }
          : null,
    },
    {
      /** @param {unknown} selectedSTAC */
      defineWidget: (selectedSTAC) =>
        selectedSTAC
          ? {
              id: "mosaic-datetime",
              type: "internal",
              layout: { x: 1, y: 8, w: 10, h: 4 },
              title: "Time Slider",
              widget: {
                name: "EodashTimeSlider",
                properties: {
                  clustering: true,
                  style: "padding:12px",
                  animate: true,
                  useMosaic: true,
                  mosaicIndicators: [INDICATOR_ID],
                  filters: [
                    {
                      key: "eo:cloud_cover",
                      title: "Cloud Coverage %",
                      type: "range",
                      expanded: true,
                      min: 0,
                      max: 100,
                      step: 5,
                      state: { min: 0, max: 100 },
                    },
                  ],
                },
              },
            }
          : null,
    },
  ],
};

const AGGREGATION_ROUTE = `/aggregations/${INDICATOR_ID}.json`;

const catalog = buildCatalog([{ id: INDICATOR_ID }]);
/** @param {string} url */
catalog.routes[TILEJSON_ROUTE] = (url) => ({
  tiles: [`${xyzLink().href}?${new URL(url).searchParams}&z={z}&x={x}&y={y}`],
});
catalog.routes["/assets"] = [];
catalog.routes[`/collections/${INDICATOR_ID}.json`].links.push({
  rel: "pre-aggregation",
  "aggregation:interval": "daily",
  href: `${globalThis.location.origin}/stac${AGGREGATION_ROUTE}`,
});
catalog.routes[AGGREGATION_ROUTE] = {
  type: "AggregationCollection",
  aggregations: [
    {
      key: "datetime_frequency",
      interval: "day",
      buckets: DATES.map((date) => ({ key: date, value: 1 })),
    },
  ],
};

describe("mosaic", () => {
  test(
    "scrubbing the time range rebuilds the mosaic layer",
    { timeout: TEST_TIMEOUT },
    async (ctx) => {
      const { app, query, store, served, isOnMap, readLedgerEntry } =
        await bootBench(axiosMock, catalog, {
          template: "mosaic",
          rasterEndpoint: RASTER_ENDPOINT,
          over: { templates: { mosaic: MOSAIC }, options: { renders } },
        });

      // No picker in this template: the view force-loads its collection.
      await store.loadSelectedSTAC(catalog.hrefOf(INDICATOR_ID));
      await waitUntil(
        () => Boolean(query("eox-timecontrol")),
        "the time slider never mounted",
      );
      // The mosaic only renders zoomed in, as the view's hint tells the user.
      const view = query("eox-map").map.getView();
      view.setCenter(
        fromLonLat([(BBOX[0] + BBOX[2]) / 2, (BBOX[1] + BBOX[3]) / 2]),
      );
      view.setZoom(9);

      const mosaicUrl = () =>
        query("eox-map")
          .getLayerById(`${INDICATOR_ID};:;mosaic`)
          ?.getSource()
          ?.getUrls()?.[0] ?? "";
      /** @param {string[]} range */
      const isOn = (range) => mosaicUrl().includes(day(range[0]));

      /** The event the control emits on a drag. @param {string[]} date */
      const scrub = (date) =>
        query("eox-timecontrol").dispatchEvent(
          new CustomEvent("select", { detail: { date, selectedItems: {} } }),
        );

      /** Every data-in-view check so far; a render schedules one 300ms later. */
      const assetChecks = () =>
        axiosMock.get.mock.calls
          .map(([url]) => url)
          .filter((url) => url.includes("/assets?"));
      /**
       * The check carries the query, so a range's own check is told apart
       * from the other range's.
       * @param {string[]} range
       */
      const checksOn = (range) =>
        assetChecks().filter((url) => url.includes(day(range[0]))).length;

      /**
       * Scrub and wait until the new layer is on the map, then until the
       * scrub's data-in-view check has run, so it lands here and not in the
       * act's window.
       * @param {string[]} range
       * @param {string} reason
       */
      const scrubAndSettle = async (range, reason) => {
        const checks = checksOn(range);
        scrub(range);
        await waitUntil(() => isOnMap(() => isOn(range)), reason);
        await waitUntil(
          () => checksOn(range) > checks,
          "the data-in-view check never ran",
        );
      };

      // The selection re-renders the mosaic with the slider's own range and
      // would overwrite a scrub: wait for that render, then for the
      // data-in-view check it schedules.
      await waitUntil(
        () => isOnMap(() => Boolean(mosaicUrl())),
        "the mosaic never rendered",
      );
      const settled = assetChecks().length;
      await waitUntil(
        () => assetChecks().length > settled,
        "the selection's data-in-view check never ran",
      );
      // Where the act leaves the app, so the first reset is a real change.
      await scrubAndSettle(RANGE_B, "the first scrub never landed");

      let checksBeforeAct = 0;
      const benchmark = defineBenchmark(ctx, "mosaic scrub", {
        reset: async () => {
          await waitUntil(
            () => checksOn(RANGE_B) > checksBeforeAct,
            "the act's data-in-view check never ran",
          );
          await scrubAndSettle(RANGE_A, "the reset never landed");
        },
        act: () => {
          checksBeforeAct = checksOn(RANGE_B);
          scrub(RANGE_B);
        },
        isFinished: () => isOnMap(() => isOn(RANGE_B)),
        record: () => ({ ...readLedgerEntry(), url: mosaicUrl() }),
      });

      try {
        await runBenchmark(benchmark);
        await reportMetrics(benchmark);

        expect(served.unmatched, "a fixture route is missing").toEqual([]);
        // The mosaic is the group's only layer, its source new every scrub.
        expectConstant(benchmark, "layers", 1);
        expectDistinct(benchmark, "identity");
        expectConstant(benchmark, "url");
      } finally {
        app.unmount();
      }
    },
  );
});
