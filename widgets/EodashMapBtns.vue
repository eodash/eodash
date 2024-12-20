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
    <v-btn
      class="map-btn"
      :icon="[mdiCompare]"
      v-if="compareIndicators"
      @click="showCompareIndicators = !showCompareIndicators"
    />
    <PopUp
      v-model="showCompareIndicators"
      :maxWidth="popupWidth"
      :maxHeight="popupHeight"
    >
      <EodashItemFilter
        :enableCompare="true"
        filters-title=""
        results-title="Select an indicator to compare"
        :filter-properties="[]"
        @select="onSelectCompareIndicator"
      />
    </PopUp>
  </div>
</template>
<script setup>
import { makePanelTransparent } from "@/composables";
import { changeMapProjection, setActiveTemplate } from "@/store/actions";
import { availableMapProjection } from "@/store/states";
import { mdiCompare, mdiEarthBox, mdiMapPlus } from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { computed, ref } from "vue";
import PopUp from "./PopUp.vue";
import EodashItemFilter from "./EodashItemFilter.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

defineProps({
  exportMap: {
    type: Boolean,
    default: true,
  },
  changeProjection: {
    type: Boolean,
    default: true,
  },
  compareIndicators: {
    type: Boolean,
    default: true,
  },
});
const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown ? "70%" : "500px"));
const popupHeight = computed(() => (smAndDown ? "90%" : "500px"));

const showMapState = ref(false);
const showCompareIndicators = ref(false);

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);

const onSelectCompareIndicator = () => {
  setActiveTemplate("compare");
  showCompareIndicators.value = !showCompareIndicators.value;
};

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
