<template>
  <div ref="root" class="d-flex flex-column item-catalog-container">
    <v-row class="title align-center justify-space-between flex-shrink-0">
      <h4>Catalog Items</h4>
      <EodashLayoutSwitcher :target="layoutTarget" :icon="layoutIcon" />
    </v-row>
    <eox-itemfilter
      class="itemfilter-scroll"
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
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import { useSTAcStore } from "@/store/stac";
import {
  createExternalFilter,
  createFilterProperties,
  createSubtitleProperty,
} from "./methods/filters";
import {
  useSearchOnMapMove,
  useRenderItemsFeatures,
  useHighlightOnFeatureHover,
  useRenderOnFeatureClick,
} from "./methods/map";
import {
  createOnFilterHandler,
  createOnSelectHandler,
  createOnMouseEnterResult,
  createOnMouseLeaveResult,
} from "./methods/handlers";
import axios from "@/plugins/axios";
import { mdiViewDashboard } from "@mdi/js";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";
import { indicator, mapCompareEl, mapEl } from "@/store/states";
import { useInitMosaic } from "@/eodashSTAC/mosaic";

if (!customElements.get("eox-itemfilter")) {
  await import("@eox/itemfilter");
}

// Props definition
const props = defineProps({
  title: {
    type: String,
    default: "Explore Catalog",
  },
  hoverProperties: {
    /** @type {import("vue").PropType<string[]>} */
    type: Array,
    default: () => ["datetime", "eo:cloud_cover"],
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
  enableCompare: {
    type: Boolean,
    default: false,
  },
});

// Template refs
const root = useTemplateRef("root");
const itemfilterEl = useTemplateRef("itemfilter");

/** @type {HTMLElement | null} */
// let parentPanel = null;

// Override parent panel's overflow to allow internal scrolling
onMounted(async () => {
  // parentPanel = root.value?.parentElement ?? null;
  // if (parentPanel) {
  //   parentPanel.style.overflow = "hidden";
  //   parentPanel.style.display = "flex";
  //   parentPanel.style.flexDirection = "column";
  // }
});

onUnmounted(() => {
  // Restore parent panel's original overflow
  // if (parentPanel) {
  //   parentPanel.style.overflow = "";
  //   parentPanel.style.display = "";
  //   parentPanel.style.flexDirection = "";
  // }
  store.selectedItem = null;
});

const store = useSTAcStore();

// Mosaic Logic
if (props.useMosaic && store.mosaicEndpoint) {
  useInitMosaic(store.mosaicEndpoint, { collection: indicator.value }, store);
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
  currentItems,
);

// Event handlers
/**
 * @param {CustomEvent} evt
 */
const onFilter = createOnFilterHandler(
  currentItems,
  props.enableCompare ? mapCompareEl : mapEl,
);

/**
 * @param {CustomEvent} evt
 */
const onSelectItem = createOnSelectHandler(
  store,
  props.enableCompare,
  props.enableCompare ? mapCompareEl : mapEl,
);

// composables

// Render items features on the map
useRenderItemsFeatures(
  currentItems,
  props.enableCompare ? mapCompareEl : mapEl,
);
// Search on map move logic
useSearchOnMapMove(
  itemfilterEl,
  props.bboxFilter,
  props.enableCompare ? mapCompareEl : mapEl,
);
// Render on feature click
useRenderOnFeatureClick(
  itemfilterEl,
  store,
  props.enableCompare ? mapCompareEl : mapEl,
  props.enableCompare,
);
// highlight on feature hover
useHighlightOnFeatureHover(
  itemfilterEl,
  props.enableCompare ? mapCompareEl : mapEl,
  props.hoverProperties,
);
const onMouseEnterResult = createOnMouseEnterResult(
  props.enableCompare ? mapCompareEl : mapEl,
);
const onMouseLeaveResult = createOnMouseLeaveResult(
  props.enableCompare ? mapCompareEl : mapEl,
);
</script>
<style scoped lang="scss">
.item-catalog-container {
  overflow: hidden;
}

.itemfilter-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.5rem;
  --eox-itemfilter-results-color: var(--v-theme-primary) !important;
}

.title {
  padding: 1em;
  margin: 0.2em;
  flex-shrink: 0;
}
</style>
