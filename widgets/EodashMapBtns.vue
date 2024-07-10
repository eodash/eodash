<template>
  <div ref="rootRef" class="d-flex align-end justify-end my-3 pa-2">
    <v-btn
      class="map-btn"
      :icon="[mdiMapPlus]"
      @click="showMapState = !showMapState"
    />
    <ExportState :header="header" :code="code" v-model="showMapState" />
  </div>
</template>
<script setup>
import { makePanelTransparent } from "@/composables";
import { mdiMapPlus } from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { ref } from "vue";
const header = "Export Map";
const code = `<h2>
           code example
         </h2>`;

const showMapState = ref(false);

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);
makePanelTransparent(rootRef);
</script>
<style scoped>
.map-btn {
  width: 36px;
  height: 36px;
  border-radius: 25%;
}
</style>
