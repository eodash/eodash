<template>
  <eox-timecontrol
    v-if="hasMultipleItems"
    :key="unref(mapEl)"
    ref="eoxTimecontrol"
    .for="mapEl"
    @select="onSelect"
    .filters="unref(filters)"
    titleKey="title"
    .externalMapRendering="true"
    .animate="true"
  >

  <eox-timecontrol-date></eox-timecontrol-date>
  <eox-timecontrol-picker
  .range="false"
  .showDots="true"
  .showItems="true"
  .popup="true"
  ></eox-timecontrol-picker>
  <eox-timecontrol-timelapse></eox-timecontrol-timelapse>
    <eox-timecontrol-timeline></eox-timecontrol-timeline>
  </eox-timecontrol>

  <!-- <eox-timeslider
    v-if="hasMultipleItems"
    ref="timeslider"
    :key="unref(mapEl)"
    @update="update"
    .externalMapRendering="true"
    .filters="unref(filters)"
    titleKey="title"
    layerIdKey="id"
    for="eox-map#main"
    .animate
    @export="onExport"
  /> -->
</template>
<script setup>
import { datetime, mapEl } from "@/store/states";
import { eodashCollections } from "@/utils/states";
// import "@eox/timeslider";
import "@eox/timecontrol";
import { computed, onMounted, unref, useTemplateRef } from "vue";
import { createLayersConfig } from "./EodashMap/methods/create-layers-config";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";

const { animate } = defineProps({
  filters: {
    type: Array,
    default: () =>
    // []
    [
        {
          key: "cloudCoverage",
          title: "Cloud Coverage",
          type: "range",
          expanded: true,
          min: 0,
          max: 100,
          step: 5,
          state: {
            min: 0,
            max: 40,
          },
        },
      ],
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
 *
 * @param {CustomEvent} e
 */
const onSelect = (e) => {
  console.log("TimeControl onSelect event:", e.detail);
  const {date} = e.detail;
  const [from, _to] = date;
  datetime.value =from.toISOString();
};
const { selectedStac } = storeToRefs(useSTAcStore());
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
  const mapLayers = await Promise.all(
    Object.values(selectedRangeItems).flatMap(async (itemSet) => {
      /** @type {Array<{ layers: Record<string, any>[]; date: string }>} */
      const mapLayersArr = [];
      for (const dateItem of itemSet) {
        await createLayersConfig(
          selectedStac.value,
          eodashCollections,
          dateItem.originalDate,
        ).then((layers) => {
          layers = anonimizeLayersCORS(layers);
          mapLayersArr.push({
            layers,
            date: dateItem.originalDate,
          });
        });
      }
      return mapLayersArr;
    }),
  ).then((results) => results.flat());

  console.log("Generated mapLayers for export:", mapLayers, selectedRangeItems);

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
/**
 *
 * @param {import("@eox/map").EoxLayer[]} layers
 */
function anonimizeLayersCORS(layers) {
  return layers.map((layer) => {
    if (layer.type === "Group") {
      layer.layers = anonimizeLayersCORS(layer.layers);
      return layer;
    }
    if (layer.source) {
      layer.source.crossOrigin = "anonymous";
    }
    return layer;
  });
}
</script>
