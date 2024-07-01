<template>
  <PopUp v-model="dialog">
    <v-card>
      <v-card-title class="background-primary position-sticky">
        <h4 class="text-headline text-white">
          Storytelling map configuration
        </h4>
      </v-card-title>

      <v-card-text class="py-5">
        <p class="text-body-2">
          Copy and paste this code into the map layers field of the storytelling editor:
        </p>
        <div class="pa-3 code-block text-body-2">
          {{ getLayers(props.for) }}
        </div>

        <div style="position: absolute; bottom: 15px;">
          <v-expand-transition>
            <div v-if="copySuccess" class="success--text mr-3">
              <v-icon color="success" left :icon="[mdiClipboardCheckOutline]" />
              <small>copied!</small>
            </div>
          </v-expand-transition>
        </div>
        <v-row class="d-flex flex-column   pt-3">
          <v-col class="align-center text-end">
            <v-btn v-for="btn in copyBtns" class="text-body-1" @click="btn.copyFn" :key="btn.id" small variant="text"
              :prepend-icon="[mdiContentCopy]">
              copy as {{ btn.copyAs }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="dialog = !dialog">
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </PopUp>
</template>
<script setup>
import { mdiClipboardCheckOutline, mdiContentCopy } from "@mdi/js";
import PopUp from "./PopUp.vue";
import { copyToClipBoard } from "@/utils";
import { computed, ref } from "vue";
import { getLayers } from "@/store/Actions";
import { mapPosition } from "@/store/States";

const dialog = defineModel({ type: Boolean });

const props = defineProps({
  for: {
    type: String,
    default: "eox-map"
  }
});

const copySuccess = ref(false)

const copyBtns = [
  {
    id: Symbol(),
    copyFn: async () => await copyToClipBoard(mapEntryCode.value, copySuccess),
    copyAs: "simple map"
  },
  {
    id: Symbol(),
    copyFn: async () => await copyToClipBoard(JSON.stringify(getLayers(props?.for)), copySuccess),
    copyAs: "layers configuration"
  },
  {
    id: Symbol(),
    copyFn: async () => await copyToClipBoard(mapStepCode.value, copySuccess),
    copyAs: "map tour section"
  }
];

const mapStepCode = computed(() => {
  const [x, y, z] = mapPosition.value
  const preTag = '### <!--{ layers=';
  const endTag = `zoom="${z}" center=[${[x, y]}] animationOptions={duration:500}}-->
#### Tour step title
Text describing the current step of the tour and why it is interesting what the map shows currently
`;
  return `${preTag}${JSON.stringify(getLayers(props?.for))}' ${endTag}`
})
const mapEntryCode = computed(() => {
  const [x, y, z] = mapPosition.value
  const preTag = '## Map Example <!--{as="eox-map" style="width: 100%; height: 500px;" layers=';
  const endTag = `zoom="${z}" center=[${[x, y]}] }-->`;
  return `${preTag}${JSON.stringify(getLayers(props?.for))}' ${endTag}`;
})
</script>
<style scoped>
.background-primary {
  background: rgb(var(--v-theme-primary));
}

.code-block {
  background-color: #ddd;
  font-family: monospace;
}
</style>
