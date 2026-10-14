<template>
  <span class="d-flex flex-column">
    <eox-layercontrol
      v-if="showControls"
      ref="layerControl"
      :key="mapElement"
      :style="cssVars"
      :for="mapElement"
      .tools="tools"
      .colormapRegistry="colormapRegistry"
      .showLayerZoomState="true"
      .customEditorInterfaces="bandsEditorInterface"
      toolsAsList="true"
      @datetime:updated="debouncedHandleDateTime"
      @layerConfig:change="onLayerConfigChange"
    >
      <span
        slot="layerstitle"
        class="d-flex justify-space-between ma-2 pa-2 flex-shrink-0"
      >
        <h4 v-if="title">{{ title }}</h4>
        <EodashLayoutSwitcher
          v-if="enableLayoutSwitcher"
          :target="layoutTarget"
          :icon="layoutIcon"
        />
      </span>
    </eox-layercontrol>
  </span>
</template>
<script setup>
import "color-legend-element";
import "@eox/timecontrol";
import { computed, useTemplateRef } from "vue";
import { useEventListener } from "@vueuse/core";
import { mapEl, mapCompareEl } from "@/store/states";
import { assignLayers } from "@/store/actions";
import { registerProjections } from "@/eodashSTAC/projection";
import { eodashCollections, eodashCompareCollections } from "@/store/stac";
import {
  layerControlFormValue,
  layerControlFormValueCompare,
} from "@/utils/states";
import { findReaderByLayerId } from "@eodash/stac/helpers";
import { ANALYSIS_GROUP } from "@/eodashSTAC/layers";
import { updateGeoZarrBands, updateLayerUrl } from "@/eodashSTAC/helpers";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { bandsEditorInterface } from "@/utils/bands-editor";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";
import { mdiViewDashboard } from "@mdi/js";

if (!customElements.get("eox-layercontrol")) {
  await import("@eox/layercontrol");
}
if (!customElements.get("eox-jsonform")) {
  await import("@eox/jsonform");
}

const props = defineProps({
  /** Which map instance this control is bound to. Use `"second"` in a compare-mode layout. */
  map: {
    /** @type {import("vue").PropType<"first" | "second">} */
    //@ts-expect-error todo
    type: String,
    default: "first",
  },
  /** Tool tabs shown inside `eox-layercontrol`. Remove entries to hide individual tabs. */
  tools: {
    type: /** @type {import("vue").PropType<string[]>} */ (Array),
    default: () => ["datetime", "info", "config", "legend", "opacity"],
  },
  /** Heading rendered above the layer list. Set to `false` to hide it. */
  title: {
    type: /** @type {import("vue").PropType<string | false>} */ ([
      String,
      Boolean,
    ]),
    default: "Layers",
  },
  /** CSS custom-property overrides forwarded to the underlying `eox-layercontrol` element via its `style` attribute. */
  cssVars: {
    type: /** @type {import("vue").PropType<Record<string, string>>} */ (
      Object
    ),
    default: () => ({}),
  },
  layoutIcon: {
    type: String,
    default: mdiViewDashboard,
  },
  layoutTarget: {
    type: String,
  },
  /** Milliseconds to wait before applying a datetime change from the layer control. */
  datetimeDebounce: {
    /** @type {import("vue").PropType<number>} */
    type: Number,
    default: 500,
  },
});

const enableLayoutSwitcher = computed(
  () => !!props.layoutTarget && !!props.layoutIcon,
);

const { selectedCompareStac, selectedStac, colormapRegistry } =
  storeToRefs(useSTAcStore());

const showControls = computed(() => {
  if (props.map === "second") {
    return mapCompareEl.value !== null && selectedCompareStac.value !== null;
  }
  return mapEl.value !== null && selectedStac.value !== null;
});

const eodashCols =
  props.map === "second" ? eodashCompareCollections : eodashCollections;
const mapElement = props.map === "second" ? mapCompareEl : mapEl;

const layerControl = useTemplateRef("layerControl");

// TODO: remove once eox-layercontrol re-renders its tools when eox-map sets
// a GeoZarr layer's `layerDatetime` after reading the store's time axis.
const refreshTools = () =>
  layerControl.value?.shadowRoot
    ?.querySelectorAll("eox-layercontrol-layer-tools")
    .forEach((/** @type {any} */ el) => el.requestUpdate());
// `layerschanged` fires right after eox-map creates the layers, before their async setup
useEventListener(mapElement, "layerschanged", () => {
  for (const layer of mapElement.value?.map.getAllLayers() ?? []) {
    // @ts-expect-error eox-map's custom layer property is not in OL's event types
    layer.un("change:layerDatetime", refreshTools);
    // @ts-expect-error eox-map's custom layer property is not in OL's event types
    layer.on("change:layerDatetime", refreshTools);
  }
});

/** @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt */
const handleDatetimeUpdate = async (evt) => {
  const { layer, datetime } = evt.detail;
  // a time slice inside the layer's own store, which eox-layercontrol already switched
  if (layer.get("layerDatetime")?.sliceMap) return;

  const ec = findReaderByLayerId(eodashCols, layer.get("id"));
  if (!ec) return;

  const { layers: updatedLayers, projections } = await ec.updateLayers(
    datetime,
    layer.get("id"),
    mapElement.value?.layers ?? [],
  );
  if (!updatedLayers.length) return;

  await registerProjections(projections);

  const group = updatedLayers.find((l) => l?.properties?.id === ANALYSIS_GROUP);
  const dataLayers = group?.type === "Group" ? group.layers : undefined;

  if (dataLayers?.length) {
    // Add expand to all analysis layers
    dataLayers.forEach((dl) => {
      //@ts-expect-error properties is optional upstream, always built here
      dl.properties.layerControlExpand = true;
      //@ts-expect-error properties is optional upstream, always built here
      dl.properties.layerControlToolsExpand = true;
    });
    await assignLayers(
      mapElement.value,
      updatedLayers,
      props.map === "second" ? "compareLayertime:updated" : "layertime:updated",
    );
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
  }, props.datetimeDebounce);
};
// ------
/**
 *
 * @param {Event & {detail:{layer:import("ol/layer").Layer;jsonformValue:Record<string,any>}}} evt
 */
const onLayerConfigChange = (evt) => {
  updateGeoZarrBands(
    evt.detail.layer,
    evt.detail.jsonformValue,
    mapElement.value,
  );
  updateLayerUrl(evt.detail.layer, evt.detail.jsonformValue);

  // remember the selection on the collection that built the layer, so it
  // survives a time/item rebuild
  const { layer, jsonformValue } = evt.detail;
  const layerConfig = layer.get("_jsonDefinition")?.properties?.layerConfig;
  findReaderByLayerId(eodashCols, layer.get("id"))?.persistLayerConfig(
    layerConfig,
    jsonformValue,
  );

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
