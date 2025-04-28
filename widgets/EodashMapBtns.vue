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
      :icon="[compareIcon]"
      v-if="compareIndicators"
      @click="onCompareClick"
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
import { mdiCompare, mdiCompareRemove, mdiEarthBox, mdiMapPlus } from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { computed, ref, triggerRef } from "vue";
import PopUp from "./PopUp.vue";
import EodashItemFilter from "./EodashItemFilter.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { switchToCompare } from "@/utils/states";

const { compareIndicators, changeProjection, exportMap } = defineProps({
  exportMap: {
    type: Boolean,
    default: true,
  },
  changeProjection: {
    type: Boolean,
    default: true,
  },
  compareIndicators: {
    /** @type {import("vue").PropType<boolean | {compareTemplate?:string;fallbackTemplate?:string}> }*/
    type: [Boolean, Object],
    default: true,
  },
});
const { selectedStac, selectedCompareStac } = storeToRefs(useSTAcStore());
const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown ? "70%" : "500px"));
const popupHeight = computed(() => (smAndDown ? "90%" : "500px"));

const showMapState = ref(false);
const showCompareIndicators = ref(false);
const compareIcon = computed(() =>
  switchToCompare.value ? mdiCompare : mdiCompareRemove,
);
const onCompareClick = () => {
  if (switchToCompare.value) {
    showCompareIndicators.value = !showCompareIndicators.value;
  } else {
    switchToCompare.value = true;
    const fallbackTemplate =
      (typeof compareIndicators === "object" &&
        compareIndicators.fallbackTemplate) ||
      "expert";
    selectedCompareStac.value = null;
    setActiveTemplate(fallbackTemplate);
    triggerRef(selectedStac);
  }
};

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);

const onSelectCompareIndicator = () => {
  const compareTemplate =
    (typeof compareIndicators === "object" &&
      compareIndicators.compareTemplate) ||
    "compare";
  setActiveTemplate(compareTemplate);
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
