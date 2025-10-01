<template>
  <eox-itemfilter
    class="fill-height"
    v-bind="config"
    ref="eoxItemFilter"
    style="overflow: auto; --background-color: none"
    @select="onSelect"
    .items="items"
  >
    <h4 slot="filterstitle" style="margin: 14px 8px">{{ filtersTitle }}</h4>
    <h4 slot="resultstitle" style="margin: 14px 8px">{{ resultsTitle }}</h4>
  </eox-itemfilter>
</template>
<script setup>
import { useSTAcStore } from "@/store/stac";
import { isFirstLoad } from "@/utils/states";
import "@eox/itemfilter";
import { computed, ref } from "vue";
const store = useSTAcStore();
const emit = defineEmits(["select"]);
const items = store.isApi
  ? store.stac
  : store.stac?.filter((item) => item.rel === "child");
const props = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  filtersTitle: {
    type: String,
    default: "Indicators",
  },
  resultsTitle: {
    type: String,
    default: "Results",
  },
  titleProperty: {
    type: String,
    default: "title",
  },
  aggregateResults: {
    type: String,
    default: undefined,
  },
  imageProperty: {
    type: String,
    default: "",
  },
  subTitleProperty: {
    type: String,
    default: "",
  },
  resultType: {
    type: String,
    default: "",
  },
  cssVars: {
    type: [String, Object],
    default: "",
  },
  enableHighlighting: { type: Boolean, default: true },
  expandMultipleFilters: { type: Boolean, default: true },
  expandMultipleResults: { type: Boolean, default: true },
  styleOverride: { type: String, default: "" },
  filterProperties: {
    /** @type {import("vue").PropType<{
     * keys:string[];
     * title:string;
     * type:string;
     * expanded?:boolean
     * }[]> }*/
    type: Array,
    default: () => [
      {
        keys: ["title", "themes", "description"],
        title: "Search by name or description",
        type: "text",
        expanded: true,
      },
      {
        key: "themes",
        title: "Filter by theme",
        type: "multiselect",
        expanded: true,
      },
    ],
  },
});
/**
 *
 * @param  {Function} loader Function to load the item
 * @param {Function} reset Function to reset the selection
 */
const createSelect = (loader, reset) => {
  /**
   * @param {import("stac-ts").StacLink | import("stac-ts").StacCollection} item
   */
  return async (item) => {
    if (item) {
      if (isFirstLoad.value) {
        // prevent the map from jumping to the initial position
        isFirstLoad.value = false;
      }
      const href = /** @type {string} */ (store.isApi ? item.id : item.href);
      await loader(href);
      emit("select", item);
    } else {
      reset();
    }
  };
};
const selectIndicator = createSelect(
  store.loadSelectedSTAC,
  () => (store.selectedStac = null),
);
const selectCompareIndicator = createSelect(
  store.loadSelectedCompareSTAC,
  store.resetSelectedCompareSTAC,
);
/** @param {any} evt*/
const onSelect = async (evt) => {
  const item = /** @type {import('stac-ts').StacLink} */ evt.detail;
  if (props.enableCompare) {
    selectCompareIndicator(item);
  } else {
    selectIndicator(item);
  }
};
const config = computed(() => ({
  titleProperty: props.titleProperty,
  enableHighlighting: props.enableHighlighting,
  expandMultipleFilters: props.expandMultipleFilters,
  expandMultipleResults: props.expandMultipleResults,
  subTitleProperty: props.subTitleProperty,
  resultType: props.resultType,
  imageProperty: props.imageProperty,
  aggregateResults: props.aggregateResults,
  style: props.cssVars,
  filterProperties: props.filterProperties,
  styleOverride: props.styleOverride,
}));
/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxItemFilter = ref(null);
</script>
<style scoped>
eox-itemfilter {
  --form-flex-direction: row;
}
@media (max-width: 768px) {
  eox-itemfilter {
    --form-flex-direction: column;
  }
}
</style>
