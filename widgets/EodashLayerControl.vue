<template>
  <span class="d-flex flex-column">
    <eox-layercontrol
      v-if="showControls"
      :key="mapElement"
      v-bind="config"
      :for="mapElement"
      .colormapRegistry="colormapRegistry"
      .showLayerZoomState="true"
      .customEditorInterfaces="bandsEditorInterface"
      @datetime:updated="debouncedHandleDateTime"
      toolsAsList="true"
      ref="eoxLayercontrol"
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
import { computed, ref, watch } from "vue";
import { mapEl, mapCompareEl } from "@/store/states";
import { getColFromLayer } from "@/eodashSTAC/helpers";
import {
  eodashCollections,
  eodashCompareCollections,
  layerControlFormValue,
  layerControlFormValueCompare,
} from "@/utils/states";
import { updateGeoZarrBands } from "@/eodashSTAC/helpers";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { bandsEditorInterface } from "@/utils/bands-editor";
import EodashLayoutSwitcher from "^/EodashLayoutSwitcher.vue";
import { mdiViewDashboard } from "@mdi/js";
import { useEmitLayersUpdate } from "@/composables";

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
    default: {},
  },
  layoutIcon: {
    type: String,
    default: mdiViewDashboard,
  },
  layoutTarget: {
    type: String,
  },
});

const config = {
  tools: props.tools,
  style: props.cssVars,
};

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

/** @type { import("vue").Ref<import("@eox/layercontrol").EOxLayerControl | null>} */
const eoxLayercontrol = ref(null);

// eox-timecontrol re-fires datetime:updated after layer reassignment;
// dedupe by (collectionId, datetime)
const processedDatetimes = new Map();
watch([selectedStac, selectedCompareStac], () => processedDatetimes.clear());

/** @param {CustomEvent<{layer:import('ol/layer').Layer; datetime:string;}>} evt */
const handleDatetimeUpdate = async (evt) => {
  const { layer, datetime } = evt.detail;
  const collectionId = layer.get("id")?.split(";:;")[0] ?? layer.get("id");
  if (processedDatetimes.get(collectionId) === datetime) return;
  // First event per collection is eox-timecontrol's mount echo.
  const isFirstEvent = !processedDatetimes.has(collectionId);
  processedDatetimes.set(collectionId, datetime);
  if (isFirstEvent) return;

  const ec = await getColFromLayer(eodashCols, layer);

  /** @type {Record<string,any>[] | undefined} */
  let updatedLayers = [];

  if (ec) {
    updatedLayers = await ec.updateLayerJson(
      datetime,
      layer.get("id"),
      mapElement.value?.layers ?? [],
    );
  }
  if (!updatedLayers?.length) return;
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
    /** @type {HTMLElement & Record<string,any>} */
    (mapElement.value).layers = updatedLayers;
    // Emit after layer assignment so listeners resolve against the new layer.
    await useEmitLayersUpdate(
      props.map === "second" ? "compareLayertime:updated" : "layertime:updated",
      mapElement.value,
      updatedLayers,
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
  }, 500);
};
// ------
/**
 *
 * @param {Event & {detail:{layer:import("ol/layer").Layer;jsonformValue:Record<string,any>}}} evt
 */
const onLayerConfigChange = (evt) => {
  updateGeoZarrBands(evt.detail.layer, evt.detail.jsonformValue);

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
