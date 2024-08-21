<template>
  <eox-map-compare
    class="fill-height fill-width overflow-none"
    :enabled="showCompare"
  >
    <eox-map
      class="fill-height fill-width overflow-none"
      slot="first"
      ref="eoxMap"
      :sync="compareMap"
      id="main"
      :config="eoxMapConfig"
    />
    <eox-map
      class="fill-height fill-width overflow-none"
      id="compare"
      slot="second"
      ref="compareMap"
      :config="eoxCompareMapConfig"
    />
  </eox-map-compare>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { datetime, mapEl, mapPosition, mapCompareEl } from "@/store/States";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import "@eox/map";
import "@eox/map/dist/eox-map-advanced-layers-and-sources.js";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";
import { useHandleMapMoveEnd, useInitMap } from "@/composables/EodashMap";

const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
});

/** @type {import("vue").Ref<(HTMLElement & Record<string,any> & { map:import("ol").Map }) | null>} */
const eoxMap = ref(null);
/** @type {import("vue").Ref<(HTMLElement & Record<string,any> & { map:import("ol").Map }) | null>} */
const compareMap = ref(null);

const eoxMapConfig = reactive({
  /** @type {(number|undefined)[] | undefined} */
  center: [15, 48],
  /** @type {number | undefined} */
  zoom: 4,
  // TODO: we should probably introduce some way of defining default base layers
  layers: [
    {
      type: "Tile",
      properties: {
        id: "osm",
        title: "Background",
      },
      source: {
        type: "OSM",
      },
    },
  ],
});

const eoxCompareMapConfig = reactive({
  /** @type {(number|undefined)[] | undefined} */
  center: [15, 48],
  /** @type {number | undefined} */
  zoom: 4,
  layers: [],
});

// Check if selected indicator was already set in store
if (mapPosition && mapPosition.value && mapPosition.value.length === 3) {
  // TODO: do further checks for invalid values?
  // TODO: can we expect the values to be in a specific projection
  eoxMapConfig.center = [mapPosition.value?.[0], mapPosition.value[1]];
  eoxMapConfig.zoom = mapPosition.value[2];
}
const showCompare = computed(() =>
  props.enableCompare && !!selectedCompareStac.value ? "" : "first",
);

useHandleMapMoveEnd(eoxMap, mapPosition);

const { selectedCompareStac, selectedStac } = storeToRefs(useSTAcStore());

if (props.enableCompare) {
  useInitMap(
    compareMap,
    //@ts-expect-error todo selectedStac as collection
    selectedCompareStac,
    eodashCompareCollections,
    datetime,
  );
}
useInitMap(
  eoxMap,
  //@ts-expect-error todo selectedStac as collection
  selectedStac,
  eodashCollections,
  datetime,
);

onMounted(() => {
  // assign map Element state to eox map
  mapEl.value = eoxMap.value;
  if (props.enableCompare) {
    mapCompareEl.value = compareMap.value;
  }
});
</script>
