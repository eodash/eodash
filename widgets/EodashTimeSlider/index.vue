<template>
  <eox-timecontrol
    v-if="hasMultipleItems"
    :key="unref(mapEl)"
    ref="eoxTimecontrol"
    .for="mapEl"
    @select="onSelect"
    titleKey="title"
    .externalMapRendering="true"
    .animate="true"
    .initDate="datetime"
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
        .filters="unref(filters)"
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

import { computed, onMounted, unref, useTemplateRef } from "vue";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { createAnimationsLayers } from "./methods";

const { animate } = defineProps({
  filters: {
    type: Array,
    default: () => [],
  },
  animate: {
    type: Boolean,
    default: true,
  },
});
/** @type {import("vue").ShallowRef<HTMLElement>} */
const timesliderEl = useTemplateRef("eoxTimecontrol");
const hasMultipleItems = computed(() => {
  return eodashCollections.some((ec) => {
    const itemLinks = ec.collectionStac?.links.filter((l) => l.rel === "item");
    const itemsLink = ec.collectionStac?.links.some((l) => l.rel === "items");
    return (itemLinks && itemLinks.length > 1) || itemsLink;
  });
});

/**
 * apply the date
 * @param {CustomEvent<import("./types").TimelineSelectionEventDetail>} e
 */
const onSelect = (e) => {
  const { selectedItems, date } = e.detail;
 const allItems = Object.keys(selectedItems ?? {}).flatMap((id) => selectedItems[id]);
  if (!allItems.length) {
    return;
  }
  const [from,_to] = date;
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
const { selectedStac, stacEndpoint } = storeToRefs(useSTAcStore());
/**
 *
 * @param {CustomEvent<{
 *   selectedRangeItems: Record<string, { date: string; id: string; originalDate: string ; [key:string]: any}[]>;
 *   generate: (args: {
 *     mapLayers: Array<{ layers: Record<string, any>[]; date: string }>;
 *     center?: [number, number];
 *     zoom?: number;
 *   }) => Promise<void>;
 * }>} evt
 */
const onExport = async (evt) => {
  const { generate, selectedRangeItems } = evt.detail;
  if (!stacEndpoint.value) {
    return;
  }
  console.log("Exporting animation with items:", selectedRangeItems);

  const mapLayers = await createAnimationsLayers(
    stacEndpoint.value,
    selectedRangeItems,
    selectedStac,
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
  const parentDiv = timesliderEl.value.parentElement;
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
