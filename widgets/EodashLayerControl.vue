<template>
  <span class="d-flex flex-column fill-height overflow-auto pa-4">
    <eox-layercontrol
      @datetime:updated="handleDatetimeUpdate"
      class="fill-height"
      ref="eoxLayercontrol"
    />
  </span>
</template>
<script setup>
import "@eox/layercontrol";
import "@eox/jsonform";
import "@eox/timecontrol";

import { onMounted, ref } from "vue";
import { currentUrl, mapEl } from "@/store/States";
import { extractCollectionUrls } from "@/utils/helpers";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { EodashCollection } from "@/utils/eodashSTAC";
import { getLayers } from "@/store/Actions";

/** @type { import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxLayercontrol = ref(null);

const { selectedStac } = storeToRefs(useSTAcStore());

/** @param {CustomEvent<{layer:string; datetime:string;}>} evt */
const handleDatetimeUpdate = (evt) => {
  console.log("old layers:", getLayers());

  const { layer, datetime } = evt.detail;
  const eodashColsUrls = extractCollectionUrls(
    selectedStac.value,
    currentUrl.value,
  );
  const eodashCols = eodashColsUrls.map(
    (endpoint) => new EodashCollection(endpoint),
  );
  /** @type {(Record<string,any>[] | undefined)[]} */
  const updatedLayersArray = [];
  eodashCols.forEach(async (ec) => {
    updatedLayersArray.push(await ec.updateLayerJson(datetime, layer));
  });
  const updatedLayers = updatedLayersArray.find((layers) => layers?.length);
  if (updatedLayers?.length) {
    /** @type {HTMLElement & Record<string,any>} */
    (mapEl.value).layers = updatedLayers;
  } else {
    console.warn("[eodash] no update has been made", updatedLayersArray);
  }
  console.log("updated layers:", getLayers());
};
onMounted(() => {
  /** @type{ HTMLElement & Record<string,any> }*/
  (eoxLayercontrol.value).for = mapEl.value;
  /** @type{ HTMLElement & Record<string,any> }*/
  (eoxLayercontrol.value).tools = [
    "info",
    "opacity",
    "config",
    "remove",
    "sort",
    "datetime",
  ];
});
</script>
