import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { render } from "vitest-browser-vue";
import { h, nextTick, ref } from "vue";
import { createEodashCollection } from "@eodash/stac";
import {
  checkMosaicDataInView,
  normalizeGlobeZoom,
  updateMosaicLayer,
  useInitMosaic,
  useMosaicState,
  useScheduleMosaicUpdate,
} from "@/eodashSTAC/mosaic";
import { useSTAcStore } from "@/store/stac";
import { datetime, isGlobe, mapEl, mapPosition } from "@/store/states";
import { eodashCollections } from "@/store/stac";
import { provideEodash } from "../../support/fixtures";
import { analysisGroup } from "../../support/layers";
import { stacCollection } from "../../support/stac";

const axiosMock = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/plugins/axios", () => ({ default: axiosMock, axios: axiosMock }));

provideEodash();

// One pinia for the whole file: useMosaicState is a shared composable whose
// mosaicEndpoint computed captures the store from its first invocation.
setActivePinia(createPinia());
const store = useSTAcStore();
const state = useMosaicState();

const RENDERS = {
  first: { assets: ["b04"], rescale: [0, 100], tilesize: 256 },
};

/** @type {import("@/types").ItemFilterFilters} */
const CLOUD_FILTER = {
  cloud: {
    key: "properties.eo:cloud_cover",
    type: "range",
    state: { min: 5, max: 20 },
    min: 0,
    max: 100,
  },
};
const CLOUD_CQL = '"eo:cloud_cover" >= 5 AND "eo:cloud_cover" <= 20';

/** @type {[string, string]} */
const JUNE = ["2023-06-15T00:00:00Z", "2023-06-20T00:00:00Z"];
/** @type {[string, string]} */
const JULY = ["2023-07-15T00:00:00Z", "2023-07-20T00:00:00Z"];

const COLLECTION_URL = "https://cat/collections/coll";
const TILES = "https://tiles/{z}/{x}/{y}";
const ENDPOINT =
  "https://raster/collections/coll/WebMercatorQuad/tilejson.json";

/**
 * Stands in for eox-map with only what the mosaic touches.
 * @param {Record<string, any>} [over]
 * @returns {import("@eox/map").EOxMap}
 */
const fakeMap = (over = {}) =>
  /** @type {any} */ ({
    layers: [],
    globeConfig: {},
    getLayerById: () => undefined,
    ...over,
  });

/** Reads the collection through a reader that knows the raster endpoint. */
const readCollection = () => {
  axiosMock.get.mockImplementation((/** @type {string} */ url) => {
    if (url === COLLECTION_URL) {
      return Promise.resolve({ data: stacCollection({ renders: RENDERS }) });
    }
    if (url.includes("/tilejson.json")) {
      return Promise.resolve({ data: { tiles: [TILES] } });
    }
    return Promise.reject(new Error(`unmocked url ${url}`));
  });
  return createEodashCollection(COLLECTION_URL, {
    client: axiosMock,
    rasterEndpoint: "https://raster",
  });
};

/** Selects the collection the way the store does on load. */
const selectCollection = async () => {
  const reader = await readCollection();
  eodashCollections.splice(0, eodashCollections.length, reader);
  store.selectedStac = reader.stac;
};

/** @returns {string[]} The TileJSON urls requested so far. */
const tileJsonRequests = () =>
  axiosMock.get.mock.calls
    .map(([url]) => url)
    .filter((url) => url.includes("/tilejson.json"));

/** @returns {URL} The TileJSON url requested last. */
const lastRequestedUrl = () => new URL(tileJsonRequests().at(-1) ?? "");

