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
      .controls="controls"
    >
      <eox-map-tooltip
        :style="mainTooltipStyles"
        .propertyTransform="tooltipPropertyTransform('main')"
      />
    </eox-map>
    <eox-map
      class="fill-height fill-width overflow-none"
      id="compare"
      slot="second"
      ref="compareMap"
      .layers="eoxMapCompareLayers"
    >
      <eox-map-tooltip
        :style="compareTooltipStyles"
        .propertyTransform="tooltipPropertyTransform('compare')"
      />
    </eox-map>
  </eox-map-compare>
</template>
<script setup>
import "@eox/map";
import "@eox/map/src/plugins/advancedLayersAndSources";
import { computed, onMounted, ref, toRaw } from "vue";
import { datetime, mapEl, mapPosition, mapCompareEl } from "@/store/states";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import {
  eodashCollections,
  eodashCompareCollections,
  layerControlFormValue,
  layerControlFormValueCompare,
} from "@/utils/states";
import {
  useHandleMapMoveEnd,
  useInitMap,
  useUpdateTooltipProperties,
} from "^/EodashMap/methods";
import { inAndOut } from "ol/easing.js";
import mustache from "mustache";

const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  /** @type {import("vue").PropType<[number,number]>} */
  center: {
    //@ts-expect-error todo
    type: Array,
    default: () => [mapPosition.value?.[0] ?? 15, mapPosition.value?.[1] ?? 48],
  },
  zoom: {
    type: Number,
    default: mapPosition.value?.[2] ?? 4,
  },
  zoomToExtent: {
    type: Boolean,
    default: true,
  },
});

/** @type {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"], undefined>>} */
const tooltipProperties = ref([]);
/** @type {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"], undefined>>} */
const compareTooltipProperties = ref([]);
/** @type {import("@eox/map").EOxMap["controls"]} */
const controls = {
  Attribution: {
    collapsible: true,
  },
  ScaleLine: {},
  MousePosition: {},
};
const initialCenter = toRaw(props.center);
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
      selectedCompareStac,
      eodashCompareCollections,
      datetime,
      eoxMapCompareLayers,
      eoxMap,
      false,
    );

    useUpdateTooltipProperties(eodashCollections, compareTooltipProperties);
  }

  useInitMap(
    eoxMap,
    selectedStac,
    eodashCollections,
    datetime,
    eoxMapLayers,
    compareMap,
    props.zoomToExtent,
  );
});

useUpdateTooltipProperties(eodashCollections, tooltipProperties);

const mainTooltipStyles = computed(() => ({
  visibility: tooltipProperties.value.length ? "visible" : "hidden",
}));

const compareTooltipStyles = computed(() => ({
  visibility: compareTooltipProperties.value.length ? "visible" : "hidden",
}));
/**
 * @param {"main" | "compare"} map
 **/
const tooltipPropertyTransform = (map) => {
  const tooltipProps =
    map === "main" ? tooltipProperties : compareTooltipProperties;
  const layerControlFormVal =
    map == "main" ? layerControlFormValue : layerControlFormValueCompare;
  /**
   * @param {{key:string; value:string}} param
   * @returns {{key:string; value?:string} | undefined}
   */
  return (param) => {
    /** @type {typeof tooltipProps.value} */
    const updatedProperties = JSON.parse(
      mustache.render(JSON.stringify(tooltipProps.value), {
        ...(layerControlFormVal.value ?? {}),
      }),
    );

    const tooltipProp = updatedProperties?.find(
      (prop) => prop.id === param.key,
    );
    if (!tooltipProp) {
      return undefined;
    }
    if (typeof param.value === "object") {
      param.value = JSON.stringify(param.value);
    }
    if (!isNaN(Number(param.value))) {
      param.value = Number(param.value).toFixed(4).toString();
    }

    return {
      key: tooltipProp.title || tooltipProp.id,
      value: param.value + " " + (tooltipProp.appendix || ""),
    };
  };
};
</script>
