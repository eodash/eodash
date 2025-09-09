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
  <div
    v-if="enableCursorCoordinates"
    id="cursor-coordinates"
    ref="cursor-coords"
  />
  <span v-if="enableScaleLine" id="scale-line" ref="scale-line" />
  <div
    class="map-buttons-container"
    :style="`margin: ${btnsPosition.gap}px 0 ${btnsPosition.gap}px 0`"
  >
    <EodashMapBtns
      v-if="indicator || compareIndicator"
      :style="{
        gridColumn: responsiveX,
        gridRow: responsiveY,
      }"
      :exportMap="btnsProps.exportMap"
      :changeProjection="btnsProps.changeProjection"
      :compareIndicators="btnsProps.compareIndicators"
      :backToPOIs="btnsProps.backToPOIs"
      :enableSearch="btnsProps.enableSearch"
      :enableZoom="btnsProps.enableZoom"
    />
  </div>
</template>
<script setup>
import "@eox/map";
import "@eox/map/src/plugins/advancedLayersAndSources";
import { computed, onMounted, ref, toRaw, useTemplateRef } from "vue";
import {
  datetime,
  mapEl,
  mapPosition,
  mapCompareEl,
  indicator,
  compareIndicator,
} from "@/store/states";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { useDisplay } from "vuetify";
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
import EodashMapBtns from "^/EodashMap/EodashMapBtns.vue";

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
  enableCursorCoordinates: {
    type: Boolean,
    default: true,
  },
  enableScaleLine: {
    type: Boolean,
    default: true,
  },
  btnsPosition: {
    type: Object,
    default: () => ({
      x: "12/9/8",
      y: 1,
      gap: 16,
    }),
  },
  btns: {
    type: Object,
    default: () => ({
      enableExportMap: true,
      enableChangeProjection: true,
      enableCompareIndicators: true,
      enableBackToPOIs: true,
      enableSearch: true,
      enableZoom: true,
    }),
  },
});

// Responsive positioning logic
const { width } = useDisplay();

/**
 * Parse responsive string values (e.g., "1/5/10") into values for different screen sizes
 * Breakpoints: [0, 960, 1920] based on properties passed to eox-layout in DashboardLayout.vue
 * @param {string | number} value
 * @returns {number}
 */
const parseResponsiveValue = (value) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parts = value.split("/");
    const currentWidth = width.value;

    if (currentWidth < 960) {
      return parseInt(parts[0]) || 1;
    } else if (currentWidth < 1920) {
      return parseInt(parts[1] || parts[0]) || 1;
    } else {
      return parseInt(parts[2] || parts[1] || parts[0]) || 1;
    }
  }
  return 1;
};

const responsiveX = computed(() => parseResponsiveValue(props.btnsPosition.x));
const responsiveY = computed(() => parseResponsiveValue(props.btnsPosition.y));
const btnsProps = computed(() => ({
  exportMap: props.btns.enableExportMap ?? true,
  changeProjection: props.btns.enableChangeProjection ?? true,
  compareIndicators: props.btns.enableCompareIndicators ?? true,
  backToPOIs: props.btns.enableBackToPOIs ?? true,
  enableSearch: props.btns.enableSearch ?? true,
  enableZoom: props.btns.enableZoom ?? true,
}));

// Prepare containers for scale line and cursor coordinates
const scaleLineRef = useTemplateRef("scale-line");
const cursorCoordsRef = useTemplateRef("cursor-coords");

/** @type {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"], undefined>>} */
const tooltipProperties = ref([]);
/** @type {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"], undefined>>} */
const compareTooltipProperties = ref([]);
/** @type {import("vue").ComputedRef<Record<string, any>>} */
const controls = computed(() => ({
  Attribution: {
    collapsible: true,
  },
  ScaleLine: props.enableScaleLine
    ? {
        target: scaleLineRef.value || undefined,
      }
    : undefined,
  MousePosition: props.enableCursorCoordinates
    ? {
        projection: "EPSG:4326",
        coordinateFormat: (/** @type {[number, number]} */ c) => {
          return `${c[1].toFixed(3)} °N, ${c[0].toFixed(3)} °E`;
        },
        target: cursorCoordsRef.value || undefined,
      }
    : undefined,
}));

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

<style scoped>
#cursor-coordinates {
  position: fixed;
  left: 24px;
  bottom: 56px;
  padding: 0 2px;
  color: rgba(0, 0, 0, 0.9);
  font-size: 13px;
  background: #fffe;
  border-radius: 4px;
  border: none;
  padding: 4px 8px;
}

#scale-line {
  position: fixed;
  left: 24px;
  bottom: 24px;
  color: #fff;
}

:deep(.ol-scale-line) {
  background: #fffe !important;
  border-radius: 4px !important;
  border: none !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
:deep(.ol-scale-line-inner) {
  display: flex;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.5) !important;
  border-top: none !important;
  color: #333 !important;
  font-weight: 500 !important;
}

.map-buttons-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  pointer-events: none;
  z-index: 1;
}

.map-buttons-container > * {
  pointer-events: auto;
}
</style>
