import { beforeEach, describe, expect, test, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createEodashCollection } from "@eodash/stac";
import {
  checkMosaicDataInView,
  normalizeGlobeZoom,
  updateMosaicLayer,
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
  /** @type {any} */ ({ layers: [], globeConfig: {}, ...over });

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

    test("collapses an equal-day time range to a single datetime", async () => {
      await selectCollection();

      await updateMosaicLayer(ENDPOINT, {
        timeRange: ["2023-06-15T00:00:00Z", "2023-06-15T23:59:00Z"],
      });

      expect(lastRequestedUrl().searchParams.get("datetime")).toBe(
        "2023-06-15",
      );
      expect(state.query.value).toEqual({ datetime: "2023-06-15" });
    });

    test("sends a from/to datetime for a multi-day range", async () => {
      await selectCollection();

      await updateMosaicLayer(ENDPOINT, {
        timeRange: ["2023-06-15T00:00:00Z", "2023-06-20T00:00:00Z"],
      });

      expect(lastRequestedUrl().searchParams.get("datetime")).toBe(
        "2023-06-15/2023-06-20",
      );
    });

    test("translates filters into a cql2-text filter param", async () => {
      await selectCollection();

      await updateMosaicLayer(ENDPOINT, { filters: CLOUD_FILTER });

      const params = lastRequestedUrl().searchParams;
      expect(params.get("filter")).toBe(
        '"eo:cloud_cover" >= 5 AND "eo:cloud_cover" <= 20',
      );
      expect(params.get("filter-lang")).toBe("cql2-text");
    });

    test("replaces the previous time range's layer instead of stacking it", async () => {
      await selectCollection();

      await updateMosaicLayer(ENDPOINT, {
        timeRange: ["2023-06-15T00:00:00Z", "2023-06-20T00:00:00Z"],
      });
      const june = state.latestLayer.value;
      await updateMosaicLayer(ENDPOINT, {
        timeRange: ["2023-07-15T00:00:00Z", "2023-07-20T00:00:00Z"],
      });

      const layers = analysisGroup(mapEl.value ?? undefined)?.layers;
      expect(layers).toEqual([state.latestLayer.value]);
      expect(layers?.[0]?.properties?.id).not.toBe(june?.properties?.id);
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
      schedule(
        ENDPOINT,
        ["2023-06-15T00:00:00Z", "2023-06-20T00:00:00Z"],
        CLOUD_FILTER,
      );
      await vi.advanceTimersByTimeAsync(300);
      vi.useRealTimers();
      await vi.waitFor(() => expect(state.latestLayer.value).not.toBeNull());

      expect(tileJsonRequests()).toHaveLength(1);
      const params = lastRequestedUrl().searchParams;
      expect(params.get("datetime")).toBe("2023-06-15/2023-06-20");
      expect(params.get("filter")).toBe(
        '"eo:cloud_cover" >= 5 AND "eo:cloud_cover" <= 20',
      );
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

    test("queries the bbox assets endpoint with the active mosaic query", async () => {
      await seedEndpoint();
      mapEl.value = fakeMap({ lonLatExtent: [0, 0, 1, 1] });
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
