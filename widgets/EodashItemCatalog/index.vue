<template>
  <span>
    <v-row class="title align-center justify-space-between">
      <h4>Catalog Items</h4>
      <EodashLayoutSwitcher :target="layoutTarget" :icon="layoutIcon" />
    </v-row>
    <eox-itemfilter
      ref="itemfilter"
      titleProperty="id"
      .imageProperty="imageProperty"
      .subTitleProperty="subTitleProperty"
      .filterProperties="filterProperties"
      .items="items"
      @select="onSelectItem"
      @filter="onFilter"
      @mouseenter:result="onMouseEnterResult"
      @mouseleave:result="onMouseLeaveResult"
      :externalFilter="externalFilterHandler"
    >
      <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>
      <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
    </eox-itemfilter>
  </span>
</template>

<script setup>
import { onUnmounted, ref, useTemplateRef } from "vue";
import { useSTAcStore } from "@/store/stac";
import {
  createExternalFilter,
  createFilterProperties,
  createSubtitleProperty,
} from "./methods/filters";
import {
  useSearchOnMapMove,
  useRenderItemsFeatures,
  useRenderOnFeatureHover,
} from "./methods/map";
import {
  createOnFilterHandler,
  createOnSelectHandler,
  onMouseEnterResult,
  onMouseLeaveResult,
} from "./methods/handlers";
import axios from "@/plugins/axios";
import { mdiViewDashboard } from "@mdi/js";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";

if (!customElements.get("eox-itemfilter")) {
  await import("@eox/itemfilter");
}

// Props definition
const props = defineProps({
  title: {
    type: String,
    default: "Explore Catalog",
  },
  layoutTarget: {
    type: String,
    default: "lite",
  },
  layoutIcon: {
    type: String,
    default: mdiViewDashboard,
  },
  filtersTitle: {
    type: String,
    default: "Filters:",
  },
  resultsTitle: {
    type: String,
    default: "Items:",
  },
  bboxFilter: {
    type: Boolean,
    default: true,
  },
  imageProperty: {
    type: String,
    default: "assets.thumbnail.href",
  },
  filters: {
    /** @type {import("vue").PropType<import("./types").FiltersConfig>} */
    type: Array,
    default: () => [
      {
        property: "eo:cloud_cover",
        type: "range",
        title: "Cloud Cover (%)",
        min: 0,
        max: 100,
        icon: `<svg style="height: 1rem; transform: translateY(-2px); fill: currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-cloudy</title><path d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13Z" /></svg>`,
        unitLabel: "%",
      },
    ],
  },
  useMosaic: {
    type: Boolean,
    default: false,
  },
});

// Store and template refs
const store = useSTAcStore();
const itemfilterEl = useTemplateRef("itemfilter");

// Mosaic Logic
import { updateMosaicLayer } from "@/eodashSTAC/mosaic";
import { mapEl } from "@/store/states";
import { mosaicState } from "@/utils/states";

import { watch } from "vue";
import { getLayers } from "@/store/actions";

/// todo: move this to a composable
/** @type {import("ol/events").EventsKey | null} */
let mapListener = null;
const setupMapListener = () => {
  if (mapEl.value && mapEl.value.map) {
    if (mapListener) {
      // already set up
      return;
    }
    mapListener = mapEl.value.map.on("moveend", async () => {
      const latLonExtent = mapEl.value?.lonLatExtent;
      if (!latLonExtent || !store.mosaicEndpoint) {
        return;
      }
      const [minLon, minLat, maxLon, maxLat] = latLonExtent;
      mosaicState.filters.spatial = {
        op: "s_intersects",
        args: [
          { property: "geometry" },
          {
            type: "Polygon",
            coordinates: [
              [
                [minLon, minLat],
                [maxLon, minLat],
                [maxLon, maxLat],
                [minLon, maxLat],
                [minLon, minLat],
              ],
            ],
          },
        ],
      };
      await updateMosaicLayer([...getLayers()], store.mosaicEndpoint);
    });
  }
};
/////

if (props.useMosaic && store.mosaicEndpoint) {
 // Initial render
 await updateMosaicLayer([...getLayers()], store.mosaicEndpoint);
 mosaicState.showButton = false;

 // Setup listener
 setupMapListener();

 // Watch for map availability
 watch(mapEl, () => {
   setupMapListener();
 },{deep: false});
}

// Reactive state
/** @type {import("vue").Ref<import("@/types").GeoJsonFeature[]>} */
const currentItems = ref([]);

// Initial data fetch
if (store.stacEndpoint) {
  await axios
    .get(store.stacEndpoint + "/search?limit=100")
    .then((res) => (currentItems.value = res.data.features));
}

const items = currentItems.value;

const filterProperties = createFilterProperties(props.filters);

const subTitleProperty = createSubtitleProperty(props.filters);

const externalFilterHandler = createExternalFilter(
  props.filters,
  props.bboxFilter,
);

// Event handlers
/**
 * @param {CustomEvent} evt
 */
const onFilter = createOnFilterHandler(currentItems);

/**
 * @param {CustomEvent} evt
 */
const onSelectItem = createOnSelectHandler(store);

// composables

// Render items features on the map
useRenderItemsFeatures(currentItems);
// Search on map move logic
useSearchOnMapMove(itemfilterEl, props.bboxFilter);

useRenderOnFeatureHover(itemfilterEl);

onUnmounted(() => {
  store.selectedItem = null;
  mosaicState.showButton = false;
  mosaicState.filters.spatial = null;
  if (mapListener && mapEl.value?.map) {
    //@ts-expect-error todo
    mapEl.value.map.un("moveend", mapListener);
    mapListener = null;
  }
});
</script>
<style scoped lang="scss">
eox-itemfilter {
  flex-basis: 20%;
  height: 100%;
  overflow: hidden !important;
  padding: 1rem;
  --eox-itemfilter-results-color: var(--v-theme-surface) !important;
}
.title {
  // padding: 1em;
  padding: 1em;
  margin: 0.2em;
}
</style>
