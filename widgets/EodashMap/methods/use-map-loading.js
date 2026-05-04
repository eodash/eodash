import { onMounted, onUnmounted, nextTick } from "vue";
import { loading } from "@/store/states";

const START_EVENTS = ["tileloadstart", "imageloadstart", "featuresloadstart"];
const END_EVENTS = [
  "tileloadend",
  "tileloaderror",
  "imageloadend",
  "imageloaderror",
  "featuresloadend",
  "featuresloaderror",
];

/**
 * Tracks map loading state at the source level via `loading.activeLoads`,
 * the same counter used by the axios plugin. Re-attaches source listeners
 * whenever eox-map fires `layerschanged`, using `getFlatLayersArray`.
 *
 * @param {import("vue").Ref<import("@eox/map").EOxMap | null>} mapElement
 */
export const useMapLoading = (mapElement) => {
  const startHandler = ()=>{
    loading.activeLoads++;
    console.log("map load start",loading.value);
  }
  const endHandler = ()=>{
    loading.activeLoads--;
    console.log("map load end",loading.value);
  }

  onMounted(async() => {
    await nextTick();
    console.log("attaching map load listeners",mapElement.value?.id);
    mapElement.value?.map.addEventListener("loadstart",startHandler)
    mapElement.value?.map.addEventListener("loadend",endHandler)
  });

  onUnmounted(() => {
    mapElement.value?.map.removeEventListener("loadstart", startHandler);
    mapElement.value?.map.removeEventListener("loadend", endHandler);
    loading.activeLoads = 0;
  });
};
