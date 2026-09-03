<template>
  <PopUp v-model="dialog">
    <v-card style="max-height: 498px">
      <v-card-title class="bg-primary" style="max-height: 49px">
        <h5 class="text-h5">Storytelling map configuration</h5>
      </v-card-title>

      <v-card-text class="py-5 overflow-auto" style="height: 400px">
        <div class="d-flex flex-wrap gap-2 mb-4">
          <v-btn
            v-for="btn in copyBtns"
            v-show="!btn.showIf || btn.showIf()"
            :key="btn.id"
            class="text-body-2"
            small
            variant="text"
            :prepend-icon="[mdiContentCopy]"
            @click="btn.copyFn"
          >
            copy as {{ btn.copyAs }}
          </v-btn>
        </div>

        <div style="position: absolute; bottom: 15px">
          <v-expand-transition>
            <div v-if="copySuccess" class="text-success mr-3">
              <v-icon color="success" left :icon="[mdiClipboardCheckOutline]" />
              <small>copied!</small>
            </div>
          </v-expand-transition>
        </div>

        <p class="text-body-2 mb-2">
          <strong>Map Layers Configuration</strong>
        </p>
        <div class="pa-3 code-block mb-4">
          {{ removeUnneededProperties(getLayers(), layerControlFormValue) }}
        </div>

        <div v-if="chartSpec" class="mb-4">
          <p class="text-body-2 mb-2">
            <strong>Chart Spec (for export)</strong>
          </p>
          <div class="pa-3 code-block">
            {{ getChartExportCode() }}
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions style="max-height: 49px">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="dialog = !dialog"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </PopUp>
</template>
<script setup>
import { mdiClipboardCheckOutline, mdiContentCopy } from "@mdi/js";
import PopUp from "./PopUp.vue";
import { copyToClipBoard } from "@/utils";
import { ref } from "vue";
import { getLayers as getLayerAction } from "@/store/actions";
import { mapPosition, availableMapProjection, chartSpec } from "@/store/states";
import { layerControlFormValue } from "@/utils/states";
import { flattenFormValues } from "@eodash/stac/helpers";
import { updateVectorLayerStyle } from "@eox/layercontrol";
import { base64EncodeSpec } from "@eox/chart";
import mustache from "mustache";
import log from "loglevel";

const dialog = defineModel({ type: Boolean, required: true, default: false });

const props = defineProps({
  getLayers: {
    type: Function,
    default: getLayerAction,
  },
});

const copySuccess = ref(false);

const copyBtns = [
  {
    id: Symbol(),
    copyFn: async () => await copyToClipBoard(getMapEntryCode(), copySuccess),
    copyAs: "simple map",
  },
  {
    id: Symbol(),
    copyFn: async () =>
      await copyToClipBoard(
        JSON.stringify(
          removeUnneededProperties(
            props.getLayers(),
            layerControlFormValue.value,
          ),
        ),
        copySuccess,
      ),
    copyAs: "layers configuration",
  },
  {
    id: Symbol(),
    copyFn: async () => await copyToClipBoard(getMapStepCode(), copySuccess),
    copyAs: "map tour section",
  },
  {
    id: Symbol(),
    copyFn: async () =>
      await copyToClipBoard(getChartExportCode(), copySuccess),
    copyAs: "chart",
    showIf: () => chartSpec.value,
  },
];

const getMapStepCode = () => {
  const [x, y, z] = mapPosition.value;
  const preTag = "### <!" + "--{ layers=";
  const endTag = `zoom="${z}" center=[${[x, y]}] projection="${availableMapProjection.value}" animationOptions={duration:500}}-->
#### Tour step title
Text describing the current step of the tour and why it is interesting what the map shows currently
`;
  return `${preTag}'${JSON.stringify(removeUnneededProperties(props.getLayers(), layerControlFormValue.value))}' ${endTag}`;
};
const getMapEntryCode = () => {
  const [x, y, z] = mapPosition.value;
  const preTag =
    "## Map Example <!" +
    '--{as="eox-map" style="width: 100%; height: 500px;" layers=';
  const endTag = `zoom="${z}" center=[${[x, y]}] projection="${availableMapProjection.value}" }-->`;
  return `${preTag}'${JSON.stringify(removeUnneededProperties(props.getLayers(), layerControlFormValue.value))}' ${endTag}`;
};

