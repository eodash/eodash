import { beforeEach, describe, expect, test, vi } from "vitest";
import { createApp } from "vue";
import { createPinia, setActivePinia } from "pinia";
import {
  checkMosaicDataInView,
  normalizeGlobeZoom,
  updateMosaicLayer,
  useMosaicState,
} from "@/eodashSTAC/mosaic";
import { useSTAcStore } from "@/store/stac";
import {
  datetime,
  indicator,
  isGlobe,
  mapEl,
  mapPosition,
} from "@/store/states";
import { eodashCollections } from "@/utils/states";
import { eodashKey } from "@/utils/keys";
import { provideEodashInstance } from "@/composables";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

// createMosaicLayers calls useEodash(); satisfy the module singleton without
// mounting by injecting through an app context.
const eodashConfig = /** @type {any} */ ({ id: "test" });
const providerApp = createApp({});
providerApp.provide(eodashKey, eodashConfig);
providerApp.runWithContext(() => provideEodashInstance());

// One pinia for the whole file: useMosaicState is a shared composable whose
// mosaicEndpoint computed captures the store from its first invocation.
setActivePinia(createPinia());
const store = useSTAcStore();
const state = useMosaicState();

const RENDERS = {
  first: { assets: ["b04"], rescale: [0, 100], tilesize: 256 },
  second: { assets: ["b08"] },
};

const ENDPOINT =
  "https://raster/collections/coll/WebMercatorQuad/tilejson.json";

/** @returns {URL} The tilejson URL of the last axios.get call. */
const lastRequestedUrl = () => new URL(axiosMock.get.mock.calls.at(-1)?.[0]);

