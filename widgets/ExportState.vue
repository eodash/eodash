<template>
  <PopUp v-model="dialog">
    <v-card style="max-height: 498px">
      <v-card-title class="bg-primary" style="max-height: 49px">
        <h5 class="text-h5">Storytelling map configuration</h5>
      </v-card-title>

      <v-card-text class="py-5 overflow-auto" style="height: 400px">
        <p class="text-body-2">
          Copy and paste this code into the map layers field of the storytelling
          editor:
        </p>
        <div class="pa-3 code-block">
          {{ removeUnneededProperties(getLayers()) }}
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
import { computed, ref } from "vue";
import { getLayers as getLayerAction } from "@/store/Actions";
import { mapPosition } from "@/store/States";
import { removeUnneededProperties } from "@/utils/helpers";

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
    copyFn: async () => await copyToClipBoard(mapEntryCode.value, copySuccess),
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
    copyFn: async () => await copyToClipBoard(mapStepCode.value, copySuccess),
    copyAs: "map tour section",
  },
];

const mapStepCode = computed(() => {
  const [x, y, z] = mapPosition.value;
  const preTag = "### <!" + "--{ layers=";
  const endTag = `zoom="${z}" center=[${[x, y]}] animationOptions={duration:500}}-->
#### Tour step title
Text describing the current step of the tour and why it is interesting what the map shows currently
`;
  return `${preTag}'${JSON.stringify(removeUnneededProperties(props.getLayers()))}' ${endTag}`;
});
const mapEntryCode = computed(() => {
  const [x, y, z] = mapPosition.value;
  const preTag =
    "## Map Example <!" +
    '--{as="eox-map" style="width: 100%; height: 500px;" layers=';
  const endTag = `zoom="${z}" center=[${[x, y]}] }-->`;
  return `${preTag}'${JSON.stringify(removeUnneededProperties(props.getLayers()))}' ${endTag}`;
});
</script>
<style scoped>
.code-block {
  background-color: #ddd;
  font-family: monospace;
  font-size: small;
}
</style>
