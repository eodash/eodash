import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import { h, nextTick, ref } from "vue";
import Map from "ol/Map";
import MapEvent from "ol/MapEvent";
import { useMapLoading } from "^/EodashMap/methods";
import { loading } from "@/store/states";

/**
 * A rendered frame as OL hands it to `postrender`, reduced to what the
 * loading check reads.
 * @param {{ tilesLoading?: number, queued?: number, layerStates?: object[] }} [frame]
 */
const frameState = ({ tilesLoading = 0, queued = 0, layerStates = [] } = {}) =>
  /** @type {any} */ ({
    tileQueue: {
      getTilesLoading: () => tilesLoading,
      getCount: () => queued,
    },
    layerStatesArray: layerStates,
    viewState: { resolution: 1, zoom: 5 },
  });

/**
 * A visible layer whose source has the given state.
 * @param {string} sourceState
 * @param {{ minZoom?: number }} [range]
 */
const layerState = (sourceState, { minZoom = -Infinity } = {}) => ({
  visible: true,
  minResolution: 0,
  maxResolution: Infinity,
  minZoom,
  maxZoom: Infinity,
  layer: { getSource: () => ({ getState: () => sourceState }) },
});

/** @param {Map} map @param {Parameters<typeof frameState>[0]} [frame] */
const renderFrame = (map, frame) =>
  map.dispatchEvent(new MapEvent("postrender", map, frameState(frame)));

/** @param {Map} map */
const mountLoading = (map) =>
  render({
    setup() {
      useMapLoading(ref(/** @type {any} */ ({ map })), ref(null));
      return () => h("div");
    },
  });

describe("useMapLoading", () => {
  beforeEach(() => {
    loading.activeLoads = 0;
  });
  afterEach(() => {
    loading.activeLoads = 0;
  });

  test("counts the map as loading while tiles are queued or loading", async () => {
    const map = new Map({});
    await mountLoading(map);

    renderFrame(map, { queued: 9 });
    expect(loading.activeLoads).toBe(1);

    renderFrame(map, { tilesLoading: 9 });
    expect(loading.activeLoads).toBe(1);

    renderFrame(map);
    expect(loading.activeLoads).toBe(0);
  });

  test("counts a visible source that is still reading its metadata", async () => {
    const map = new Map({});
    await mountLoading(map);

    renderFrame(map, { layerStates: [layerState("loading")] });
    expect(loading.activeLoads).toBe(1);

    renderFrame(map, { layerStates: [layerState("ready")] });
    expect(loading.activeLoads).toBe(0);
  });

  test("ignores a source reading its metadata outside its layer's zoom range", async () => {
    const map = new Map({});
    await mountLoading(map);

    renderFrame(map, {
      layerStates: [layerState("loading", { minZoom: 10 })],
    });

    expect(loading.activeLoads).toBe(0);
  });

  test("releases its loads on unmount", async () => {
    const map = new Map({});
    const { unmount } = await mountLoading(map);
    renderFrame(map, { queued: 1 });

    await unmount();

    expect(loading.activeLoads).toBe(0);
  });

  test("cleans up loading state when compare map is removed", async () => {
    const mainMap = new Map({});
    const compareMap = new Map({});
    const mainRef = ref(/** @type {any} */ ({ map: mainMap }));
    const compareRef = ref(/** @type {any} */ ({ map: compareMap }));

    await render({
      setup() {
        useMapLoading(mainRef, compareRef);
        return () => h("div");
      },
    });

    renderFrame(compareMap, { queued: 5 });
    expect(loading.activeLoads).toBe(1);

    compareRef.value = null;
    await nextTick();

    expect(loading.activeLoads).toBe(0);
  });
});
