<template>
  <span class="d-flex flex-column fill-height overflow-auto pa-4">
    <eox-layercontrol v-if="mapEl" :for="mapEl" @datetime:updated="debouncedHandleDateTime" class="fill-height"
      ref="eoxLayercontrol" />
  </span>
</template>
<script setup>
import "@eox/layercontrol";
import "@eox/jsonform";
import "@eox/timecontrol";

import { onMounted, ref, watch } from "vue";
import { currentUrl, mapEl } from "@/store/States";
import { extractCollectionUrls, getColFromLayer } from "@/utils/helpers";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { EodashCollection } from "@/utils/eodashSTAC";
import { getLayers } from "@/store/Actions";

/** @type { import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxLayercontrol = ref(null);

const { selectedStac } = storeToRefs(useSTAcStore());

/** @type {import('@/utils/eodashSTAC').EodashCollection[]} */
let eodashCols = [];

/** @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt */
const handleDatetimeUpdate = async (evt) => {
  console.log("before:", getLayers());

  const { layer, datetime } = evt.detail;

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
  console.log("after:", getLayers());
};

// -----  debounce logic
/** @type {NodeJS.Timeout | undefined} */
let timeout;

/**
 * @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt
 **/
const debouncedHandleDateTime = (evt) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    handleDatetimeUpdate(evt)
  }, 500)

}
// ------


onMounted(() => {
  // init eodash collections on selection
  watch(selectedStac, async (updatedSelectedStac) => {
    const eodashColsUrls = extractCollectionUrls(
      updatedSelectedStac,
      currentUrl.value,
    );

    eodashCols = await Promise.all(
      eodashColsUrls.map(async (endpoint) => {
        const col = new EodashCollection(endpoint);
        await col.fetchCollection();
        return col;
      }),
    );
  }, { immediate: true })
})
</script>
