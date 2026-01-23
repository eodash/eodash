<template>
  <eox-timecontrol
    v-if="hasMultipleItems"
    :key="timesliderUpdateRef"
    ref="eoxTimecontrol"
    .for="mapEl"
    @select="onSelect"
    titleKey="title"
    externalMapRendering
    .animate="animate"
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
        @filter="onFilter"
        v-if="filters.length"
        .inlineMode="true"
        :showResults="false"
        .filters="unref(filters)"
      ></eox-itemfilter>
      <eox-timecontrol-timelapse
        v-if="animate"
        @export="onExport"
      ></eox-timecontrol-timelapse>
    </div>

    <eox-timecontrol-timeline class="mt-2"></eox-timecontrol-timeline>
  </eox-timecontrol>
</template>
<script setup>
import { initMosaic, useInitMosaic } from "@/eodashSTAC/mosaic";
import { useSTAcStore } from "@/store/stac";
import { datetime, indicator, mapEl } from "@/store/states";
import { eodashCollections, timesliderUpdateRef } from "@/utils/states";
import "@eox/timecontrol";
import "@eox/itemfilter";
import { storeToRefs } from "pinia";
import { computed, ref, unref, watch } from "vue";
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
    default: true,
  },
  mosaicIndicators: {
    /** @type {import("vue").PropType<string[]>} */
    type: Array,
    default: () => ["sentinel-2-l2a"],
  },
});

const store = useSTAcStore();

/**
 * Checks if the current indicator supports mosaic
 */
const isMosaicEnabled = computed(() => {
  if (!props.useMosaic || !store.mosaicEndpoint) {
    return false;
  }
  if (!props.mosaicIndicators || !props.mosaicIndicators.length) {
    return true;
  }
  return props.mosaicIndicators.includes(indicator.value);
});

const hasMultipleItems = ref(false);

watch(
  indicator,
  async () => {
    //tmp hack
    await new Promise((r) => setTimeout(r, 400));
    if (isMosaicEnabled.value) {
      hasMultipleItems.value = true;
      timesliderUpdateRef.value += 1;
      return;
    }
    const analysisLayers = mapEl.value?.layers?.find(
      (layer) => layer.properties?.id === "AnalysisGroup",
    );
    //@ts-expect-error todo
    if (!analysisLayers || !analysisLayers?.layers.length) {
      hasMultipleItems.value = false;
      return;
    }
    //@ts-expect-error todo
    for (const layer of analysisLayers.layers) {
      if (layer?.properties?.timeControlValues?.length) {
        hasMultipleItems.value = true;
        return;
      }
    }
    hasMultipleItems.value = false;
    timesliderUpdateRef.value += 1;
  },
  { immediate: true },
);

if (store.mosaicEndpoint && props.useMosaic) {
  useInitMosaic(store.mosaicEndpoint, undefined, store, props.mosaicIndicators);
}
/** @type {[number, number]} */
let latestRange = [0, 0];
let currentIndicator = "";
/**
 *
 * @param {CustomEvent} e
 */
const onSelect = async (e) => {
  const { date } = e.detail;
  const [from, to] = date;
  if (from == latestRange[0] && to == latestRange[1]) {
    return;
  }
  if (currentIndicator !== indicator.value) {
    // tmp hack
    setTimeout(() => {
      console.log("[eodash] Triggering timeslider update");
      timesliderUpdateRef.value += 1;
    }, 400);
    currentIndicator = indicator.value;
  }
  latestRange = [from, to];

  if (!isMosaicEnabled.value) {
    datetime.value = from.toISOString();
    return;
  }

  initMosaic(
    //@ts-expect-error todo
    store.mosaicEndpoint,
    {
      timeRange: [from.toISOString(), to.toISOString()],
      collection: indicator.value,
      cloudCover: latestCloudCover ? latestCloudCover : undefined,
    },
    store,
  );
};
/** @type {number|null} */
let latestCloudCover = null;
/**
 *
 * @param {CustomEvent} e
 */
const onFilter = (e) => {
  if (!isMosaicEnabled.value) {
    return;
  }
  const { filters } = e.detail;
  const cloudCover =
    //@ts-expect-error todo
    filters.find((f) => f.key === "eo:cloud_cover")?.state?.max || null;
  if (
    cloudCover === null ||
    cloudCover === latestCloudCover ||
    [0, 100].includes(cloudCover)
  ) {
    return;
  }
  latestCloudCover = cloudCover;
  if (cloudCover === 100) {
    latestCloudCover = null;
  }
  initMosaic(
    //@ts-expect-error todo
    store.mosaicEndpoint,
    {
      timeRange: latestRange?.map((d) => new Date(d).toISOString()),
      collection: indicator.value,
      cloudCover,
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
