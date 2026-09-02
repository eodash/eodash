<template>
  <span>
    <eox-map-compare
      class="fill-height fill-width overflow-none"
      .enabled="showCompare"
    >
      <eox-map
        id="main"
        slot="first"
        ref="eoxMap"
        class="fill-height fill-width overflow-none"
        .animationOptions="animationOptions"
        .center="initialCenter"
        .zoom="initialZoom"
        .controls="controls"
      >
        <eox-map-tooltip
          :style="mainTooltipStyles"
          .propertyTransform="tooltipPropertyTransform('main')"
        />
      </eox-map>
      <eox-map
        id="compare"
        slot="second"
        ref="compareMap"
        class="fill-height fill-width overflow-none"
      >
        <eox-map-tooltip
          :style="compareTooltipStyles"
          .propertyTransform="tooltipPropertyTransform('compare')"
        />
      </eox-map>
    </eox-map-compare>
    <div ref="geoTarget" style="display: none"></div>
    <div
      v-if="enableCursorCoordinates"
      id="cursor-coordinates"
      ref="cursor-coords"
    />
    <span v-if="enableScaleLine" id="scale-line" ref="scale-line" />
    <div
      class="map-buttons-container"
      :style="`margin: ${btnsPosition.gap}px 0 ${btnsPosition.gap}px 0; top: ${btnsTop}px;`"
    >
      <!-- prettier-ignore -->
      <EodashMapBtns
        :style="{
          gridColumn: (indicator || compareIndicator || poi) && !isGlobe ? responsiveX : '12',
          gridRow: responsiveY,
        }"
        :exportMap="(indicator || compareIndicator || poi) ? btnsProps.exportMap : false"
        :changeProjection="(indicator || compareIndicator || poi) ? btnsProps.changeProjection : false
        "
        :compareIndicators="(indicator || compareIndicator || poi) ? btnsProps.compareIndicators : false
        "
        :backToPOIs="(indicator || compareIndicator || poi) ? btnsProps.backToPOIs : false
        "
        :enableSearch="(indicator || compareIndicator || poi) ? btnsProps.enableSearch : false
        "
        :enableZoom="(indicator || compareIndicator || poi) ? btnsProps.enableZoom : false
        "
        :enableGeolocation="(indicator || compareIndicator || poi) ? btnsProps.enableGeolocation : false
        "
        :enableGlobe="(indicator || compareIndicator || poi) ? btnsProps.enableGlobe : false"
        :enableFeedback="(indicator || compareIndicator || poi) ? btnsProps.enableFeedback : false"
        :searchParams="btnsProps.searchParams"
      />
    </div>
  </span>
</template>
<script setup>
import "@eox/map";
import "@eox/map/src/plugins/advancedLayersAndSources";
import {
  nextTick,
  computed,
  onMounted,
  ref,
  toRaw,
  useTemplateRef,
  watch,
} from "vue";
import {
  datetime,
  mapEl,
  mapPosition,
  mapCompareEl,
  indicator,
  compareIndicator,
  poi,
  isGlobe,
  tooltipAdapter,
} from "@/store/states";
import { storeToRefs } from "pinia";
import {
  eodashCollections,
  eodashCompareCollections,
  useSTAcStore,
} from "@/store/stac";
import { useDisplay, useLayout } from "vuetify";
import {
  defaultBaseLayers,
  hasRestoredView,
  layerControlFormValue,
  layerControlFormValueCompare,
} from "@/utils/states";
import {
  BASE_LAYERS_GROUP,
  assignGroupLayers,
  updateIndicatorLayers,
} from "@/eodashSTAC/layers";
import {
  useHandleMapMoveEnd,
  useMapLoading,
  useUpdateTooltipProperties,
  zoomToCollection,
} from "^/EodashMap/methods";
import { inAndOut } from "ol/easing.js";
import mustache from "mustache";
import EodashMapBtns from "^/EodashMap/EodashMapBtns.vue";

