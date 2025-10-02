<template>
  <span>
    <v-row class="title align-center justify-space-between">
      <h4>Catalog Items</h4>
      <EodashLayoutSwitcher :target="layoutTarget" :icon="layoutIcon" />
    </v-row>
    <eox-itemfilter
      ref="itemfilter"
      titleProperty="id"
      imageProperty="preview"
      .filterProperties="filterProperties"
      .items="items"
      @select="onSelectItem"
      @filter="onFilter"
      :externalFilter="externalFilterHandler"
    >
      <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>
      <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
    </eox-itemfilter>
  </span>
</template>

<script setup>
import { ref, useTemplateRef } from "vue";
import { useSTAcStore } from "@/store/stac";
import { createFilterProperties, externalFilter } from "./methods/filters";
import { useSearchOnMapMove, useRenderItemsFeatures } from "./methods/map";
import { onSelect, onFilter as onFilterHandler } from "./methods/handlers";
import axios from "@/plugins/axios";
import { mdiViewDashboard } from "@mdi/js";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";

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
      },
    ],
  },
});

// Store and template refs
const store = useSTAcStore();
const itemfilterEl = useTemplateRef("itemfilter");

// Reactive state
/** @type {import("vue").Ref<import("@/types").GeoJsonFeature[]>} */
const currentItems = ref([]);

// Initial data fetch
await axios
  .get(store.stacEndpoint + "/search?limit=100")
  .then((res) => (currentItems.value = res.data.features));

const items = currentItems.value;

const filterProperties = createFilterProperties(props.filters);
/**
 * @param {any[]} _
 * @param {Record<string,any>} filters
 */
const externalFilterHandler = (_, filters) => {
  return externalFilter(filters, props.filters, props.bboxFilter);
};

// Event handlers
/**
 * @param {CustomEvent} evt
 */
const onFilter = (evt) => {
  onFilterHandler(evt, currentItems);
};

/**
 * @param {CustomEvent} evt
 */
const onSelectItem = (evt) => {
  onSelect(evt, store);
};

// composables

// Render items features on the map
useRenderItemsFeatures(currentItems);
// Search on map move logic
useSearchOnMapMove(itemfilterEl, props.bboxFilter);
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
