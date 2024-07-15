<template>
  <div ref="rootRef" class="d-flex flex-column align-end justify-end my-3 pa-2">
    <v-btn
      v-if="exportMap"
      class="map-btn"
      :icon="[mdiMapPlus]"
      @click="showMapState = !showMapState"
    />
    <ExportState v-if="exportMap" v-model="showMapState" />
    <v-btn
      class="map-btn"
      :icon="[mdiEarthBox]"
      v-if="changeProjection && !!availableMapProjection"
      @click="changeMapProjection(availableMapProjection)"
    />
  </div>
</template>
<script setup>
import { makePanelTransparent } from "@/composables";
import { changeMapProjection } from "@/store/Actions";
import { availableMapProjection } from "@/store/States";
import { mdiEarthBox, mdiMapPlus } from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { ref } from "vue";

defineProps({
  exportMap: {
    type: Boolean,
    default: true,
  },
  changeProjection: {
    type: Boolean,
    default: true,
  },
});

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
  margin: 4px;
}
</style>
