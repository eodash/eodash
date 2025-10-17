<template>
  <PopUp v-model="dialog">
    <v-card style="max-height: 498px">
      <v-card-title class="bg-primary" style="max-height: 49px">
        <h5 class="text-h5">Storytelling map configuration</h5>
      </v-card-title>

      <v-card-text class="py-5 overflow-auto" style="height: 400px">
        <p class="text-body-2 mb-2">
          <strong>Map Layers Configuration</strong>
        </p>
        <div class="pa-3 code-block mb-4">
          {{ removeUnneededProperties(getLayers()) }}
        </div>

        <div v-if="props.getChartSpec?.()" class="mb-4">
          <p class="text-body-2 mb-2">
            <strong>Chart Spec (for export)</strong>
          </p>
          <div class="pa-3 code-block">
            {{ getChartExportCode() }}
          </div>
        </div>

        <div style="position: absolute; bottom: 15px">
          <v-expand-transition>
            <div v-if="copySuccess" class="text-success mr-3">
              <v-icon color="success" left :icon="[mdiClipboardCheckOutline]" />
              <small>copied!</small>
            </div>
          </v-expand-transition>
        </div>
        <v-row class="d-flex pt-3 justify-end">
          <v-col cols="6" class="flex-column align-center text-end">
            <v-btn
              v-for="btn in copyBtns"
              v-show="!btn.showIf || btn.showIf()"
              class="text-body-2"
              @click="btn.copyFn"
              :key="btn.id"
              small
              variant="text"
              :prepend-icon="[mdiContentCopy]"
            >
              copy as {{ btn.copyAs }}
            </v-btn>
          </v-col>
        </v-row>
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
import {
  getLayers as getLayerAction,
  getChartSpec as getChartSpecAction,
} from "@/store/actions";
import { mapPosition, availableMapProjection } from "@/store/states";
import { removeUnneededProperties } from "@/eodashSTAC/helpers";

const dialog = defineModel({ type: Boolean, required: true, default: false });

const props = defineProps({
  getLayers: {
    type: Function,
    default: getLayerAction,
  },
  getChartSpec: {
    type: Function,
    default: getChartSpecAction,
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
      await copyToClipBoard(JSON.stringify(props.getLayers()), copySuccess),
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
    showIf: () => !!props.getChartSpec?.(),
  },
];

const getMapStepCode = () => {
  const [x, y, z] = mapPosition.value;
  const preTag = "### <!" + "--{ layers=";
  const endTag = `zoom="${z}" center=[${[x, y]}] projection="${availableMapProjection.value}" animationOptions={duration:500}}-->
#### Tour step title
Text describing the current step of the tour and why it is interesting what the map shows currently
`;
  return `${preTag}'${JSON.stringify(removeUnneededProperties(props.getLayers()))}' ${endTag}`;
};
const getMapEntryCode = () => {
  const [x, y, z] = mapPosition.value;
  const preTag =
    "## Map Example <!" +
    '--{as="eox-map" style="width: 100%; height: 500px;" layers=';
  const endTag = `zoom="${z}" center=[${[x, y]}] projection="${availableMapProjection.value}" }-->`;
  return `${preTag}'${JSON.stringify(removeUnneededProperties(props.getLayers()))}' ${endTag}`;
};

const getChartExportCode = () => {
  const chartSpec = props.getChartSpec?.();
  if (!chartSpec) return "";
  const preTag = "## Chart Example <!" + '--{as="eox-chart" spec=';
  const endTag = " }-->";
  return `${preTag}${JSON.stringify(chartSpec)}${endTag}`;
};
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
