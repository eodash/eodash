<template>
  <span class="d-flex flex-column">
    <eox-layercontrol
      v-if="showControls"
      :key="mapElement"
      v-bind="config"
      :for="mapElement"
      .customEditorInterfaces="bandsEditorInterface"
      @datetime:updated="debouncedHandleDateTime"
      toolsAsList="true"
      ref="eoxLayercontrol"
      @layerConfig:change="onLayerConfigChange"
    >
      <slot name="layerstitle">
        <div>
          <p v-if="title" class="mt-2 mb-2">
            <strong>{{ title }}</strong>
          </p>
        </div>
      </slot>
    </eox-layercontrol>
  </span>
</template>
<script setup>
import "@eox/layercontrol";

import "@eox/jsonform";
import "@eox/timecontrol";
import "color-legend-element";

import { computed, ref } from "vue";
import { mapEl, mapCompareEl } from "@/store/states";
import { getColFromLayer } from "@/eodashSTAC/helpers";
import {
  eodashCollections,
  eodashCompareCollections,
  layerControlFormValue,
  layerControlFormValueCompare,
} from "@/utils/states";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { bandsEditorInterface } from "@/utils/bands-editor";

const props = defineProps({
  map: {
    /** @type {import("vue").PropType<"first" | "second">} */
    //@ts-expect-error todo
    type: String,
    default: "first",
  },
  tools: {
    type: Array,
    default: () => ["datetime", "info", "config", "legend", "opacity"],
  },
  title: {
    type: String || Boolean,
    default: "Layers",
  },
  cssVars: {
    type: Object,
  },
});

const config = {
  tools: props.tools,
  style: props.cssVars,
};

const { selectedCompareStac, selectedStac } = storeToRefs(useSTAcStore());
const showControls = computed(() => {
  if (props.map === "second") {
    return mapCompareEl.value !== null && selectedCompareStac.value !== null;
  }
  return mapEl.value !== null && selectedStac.value !== null;
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
    updatedLayers = await ec.updateLayerJson(
      datetime,
      layer.get("id"),
      props.map,
    );
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
/**
 *
 * @param {Event & {detail:{layer:import("ol/layer").Layer;jsonformValue:Record<string,any>}}} evt
 */
const onLayerConfigChange = (evt) => {
  if (props.map === "second") {
    layerControlFormValueCompare.value = evt.detail.jsonformValue;
  } else {
    layerControlFormValue.value = evt.detail.jsonformValue;
  }
};
</script>
<style scoped>
eox-layercontrol {
  overflow: auto;
}
</style>
