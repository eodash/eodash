<template>
  <eox-timecontrol
    v-if="hasMultipleItems"
    :key="unref(mapEl)"
    ref="eoxTimecontrol"
    .for="mapEl"
    @select="onSelect"
    titleKey="title"
    .externalMapRendering="true"
    .animate="animate"
    .initDate="initDate"
  >
    <div class="d-flex g-10 align-center">
      <eox-timecontrol-date class="flex-grow-1"></eox-timecontrol-date>
      <eox-timecontrol-picker
        .range="false"
        .showDots="true"
        .showItems="true"
        .popup="true"
      ></eox-timecontrol-picker>

      <eox-itemfilter
        v-if="filters.length"
        .inlineMode="true"
        :showResults="false"
        .filterProperties="filters"
        @filter="onFilter"
      ></eox-itemfilter>
      <eox-timecontrol-timelapse @export="onExport"></eox-timecontrol-timelapse>
    </div>

    <eox-timecontrol-timeline class="mt-2"></eox-timecontrol-timeline>
  </eox-timecontrol>
</template>
<script setup>
import { datetime, mapEl } from "@/store/states";
import { eodashCollections } from "@/utils/states";
import "@eox/timecontrol";
import "@eox/itemfilter";

import { computed, onMounted, ref, unref, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { createAnimationLayers, scheduleMosaicUpdate } from "./methods";
import { useInitMosaic } from "@/eodashSTAC/mosaic";

const { animate, useMosaic, mosaicIndicators } = defineProps({
  filters: {
    /** @type {import("vue").PropType<import("@eox/itemfilter").EOxItemFilter["filterProperties"]>} */
    type: Array,
    default: () => [],
  },
  animate: {
    type: Boolean,
    default: true,
  },
  useMosaic: {
    type: Boolean,
    default: false,
  },
  mosaicIndicators: {
    /** @type {import("vue").PropType<string[]>} */
    type: Array,
    default: () => [],
  },
});

/** @type {import("vue").ShallowRef<HTMLElement>} */
const timesliderEl = useTemplateRef("eoxTimecontrol");

const startDate = new Date(datetime.value);
const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

const selectedRange = /** @type {import("vue").Ref<[string, string]>} */ (
  ref([startDate, endDate].map((d) => d.toISOString()))
);
const initDate = [startDate.toISOString().split("T")[0]];

/** @type {import("vue").Ref<import("@/types").ItemFilterFilters>} */
const currentFilters = ref({});

const hasMultipleItems = computed(() => {
  return eodashCollections.some((ec) => {
    const itemLinks = ec.collectionStac?.links.filter((l) => l.rel === "item");
    const itemsLink = ec.collectionStac?.links.some((l) => l.rel === "items");
    return (itemLinks && itemLinks.length > 1) || itemsLink;
  });
});

const store = useSTAcStore();
const { selectedStac, stacEndpoint } = storeToRefs(store);

const isMosaicEnabled = computed(() => useMosaic && !!store.mosaicEndpoint);

useInitMosaic(useMosaic ? store.mosaicEndpoint : null, {}, mosaicIndicators);

/**
 * Handles the selection event from the time control component.
 * It finds the closest item to the "from" selected date
 * and updates the global datetime state with that item's original date.
 *
 * @param {CustomEvent<import("./types").TimelineSelectionEventDetail>} e
 */
const onSelect = (e) => {
  const { selectedItems, date } = e.detail;
  // Update the selected range with the new dates
  selectedRange.value = date;

  // if mosaic is enabled, we don't need to find the closest item,
  // we just update the mosaic layer with the new time range and filters
  if (isMosaicEnabled.value) {
    scheduleMosaicUpdate(store.mosaicEndpoint, date, currentFilters.value);
    return;
  }

  const allItems = Object.keys(selectedItems ?? {}).flatMap(
    (id) => selectedItems[id],
  );
  if (!allItems.length) {
    return;
  }
  const [from, _to] = date;
  const fromDate = new Date(from).getTime();

  const closestItem = allItems.reduce((prev, curr) => {
    const prevDiff = Math.abs(new Date(prev.originalDate).getTime() - fromDate);
    const currDiff = Math.abs(new Date(curr.originalDate).getTime() - fromDate);
    return currDiff < prevDiff ? curr : prev;
  });

  if (closestItem) {
    datetime.value = closestItem.originalDate;
  }
};

/**
 * Handles filter changes from eox-itemfilter (e.g. cloud cover slider).
 * Updates the mosaic layer with the new filter state.
 *
 * @param {CustomEvent<import("./types").ItemFilterEventDetail>} e
 */
const onFilter = (e) => {
  if (!isMosaicEnabled.value) return;
  const { filters } = e.detail;
  currentFilters.value = filters;
  scheduleMosaicUpdate(store.mosaicEndpoint, selectedRange.value, filters);
};

/**
 *
 * @param {CustomEvent<import("./types").TimelineExportEventDetail>} evt
 */
const onExport = async (evt) => {
  const { generate, selectedRangeItems, filters } = evt.detail;

  if (!stacEndpoint.value) {
    return;
  }

  const mapLayers = await createAnimationLayers(
    stacEndpoint.value,
    selectedRange.value,
    selectedRangeItems,
    selectedStac,
    filters,
  );

  if (!mapLayers?.length) {
    console.warn("[eodash] No map layers generated for the animation.");
    return;
  }

  generate({
    mapLayers,
  });
};

onMounted(() => {
  const parentDiv = timesliderEl.value?.parentElement;
  const layoutItem = parentDiv?.parentElement;
  if (parentDiv && layoutItem && animate) {
    parentDiv.style.overflow = "visible";
    layoutItem.style.overflow = "visible";
  }
});
</script>
<style scoped>
eox-itemfilter {
  --inline-container-height: 40px;
}
</style>
