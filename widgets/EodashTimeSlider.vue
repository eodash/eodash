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
import { initMosaic, useInitMosaic } from "@/eodashSTAC/mosaic";
import { useSTAcStore } from "@/store/stac";
import { datetime, indicator, mapEl } from "@/store/states";
import { eodashCollections } from "@/utils/states";
import "@eox/timecontrol";
import "@eox/itemfilter";
import { storeToRefs } from "pinia";
import { computed, unref } from "vue";
import { createLayersConfig } from "./EodashMap/methods/create-layers-config";

const props = defineProps({
  filters: {
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
});

const store = useSTAcStore();

const hasMultipleItems = computed(() => {
  return eodashCollections.some((ec) => {
    const itemLinks = ec.collectionStac?.links.filter((l) => l.rel === "item");
    const itemsLink = ec.collectionStac?.links.some((l) => l.rel === "items");
    return (itemLinks && itemLinks.length > 1) || itemsLink;
  });
});
if (props.useMosaic && store.mosaicEndpoint) {
  useInitMosaic(store.mosaicEndpoint, undefined, store);
}
/**
 *
 * @param {CustomEvent} e
 */
const onSelect = async (e) => {
  const { date } = e.detail;
  const [from, to] = date;

  if (!props.useMosaic || !store.mosaicEndpoint) {
    datetime.value = from.toISOString();
    return;
  }

  initMosaic(
    store.mosaicEndpoint,
    {
      timeRange: [from.toISOString(), to.toISOString()],
      collection: indicator.value,
    },
    store,
  );
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

  generate({
    mapLayers,
  });
};

/**
 *
 * @param {Record<string, any>[]} layers
 * @returns {Record<string, any>[]}
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
<style scoped>
eox-itemfilter {
  --inline-container-height: 40px;
}
</style>
