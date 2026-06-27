import { onUnmounted, watch } from "vue";
import { loading } from "@/store/states";

/**
 * Tracks map loading state at the source level via `loading.activeLoads`,
 * the same counter used by the axios plugin. Re-attaches source listeners
 * whenever eox-map fires `layerschanged`, using `getFlatLayersArray`.
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} compareMapElement
 */
export const useMapLoading = (mapElement, compareMapElement) => {
  const startHandler = () => {
    loading.activeLoads++;
  };
  const endHandler = () => {
    loading.activeLoads--;
  };

  /** @param {import("@eox/map").EOxMap | null} newMapEl */
  const watcherHandler = (newMapEl) => {
    if (!newMapEl) return;

    const hasStartListener = newMapEl.map
      .getListeners("loadstart")
      ?.some((listner) => listner === startHandler);
    const hasEndListener = newMapEl.map
      .getListeners("loadend")
      ?.some((listner) => listner === endHandler);

    if (!hasStartListener) {
      newMapEl.map.addEventListener("loadstart", startHandler);
    }
    if (!hasEndListener) {
      newMapEl.map.addEventListener("loadend", endHandler);
    }
  };
  const stopMainWatcher = watch(mapElement, watcherHandler, {
    immediate: true,
  });
  const stopCompareWatcher = watch(compareMapElement, watcherHandler, {
    immediate: true,
  });

  onUnmounted(() => {
    mapElement.value?.map.removeEventListener("loadstart", startHandler);
    mapElement.value?.map.removeEventListener("loadend", endHandler);
    stopMainWatcher();
    stopCompareWatcher();
    loading.activeLoads = 0;
  });
};