const getChartExportCode = () => {
  if (!chartSpec.value) return "";
  const preTag =
    "## Chart Example <!" + '--{as="eox-chart" style="height: 400px;" spec=';
  const endTag = " }-->";
  const escapedSpec = base64EncodeSpec(chartSpec.value);
  return `${preTag}'${escapedSpec}'${endTag}`;
};

/**
 * creates a structured clone from the layers and
 * removes all properties from the clone
 * except the ID and title
 *
 * @param {Record<string,any>[]} layers
 */
function removeUnneededProperties(layers, formValues = {}) {
  /**
   * @param {Record<string,any>} layer
   * @returns {Record<string,any>[]}
   */
  const processLayer = (layer) => {
    // If the layer (or group) is explicitly marked as not visible, skip it and all children
    if (layer.properties?.visible === false) {
      return [];
    }

    // If it's a Group, we just want its children
    if (layer.type === "Group" && Array.isArray(layer.layers)) {
      return layer.layers.flatMap(processLayer);
    }

    // Break any Vue Proxies/OpenLayers getters by stringifying first
    let clonedLayer;
    try {
      clonedLayer = JSON.parse(JSON.stringify(layer));
    } catch (_e) {
      clonedLayer = structuredClone(layer);
    }

    // Flatten formValues to handle nested properties (e.g., vminmax: { vmin, vmax })
    const flatFormValues = flattenFormValues(formValues);

    // Burn in style variables using Mustache if formValues are provided
    if (Object.keys(flatFormValues).length > 0) {
      // Stringify, render mustache, then parse back
      try {
        const renderedString = mustache.render(
          JSON.stringify(clonedLayer),
          flatFormValues,
        );
        clonedLayer = JSON.parse(renderedString);
      } catch (e) {
        log.warn(
          "[eodash] Failed to apply mustache templating during export cleanup:",
          e,
        );
      }
    }

    const {
      id,
      title,
      mapboxStyle,
      projection,
      applyOptions,
      layerConfig,
      visible,
    } = clonedLayer.properties || {};

    // If style was not at root but in properties (layerConfig), move it to root early
    if (!clonedLayer.style && layerConfig?.style) {
      clonedLayer.style = layerConfig.style;
    }

    // Burn in OpenLayers ["var", "name"] variables using flatFormValues overriding style.variables
    const styleVariables = {
      ...(clonedLayer.style?.variables || {}),
      ...flatFormValues,
    };

    if (clonedLayer.style && Object.keys(styleVariables).length > 0) {
      clonedLayer.style = updateVectorLayerStyle({
        ...clonedLayer.style,
        variables: styleVariables,
      });
    }

    clonedLayer.properties = {
      id,
      title,
      ...(mapboxStyle && { mapboxStyle }),
      ...(projection && { projection }),
      ...(applyOptions && { applyOptions }),
      ...(visible !== undefined && { visible }),
    };

    if (clonedLayer["interactions"]) {
      delete clonedLayer["interactions"];
    }

    /**
     * @param {any} obj
     */
    const cleanupProperties = (obj) => {
      if (!obj || typeof obj !== "object") return;

      for (const key in obj) {
        if (obj[key] === null) {
          delete obj[key];
        } else if (Array.isArray(obj[key])) {
          if (obj[key].length === 0) {
            delete obj[key];
          } else {
            obj[key].forEach(cleanupProperties);
          }
        } else if (typeof obj[key] === "object") {
          cleanupProperties(obj[key]);
          if (Object.keys(obj[key]).length === 0) {
            // we don't delete empty objects for now as it might break schema requirements
          }
        }
      }
    };
    cleanupProperties(clonedLayer);

    return [clonedLayer];
  };

  let rawLayers = layers;
  try {
    rawLayers = JSON.parse(JSON.stringify(layers));
  } catch (_e) {
    rawLayers = structuredClone(layers);
  }

  return rawLayers.flatMap(processLayer);
}
</script>
<style scoped>
.code-block {
  background-color: #ddd;
  font-family: monospace;
  font-size: small;
  max-height: 200px;
  overflow-y: auto;
}
</style>