const props = defineProps({
  /**
   * Default base layers of the map, expects a layer array that will be injected to the BaseLayers group.
   * A collection that declares its own base layers replaces these;
   * The state `defaultBaseLayers` keeps them as the fallback for collections that do not declare it
   */
  baseLayers: {
    /** @type {import("vue").PropType<import("@eox/map").EoxLayer[]>} */
    type: Array,
    default: () => [
      {
        type: "Tile",
        source: { type: "OSM" },
        properties: {
          id: "osm",
          title: "Background",
          layerControlExclusive: true,
        },
      },
    ],
  },
  enableCompare: {
    type: Boolean,
    default: false,
  },
  /**
   * Initial map center as [lon, lat]; falls back to the last stored map position.
   * @default [15, 48]
   */
  center: {
    type: /** @type {import("vue").PropType<[number, number]>} */ (
      /** @type {unknown} */ (Array)
    ),
    default: () => [mapPosition.value?.[0] ?? 15, mapPosition.value?.[1] ?? 48],
  },
  /**
   * Initial zoom level; falls back to the last stored map position.
   * @default 4
   */
  zoom: {
    type: Number,
    default: mapPosition.value?.[2] ?? 4,
  },
  /** Fly to the selected collection's spatial extent on selection. */
  zoomToExtent: {
    type: Boolean,
    default: true,
  },
  /** Show live cursor coordinates as a fixed overlay at the bottom-left of the map. */
  enableCursorCoordinates: {
    type: Boolean,
    default: true,
  },
  /** Show an OpenLayers scale-line control at the bottom-left of the map. */
  enableScaleLine: {
    type: Boolean,
    default: true,
  },
  /** Grid position of the floating button toolbar. `x` accepts responsive `"mobile/tablet/desktop"` column notation. */
  btnsPosition: {
    type: /** @type {import("vue").PropType<{ x: string | number; y: number; gap: number }>} */ (
      Object
    ),
    default: () => ({
      x: "12/9/10",
      y: 1,
      gap: 16,
    }),
  },
  /** Toolbar feature flags; set any flag to `false` to hide the corresponding button. */
  btns: {
    type:
      /**
       * @type {import("vue").PropType<{
       * enableExportMap?: boolean;
       * enableChangeProjection?: boolean;
       * enableBackToPOIs?: boolean;
       * enableSearch?: boolean;
       * searchParams?: object;
       * enableZoom?: boolean;
       * enableGlobe?: boolean;
       * enableMosaic?: boolean;
       * enableFeedback?: boolean;
       * enableGeolocation?: boolean;
       * geolocationOptions?: object;
       * enableCompareIndicators?: boolean | {
       *   compareTemplate?:string;
       *   fallbackTemplate?:string;
       *   itemFilterConfig?:InstanceType<import("../EodashItemFilter.vue").default>["$props"]
       * };
       * }> } */ (Object),
    default: () => ({
      enableExportMap: true,
      enableChangeProjection: true,
      enableCompareIndicators: true,
      enableBackToPOIs: true,
      enableSearch: true,
      enableZoom: true,
      enableGlobe: true,
      enableMosaic: true,
      enableFeedback: true,
      enableGeolocation: true,
      geolocationOptions: {
        style: {
          "circle-radius": 12,
          "circle-fill-color": "red",
          "circle-stroke-color": "white",
          "circle-stroke-width": 3,
        },
      },
      searchParams: {},
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
  enableGlobe: props.btns.enableGlobe ?? true,
  enableMosaic: props.btns.enableMosaic ?? true,
  enableFeedback: props.btns.enableFeedback ?? true,
  enableGeolocation: props.btns.enableGeolocation ?? true,
  geolocationOptions: props.btns.geolocationOptions ?? {},
  searchParams: props.btns.searchParams,
}));

if (btnsProps.value.enableGlobe) {
  await import("@eox/map/src/plugins/globe");
}
// Prepare containers for scale line and cursor coordinates
const scaleLineRef = useTemplateRef("scale-line");
const cursorCoordsRef = useTemplateRef("cursor-coords");
const geoTarget = useTemplateRef("geoTarget");

/** @type {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"], undefined>>} */
const tooltipProperties = ref([]);
/** @type {import("vue").Ref<Exclude<import("@/types").EodashStyleJson["tooltip"], undefined>>} */
const compareTooltipProperties = ref([]);

const controls = computed(() => {
  const controlsObj = /** @type {import("@eox/map").ControlDictionary} */ ({
    Attribution: {
      collapsible: true,
    },
  });

  if (props.enableScaleLine && scaleLineRef.value) {
    controlsObj.ScaleLine = {
      target: scaleLineRef.value,
    };
  }

  if (props.enableCursorCoordinates && cursorCoordsRef.value) {
    controlsObj.MousePosition = {
      projection: "EPSG:4326",
      coordinateFormat: (c) => {
        if (!c) return "";
        const [lon, lat] = c;
        return `${Math.abs(lat).toFixed(3)} °${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(3)} °${lon >= 0 ? "E" : "W"}`;
      },
      target: cursorCoordsRef.value,
    };
  }

  if (btnsProps.value.enableGeolocation) {
    const geoOptions = {
      tracking: true,
      trackHeading: true,
      highAccuracy: true,
      trackAccuracy: true,
      ...btnsProps.value.geolocationOptions,
      target: geoTarget.value || undefined,
    };
    controlsObj.Geolocation = geoOptions;
  }

  return controlsObj;
});

const initialCenter = toRaw(props.center);
const initialZoom = toRaw(mapPosition.value?.[2] ?? props.zoom);

const animationOptions = ref({
  duration: 0, // Initially set to 0 for an instant "jump"
  easing: inAndOut,
});

const eoxMap =
  /** @type {import("vue").TemplateRef<import("@eox/map").EOxMap>} */ (
    useTemplateRef("eoxMap")
  );
const compareMap =
  /** @type {import("vue").TemplateRef<import("@eox/map").EOxMap>} */ (
    useTemplateRef("compareMap")
  );

const { selectedCompareStac } = storeToRefs(useSTAcStore());
const showCompare = computed(() =>
  props.enableCompare && !!selectedCompareStac.value ? "" : "first",
);

/**
 * `sync` hands the compare map the main map's own View instance, which the main
 * map then loses when the compare map is removed. Held here so it can be given
 * back.
 * @type {import("ol").View | null}
 */
let viewHolder = null;

watch(selectedCompareStac, (compare) => {
  if (compare && compareMap.value) {
    viewHolder = compareMap.value.map.getView();
    /** @type {any} */ (compareMap.value).sync = eoxMap.value;
    return;
  }
  if (viewHolder) {
    eoxMap.value?.map.setView(viewHolder);
    viewHolder = null;
  }
});

useHandleMapMoveEnd(eoxMap, mapPosition);

onMounted(async () => {
  if (!eoxMap.value) {
    console.error("EOxMap reference is not available on mounted.");
    return;
  }
  // assign map Element state to eox map
  mapEl.value = eoxMap.value;
  // enable terrain
  mapEl.value.globeConfig.terrain = true;
  defaultBaseLayers.value = structuredClone(toRaw(props.baseLayers));

  if (props.enableCompare) {
    mapCompareEl.value = compareMap.value;
    // a compare collection is only ever chosen after this, so the compare map
    // opens on the configured background
    assignGroupLayers(compareMap.value, BASE_LAYERS_GROUP, props.baseLayers);
    useUpdateTooltipProperties(
      eodashCompareCollections,
      compareTooltipProperties,
      true,
    );
  }

  // After the initial mount and "jump", set the animation duration for subsequent flyTo calls
  nextTick(() => {
    animationOptions.value.duration = 1200;
  });

  // the URL restore can resolve either side of this mount, so the map renders
  // what is already selected and watches for a selection that lands later
  const store = useSTAcStore();

  // a link that carried its own position keeps it, over the collection's
  // extent, but only for the collection it named
  /** @param {import("@eodash/stac").STACCollection | null} collection */
  const zoomUnlessRestored = (collection) => {
    if (!props.zoomToExtent || store.selectedItem) {
      return;
    }
    if (hasRestoredView.value) {
      hasRestoredView.value = false;
      return;
    }
    zoomToCollection(eoxMap.value, collection);
  };

  watch(() => store.selectedStac, zoomUnlessRestored);

  if (!store.selectedStac) {
    assignGroupLayers(eoxMap.value, BASE_LAYERS_GROUP, props.baseLayers);
    return;
  }

  await updateIndicatorLayers(eoxMap.value, {
    readers: eodashCollections,
    stac: store.selectedStac,
    timeOrItem: store.selectedItem ?? datetime.value,
    event: "layers:updated",
  });

  zoomUnlessRestored(store.selectedStac);
});

// sync map loading with the global loading state
useMapLoading(eoxMap, compareMap);

useUpdateTooltipProperties(eodashCollections, tooltipProperties);

const mainTooltipStyles = computed(() => ({
  visibility:
    tooltipProperties.value.length || !!tooltipAdapter.value
      ? "visible"
      : "hidden",
}));

const compareTooltipStyles = computed(() => ({
  visibility:
    compareTooltipProperties.value.length || !!tooltipAdapter.value
      ? "visible"
      : "hidden",
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
      if (tooltipAdapter.value) {
        return tooltipAdapter.value(param, map);
      }
      return undefined;
    }
    if (typeof param.value === "object") {
      param.value = JSON.stringify(param.value);
    }
    if (!isNaN(Number(param.value))) {
      const decimals = !isNaN(Number(tooltipProp.decimals))
        ? Number(tooltipProp.decimals)
        : 4;
      param.value = Number(param.value).toFixed(decimals).toString();
    }
    return {
      key: tooltipProp.title || tooltipProp.id,
      value: param.value + " " + (tooltipProp.appendix || ""),
    };
  };
};
const { mainRect } = useLayout();
const btnsTop = ref(0);
onMounted(() => {
  const eoDash = document.querySelector("eo-dash");
  btnsTop.value =
    (mainRect.value.top || eoDash?.getBoundingClientRect().top) ?? 0;
});
</script>

<style scoped>
.map-buttons-container {
  position: fixed;
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
