<template>
  <span class="d-flex flex-column fill-height overflow-auto pa-4">
    <eox-layercontrol
      v-if="mapEl"
      :for="mapEl"
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

import { ref } from "vue";
import { currentUrl, mapEl } from "@/store/States";
import { extractCollectionUrls, getColFromLayer } from "@/utils/helpers";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { EodashCollection } from "@/utils/eodashSTAC";

/** @type { import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxLayercontrol = ref(null);

const { selectedStac } = storeToRefs(useSTAcStore());

/** @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt */
const handleDatetimeUpdate = async (evt) => {
  const { layer, datetime } = evt.detail;
  const eodashColsUrls = extractCollectionUrls(
    selectedStac.value,
    currentUrl.value,
  );

  const eodashCols = await Promise.all(
    eodashColsUrls.map(async (endpoint) => {
      const col = new EodashCollection(endpoint);
      await col.fetchCollection();
      return col;
    }),
  );
  const ec = await getColFromLayer(eodashCols, layer);

  /** @type {Record<string,any>[] | undefined} */
  let updatedLayers = [];

  if (ec) {
    await ec.fetchCollection();
    console.log("🚀 the target ec:", ec.collectionStac);

    updatedLayers = await ec.updateLayerJson(datetime, layer.get("id"));
  }

  if (updatedLayers?.length) {
    /** @type {HTMLElement & Record<string,any>} */
    (mapEl.value).layers = updatedLayers;
  }
};
</script>
