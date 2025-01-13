<template>
  <eox-map-compare
    class="fill-height fill-width overflow-none"
    .enabled="showCompare"
  >
    <eox-map
      class="fill-height fill-width overflow-none"
      slot="first"
      ref="eoxMap"
      id="main"
      .animationOptions="animationOptions"
      .center="initialCenter"
      .zoom="initialZoom"
      .layers="eoxMapLayers"
    >
      <eox-map-tooltip
        v-if="tooltipProperties.length"
        .propertyTransform="tooltipPropertyTransform"
      />
    </eox-map>
    <eox-map
      class="fill-height fill-width overflow-none"
      id="compare"
      slot="second"
      ref="compareMap"
      .layers="eoxMapCompareLayers"
    />
  </eox-map-compare>
</template>
<script setup>
import "@eox/map";
import "@eox/map/src/plugins/advancedLayersAndSources";
import { computed, onMounted, ref, toRaw } from "vue";
import { datetime, mapEl, mapPosition, mapCompareEl } from "@/store/states";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";
import {
  useHandleMapMoveEnd,
  useInitMap,
  useUpdateTooltipProperties,
} from "@/composables/EodashMap";
import { inAndOut } from "ol/easing.js";
const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  /** @type {import("vue").PropType<[number,number]>} */
  center: {
    //@ts-expect-error todo
    type: Array,
    default: () => [15, 48],
  },
  zoom: {
    type: Number,
    default: 4,
  },
});
/** @type {import("vue").Ref<string[]>} */
const tooltipProperties = ref([]);

const initialCenter = toRaw([
  mapPosition.value?.[0] ?? props.center?.[0],
  mapPosition.value?.[1] ?? props.center?.[1],
]);
const initialZoom = toRaw(mapPosition.value?.[2] ?? props.zoom);
/** @type {import("vue").Ref<Record<string,any>[]>} */
const eoxMapLayers = ref([
  {
    type: "Tile",
    source: { type: "OSM" },
    properties: {
      id: "osm",
      title: "Background",
    },
  },
]);

/** @type {import("vue").Ref<Record<string,any>[]>} */
const eoxMapCompareLayers = ref([
  {
    type: "Tile",
    source: { type: "OSM" },
    properties: {
      id: "osm",
      title: "Background",
    },
  },
]);

const animationOptions = {
  duration: 1200,
  easing: inAndOut,
};

/** @type {import("vue").Ref<import("@eox/map").EOxMap | null>} */
const eoxMap = ref(null);
/** @type {import("vue").Ref<import("@eox/map").EOxMap | null>} */
const compareMap = ref(null);
const { selectedCompareStac } = storeToRefs(useSTAcStore());
const showCompare = computed(() =>
  props.enableCompare && !!selectedCompareStac.value ? "" : "first",
);

useHandleMapMoveEnd(eoxMap, mapPosition);

onMounted(() => {
  const { selectedCompareStac, selectedStac } = storeToRefs(useSTAcStore());
  // assign map Element state to eox map
  mapEl.value = eoxMap.value;

  if (props.enableCompare) {
    mapCompareEl.value = compareMap.value;
  }

  if (props.enableCompare) {
    useInitMap(
      compareMap,
      //@ts-expect-error todo selectedStac as collection
      selectedCompareStac,
      eodashCompareCollections,
      datetime,
      eoxMapCompareLayers,
      eoxMap,
    );
  }

  useInitMap(
    eoxMap,
    //@ts-expect-error todo selectedStac as collection
    selectedStac,
    eodashCollections,
    datetime,
    eoxMapLayers,
    compareMap,
  );
});
useUpdateTooltipProperties(eodashCollections, tooltipProperties);
/**
 * @param {{key:string; value:string}} param
 * @returns {{key:string; value:string} | undefined}
 */
const tooltipPropertyTransform = (param) => {
  if (tooltipProperties.value.includes(param.key)) {
    if (typeof param.value === "object") {
      param.value = JSON.stringify(param.value);
    }
    return param;
  }
};
</script>
