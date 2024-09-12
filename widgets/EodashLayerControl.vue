<template>
  <span class="d-flex flex-column fill-height overflow-auto">
    <eox-layercontrol
      v-if="mapElement"
      :for="mapElement"
      @datetime:updated="debouncedHandleDateTime"
      class="fill-height"
      disableTabs="true"
      ref="eoxLayercontrol"
    />
  </span>
</template>
<script setup>
import "@eox/layercontrol";
import "@eox/jsonform";
import "@eox/timecontrol";

import { ref } from "vue";
import { mapEl, mapCompareEl } from "@/store/States";
import { getColFromLayer } from "@/utils/helpers";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";

const props = defineProps({
  map: {
    type: String,
    default: "first",
  },
});

const eodashCols =
  props.map === "second" ? eodashCompareCollections : eodashCollections;
const mapElement = props.map === "second" ? mapCompareEl : mapEl;

/** @type { import("vue").Ref<HTMLElement & Record<string,any> | null>} */
const eoxLayercontrol = ref(null);

/** @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt */
const handleDatetimeUpdate = async (evt) => {
  const { layer, datetime } = evt.detail;

  const ec = await getColFromLayer(eodashCols, layer);

  /** @type {Record<string,any>[] | undefined} */
  let updatedLayers = [];

  if (ec) {
    await ec.fetchCollection();
    updatedLayers = await ec.updateLayerJson(datetime, layer.get("id"));
  }
  /** @type {Record<String,any>[] | undefined} */
  const dataLayers = updatedLayers?.find(
    (l) => l?.properties?.id === "AnalysisGroup",
  )?.layers;

  if (dataLayers?.length) {
    // Add expand to all analysis layers
    dataLayers?.forEach((dl) => {
      dl.properties.layerControlExpand = true;
      dl.properties.layerControlToolsExpand = true;
    });
    // assign layers to the map
    /** @type {HTMLElement & Record<string,any>} */
    (mapElement.value).layers = updatedLayers;
  }
};

// -----  debounce logic
/** @type {NodeJS.Timeout | undefined} */
let timeout;

/**
 * @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt
 **/
const debouncedHandleDateTime = (evt) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    handleDatetimeUpdate(evt);
  }, 500);
};
// ------
</script>