describe("mosaic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    axiosMock.get.mockReset();
    store.selectedStac = null;
    store.rasterEndpoint = null;
    state.latestLayer.value = null;
    state.query.value = null;
    state.isItemView.value = false;
    state.visibilityThreshold.value = 8;
    state.hasDataInView.value = true;
    indicator.value = "ind";
    isGlobe.value = false;
    mapEl.value = null;
    mapPosition.value = [0, 0, 10];
    datetime.value = "2023-06-15T00:00:00.000Z";
    eodashCollections.splice(0);
  });

  describe("updateMosaicLayer", () => {
    test("warns and renders nothing without a render preset", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      store.selectedStac = /** @type {any} */ ({ id: "coll" });

      await updateMosaicLayer(ENDPOINT, {});

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("No render preset"),
      );
      expect(axiosMock.get).not.toHaveBeenCalled();
      expect(state.latestLayer.value).toBeNull();
    });

    test("builds the tile layer from the first render preset only", async () => {
      store.selectedStac = /** @type {any} */ ({
        id: "coll",
        renders: RENDERS,
      });
      mapEl.value = /** @type {any} */ ({ layers: [] });
      axiosMock.get.mockResolvedValue({
        data: { tiles: ["https://tiles/{z}/{x}/{y}"] },
      });

      await updateMosaicLayer(ENDPOINT, {});

      const params = lastRequestedUrl().searchParams;
      expect(params.get("assets")).toBe("b04");
      expect(params.get("tilesize")).toBe("256");
      expect([...params.values()]).not.toContain("b08");

      const layer = /** @type {any} */ (state.latestLayer.value);
      expect(layer.source.url).toBe("https://tiles/{z}/{x}/{y}");
      expect(layer.properties.id).toBe("ind;:;mosaic");
      expect(layer.minZoom).toBe(8);
      // Written into the AnalysisGroup and reassigned onto the map.
      expect(mapEl.value.layers[0].properties.id).toBe("AnalysisGroup");
      expect(mapEl.value.layers[0].layers).toEqual([layer]);
    });

    test("collapses an equal-day time range to a single datetime", async () => {
      store.selectedStac = /** @type {any} */ ({
        id: "coll",
        renders: RENDERS,
      });
      axiosMock.get.mockResolvedValue({ data: { tiles: ["https://t"] } });

      await updateMosaicLayer(ENDPOINT, {
        timeRange: ["2023-06-15T00:00:00Z", "2023-06-15T23:59:00Z"],
      });

      expect(lastRequestedUrl().searchParams.get("datetime")).toBe(
        "2023-06-15",
      );
      expect(state.query.value).toEqual({ datetime: "2023-06-15" });
    });

    test("sends a from/to datetime for a multi-day range", async () => {
      store.selectedStac = /** @type {any} */ ({
        id: "coll",
        renders: RENDERS,
      });
      axiosMock.get.mockResolvedValue({ data: { tiles: ["https://t"] } });

      await updateMosaicLayer(ENDPOINT, {
        timeRange: ["2023-06-15T00:00:00Z", "2023-06-20T00:00:00Z"],
      });

      expect(lastRequestedUrl().searchParams.get("datetime")).toBe(
        "2023-06-15/2023-06-20",
      );
    });

    test("translates filters into a cql2-text filter param", async () => {
      store.selectedStac = /** @type {any} */ ({
        id: "coll",
        renders: RENDERS,
      });
      axiosMock.get.mockResolvedValue({ data: { tiles: ["https://t"] } });

      await updateMosaicLayer(ENDPOINT, {
        filters: /** @type {any} */ ({
          cloud: {
            key: "properties.eo:cloud_cover",
            type: "range",
            state: { min: 5, max: 20 },
            min: 0,
            max: 100,
          },
        }),
      });

      const params = lastRequestedUrl().searchParams;
      expect(params.get("filter")).toBe(
        '"eo:cloud_cover" >= 5 AND "eo:cloud_cover" <= 20',
      );
      expect(params.get("filter-lang")).toBe("cql2-text");
    });

    test("warns and keeps no layer when the TileJSON has no tile url", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      store.selectedStac = /** @type {any} */ ({
        id: "coll",
        renders: RENDERS,
      });
      axiosMock.get.mockResolvedValue({ data: {} });

      await updateMosaicLayer(ENDPOINT, {});

      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("No tile URL found"),
      );
      expect(state.latestLayer.value).toBeNull();
    });
  });

  describe("normalizeGlobeZoom", () => {
    test("passes the raw value through in 2D", () => {
      expect(normalizeGlobeZoom(42)).toBe(42);
    });

    test("converts globe altitude via the eox-map formula", () => {
      isGlobe.value = true;
      mapEl.value = /** @type {any} */ ({ globeConfig: {} });
      expect(normalizeGlobeZoom(21_050_000)).toBe(2);

      mapEl.value = /** @type {any} */ ({ globeConfig: { useHighLOD: true } });
      expect(normalizeGlobeZoom(21_050_000)).toBe(1);
    });
  });

  describe("checkMosaicDataInView", () => {
    const seedEndpoint = () => {
      store.rasterEndpoint = "https://raster";
      store.selectedStac = /** @type {any} */ ({ id: "coll" });
    };

    test("assumes data below the visibility threshold without a request", async () => {
      seedEndpoint();
      mapEl.value = /** @type {any} */ ({ lonLatExtent: [0, 0, 1, 1] });
      mapPosition.value = [0, 0, 4];
      state.hasDataInView.value = false;

      await checkMosaicDataInView();

      expect(state.hasDataInView.value).toBe(true);
      expect(axiosMock.get).not.toHaveBeenCalled();
    });

    test("queries the bbox assets endpoint with the active mosaic query", async () => {
      seedEndpoint();
      mapEl.value = /** @type {any} */ ({ lonLatExtent: [0, 0, 1, 1] });
      state.query.value = { filter: "cloud <= 20", "filter-lang": "cql2-text" };
      axiosMock.get.mockResolvedValue({ data: [] });

      await checkMosaicDataInView();

      const url = new URL(axiosMock.get.mock.calls[0][0]);
      expect(url.pathname).toBe("/collections/coll/bbox/0,0,1,1/assets");
      expect(url.searchParams.get("limit")).toBe("1");
      expect(url.searchParams.get("filter")).toBe("cloud <= 20");
      expect(state.hasDataInView.value).toBe(false);
    });

    test("keeps data-in-view true when assets exist or the request fails", async () => {
      seedEndpoint();
      mapEl.value = /** @type {any} */ ({ lonLatExtent: [0, 0, 1, 1] });

      axiosMock.get.mockResolvedValue({ data: [{ asset: "a" }] });
      await checkMosaicDataInView();
      expect(state.hasDataInView.value).toBe(true);

      state.hasDataInView.value = false;
      axiosMock.get.mockRejectedValue(new Error("network"));
      await checkMosaicDataInView();
      expect(state.hasDataInView.value).toBe(true);
    });
  });
});
