import { onUnmounted, toRaw, watch } from "vue";
import { inView } from "ol/layer/Layer";
import { loading } from "@/store/states";

/**
 * Tracks map loading state via `loading.activeLoads`, the same counter used by
 * the axios plugin. Every rendered frame decides whether its map is still loading.
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} compareMapElement
 */
export const useMapLoading = (mapElement, compareMapElement) => {
  // This instance's outstanding loads, so unmount subtracts only its share.
  let localLoads = 0;
  const startHandler = () => {
    localLoads++;
    loading.activeLoads++;
  };
  const endHandler = () => {
    localLoads = Math.max(0, localLoads - 1);
    loading.activeLoads = Math.max(0, loading.activeLoads - 1);
  };

  /** Maps whose last rendered frame was still loading. */
  const loadingMaps = new WeakSet();

  /**
   * Replaces OL's `loadstart`/`loadend`, which miss two cases:
   * - a visible source still reading its metadata (state `loading`, e.g. GeoZarr or
   *   GeoTIFF), since OL only checks `source.loading`:
   *   https://github.com/openlayers/openlayers/issues/16483. Visibility follows the
   *   rule proposed there, including the layer's zoom and resolution range.
   * - tiles loading after a source's key changed (e.g. a GeoZarr time slice): the
   *   renderer marks those frames as animating, and OL skips load events on them.
   *
   * @param {import("ol/MapEvent").default} evt
   */
  const postRenderHandler = ({ map, frameState }) => {
    if (!frameState) return;
    map = toRaw(map);
    const { tileQueue, layerStatesArray, viewState } = frameState;
    const isLoading =
      tileQueue.getTilesLoading() > 0 ||
      tileQueue.getCount() > 0 ||
      map.getLoadingOrNotReady() ||
      layerStatesArray.some(
        (state) =>
          inView(state, viewState) &&
          state.layer.getSource()?.getState() === "loading",
      );
    if (isLoading === loadingMaps.has(map)) return;
    if (isLoading) {
      loadingMaps.add(map);
      startHandler();
      return;
    }
    loadingMaps.delete(map);
    endHandler();
  };

  /**
   * @param {import("@eox/map").EOxMap | null} newMapEl
   * @param {import("@eox/map").EOxMap | null} [oldMapEl]
   */
  const watcherHandler = (newMapEl, oldMapEl) => {
    if (oldMapEl?.map) {
      const oldMap = toRaw(oldMapEl.map);
      oldMap.un("postrender", postRenderHandler);
      if (loadingMaps.has(oldMap)) {
        loadingMaps.delete(oldMap);
        endHandler();
      }
    }
    if (!newMapEl?.map) return;

    const newMap = toRaw(newMapEl.map);
    const hasPostRenderListener = newMap
      .getListeners("postrender")
      ?.some((listener) => listener === postRenderHandler);
    if (!hasPostRenderListener) {
      newMap.on("postrender", postRenderHandler);
    }
  };
  const stopMainWatcher = watch(mapElement, watcherHandler, {
    immediate: true,
  });
  const stopCompareWatcher = watch(compareMapElement, watcherHandler, {
    immediate: true,
  });

  onUnmounted(() => {
    toRaw(mapElement.value?.map)?.un("postrender", postRenderHandler);
    toRaw(compareMapElement.value?.map)?.un("postrender", postRenderHandler);
    stopMainWatcher();
    stopCompareWatcher();
    loading.activeLoads = Math.max(0, loading.activeLoads - localLoads);
  });
};