describe("mosaic", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    axiosMock.get.mockReset();
    store.selectedStac = null;
    store.rasterEndpoint = null;
    state.latestLayer.value = null;
    state.query.value = null;
    state.isItemView.value = false;
    state.visibilityThreshold.value = 8;
    state.hasDataInView.value = true;
    isGlobe.value = false;
    mapEl.value = fakeMap();
    mapPosition.value = [0, 0, 10];
    datetime.value = "2023-06-15T00:00:00.000Z";
    eodashCollections.splice(0);
  });

  describe("updateMosaicLayer", () => {
    test("renders nothing without a reader for the selected collection", async () => {
      store.selectedStac = (await readCollection()).stac;

      await updateMosaicLayer(ENDPOINT, {});

      expect(tileJsonRequests()).toEqual([]);
      expect(state.latestLayer.value).toBeNull();
    });

    test("renders the reader's layer into the AnalysisGroup, hidden below the threshold and with its tools open", async () => {
      await selectCollection();

      await updateMosaicLayer(ENDPOINT, {});

      const layer = state.latestLayer.value;
      expect(layer).toMatchObject({
        minZoom: 8,
        properties: { layerControlToolsExpand: true },
        source: { url: TILES },
      });
      expect(analysisGroup(mapEl.value ?? undefined)?.layers).toEqual([layer]);
    });

    /** @type {{ range: string; timeRange: [string, string]; datetime: string }[]} */
    const DATETIME_CASES = [
      {
        range: "an equal-day range",
        timeRange: ["2023-06-15T00:00:00Z", "2023-06-15T23:59:00Z"],
        datetime: "2023-06-15",
      },
      {
        range: "a multi-day range",
        timeRange: JUNE,
        datetime: "2023-06-15/2023-06-20",
      },
    ];

    test.each(DATETIME_CASES)(
      "sends $datetime for $range",
      async ({ timeRange, datetime }) => {
        await selectCollection();

        await updateMosaicLayer(ENDPOINT, { timeRange });

        expect(lastRequestedUrl().searchParams.get("datetime")).toBe(datetime);
        expect(state.query.value).toEqual({ datetime });
      },
    );

    test("keeps the part an update leaves out: the catalog sends no time range, the initial render no filters", async () => {
      await selectCollection();
      await updateMosaicLayer(ENDPOINT, { timeRange: JUNE });

      await updateMosaicLayer(ENDPOINT, { filters: CLOUD_FILTER });
      expect(Object.fromEntries(lastRequestedUrl().searchParams)).toMatchObject(
        {
          datetime: "2023-06-15/2023-06-20",
          filter: CLOUD_CQL,
          "filter-lang": "cql2-text",
        },
      );

      await updateMosaicLayer(ENDPOINT, { timeRange: JULY });
      expect(Object.fromEntries(lastRequestedUrl().searchParams)).toMatchObject(
        { datetime: "2023-07-15/2023-07-20", filter: CLOUD_CQL },
      );
    });

    test("starts from scratch after a reset, so a remounted widget does not inherit the filters", async () => {
      await selectCollection();
      await updateMosaicLayer(ENDPOINT, { filters: CLOUD_FILTER });

      state.query.value = null;
      await updateMosaicLayer(ENDPOINT, { timeRange: JUNE });

      expect(lastRequestedUrl().searchParams.has("filter")).toBe(false);
    });

    test("does not render over an item selected while the mosaic was building", async () => {
      await selectCollection();
      const tileJson = Promise.withResolvers();
      const served = axiosMock.get.getMockImplementation();
      axiosMock.get.mockImplementation((/** @type {string} */ url) =>
        url.includes("/tilejson.json") ? tileJson.promise : served?.(url),
      );

      const rendering = updateMosaicLayer(ENDPOINT, { timeRange: JUNE });
      state.isItemView.value = true;
      tileJson.resolve({ data: { tiles: [TILES] } });
      await rendering;

      expect(analysisGroup(mapEl.value ?? undefined)).toBeUndefined();
    });

    test("hides the layer on the globe right after rendering it below the threshold", async () => {
      const setVisible = vi.fn();
      mapEl.value = fakeMap({ getLayerById: () => ({ setVisible }) });
      isGlobe.value = true;
      // camera altitude equivalent to zoom 2
      mapPosition.value = [0, 0, 21_050_000];
      await selectCollection();

      await updateMosaicLayer(ENDPOINT, {});

      expect(setVisible).toHaveBeenLastCalledWith(false);
    });
  });

  describe("useScheduleMosaicUpdate", () => {
    test("collapses a burst of updates into one render with the last call's query", async () => {
      await selectCollection();
      vi.useFakeTimers();
      const schedule = useScheduleMosaicUpdate();

      schedule(ENDPOINT, ["2023-06-15T00:00:00Z", "2023-06-16T00:00:00Z"]);
      schedule(ENDPOINT, ["2023-06-15T00:00:00Z", "2023-06-16T00:00:00Z"]);
      schedule(ENDPOINT, JUNE, CLOUD_FILTER);
      await vi.advanceTimersByTimeAsync(300);
      vi.useRealTimers();
      await vi.waitFor(() => expect(state.latestLayer.value).not.toBeNull());

      expect(tileJsonRequests()).toHaveLength(1);
      const params = lastRequestedUrl().searchParams;
      expect(params.get("datetime")).toBe("2023-06-15/2023-06-20");
      expect(params.get("filter")).toBe(CLOUD_CQL);
    });
  });

  describe("useInitMosaic", () => {
    test("drops the initial render when the widget unmounts before it runs", async () => {
      await selectCollection();
      vi.useFakeTimers();
      const widget = await render({
        setup() {
          useInitMosaic(ENDPOINT, ref(JUNE));
          return () => h("div");
        },
      });

      await widget.unmount();
      await vi.advanceTimersByTimeAsync(300);

      expect(tileJsonRequests()).toEqual([]);
    });

    test("shows the mosaic again after leaving the globe zoomed out and zooming in on the 2D map", async () => {
      const setVisible = vi.fn();
      mapEl.value = fakeMap({ getLayerById: () => ({ setVisible }) });
      isGlobe.value = true;
      // camera altitude equivalent to zoom 2
      mapPosition.value = [0, 0, 21_050_000];
      await selectCollection();
      const widget = await render({
        setup() {
          useInitMosaic(ENDPOINT, ref(JUNE));
          return () => h("div");
        },
      });
      await updateMosaicLayer(ENDPOINT, {});
      expect(setVisible).toHaveBeenLastCalledWith(false);

      isGlobe.value = false;
      mapPosition.value = [0, 0, 10];
      await nextTick();

      expect(setVisible).toHaveBeenLastCalledWith(true);
      await widget.unmount();
    });
  });

  describe("normalizeGlobeZoom", () => {
    test("passes the raw value through in 2D", () => {
      expect(normalizeGlobeZoom(42)).toBe(42);
    });

    test("converts globe altitude via the eox-map formula", () => {
      isGlobe.value = true;
      expect(normalizeGlobeZoom(21_050_000)).toBe(2);

      mapEl.value = fakeMap({ globeConfig: { useHighLOD: true } });
      expect(normalizeGlobeZoom(21_050_000)).toBe(1);
    });
  });

  describe("checkMosaicDataInView", () => {
    const seedEndpoint = async () => {
      store.rasterEndpoint = "https://raster";
      store.selectedStac = (await readCollection()).stac;
      axiosMock.get.mockReset();
    };

    test("assumes data below the visibility threshold without a request", async () => {
      await seedEndpoint();
      mapEl.value = fakeMap({ lonLatExtent: [0, 0, 1, 1] });
      mapPosition.value = [0, 0, 4];
      state.hasDataInView.value = false;

      await checkMosaicDataInView();

      expect(state.hasDataInView.value).toBe(true);
      expect(axiosMock.get).not.toHaveBeenCalled();
    });

    test("on the globe, skips the check without reading the 2D extent eox-map cannot transform", async () => {
      await seedEndpoint();
      isGlobe.value = true;
      mapEl.value = fakeMap();
      Object.defineProperty(mapEl.value, "lonLatExtent", {
        get() {
          throw new Error("No transform available between EPSG:4326 and globe");
        },
      });
      state.hasDataInView.value = false;

      await expect(checkMosaicDataInView()).resolves.toBeUndefined();

      expect(state.hasDataInView.value).toBe(true);
      expect(axiosMock.get).not.toHaveBeenCalled();
    });

    test("queries the bbox assets endpoint with the active mosaic query", async () => {
      await seedEndpoint();
      mapEl.value = fakeMap({ lonLatExtent: [0, 0, 1, 1] });
      state.query.value = { filters: CLOUD_FILTER };
      axiosMock.get.mockResolvedValue({ data: [] });

      await checkMosaicDataInView();

      const url = new URL(axiosMock.get.mock.calls[0][0]);
      expect(url.pathname).toBe("/collections/coll/bbox/0,0,1,1/assets");
      expect(url.searchParams.get("limit")).toBe("1");
      expect(url.searchParams.get("filter")).toBe(CLOUD_CQL);
      expect(state.hasDataInView.value).toBe(false);
    });

    test("keeps data-in-view true when assets exist or the request fails", async () => {
      await seedEndpoint();
      mapEl.value = fakeMap({ lonLatExtent: [0, 0, 1, 1] });

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
