<template>
  <div ref="rootRef" class="d-flex flex-column align-end">
    <v-btn
      v-if="exportMap"
      class="map-btn"
      :icon="[mdiMapPlus]"
      size="small"
      v-tooltip:bottom="'Extract Storytelling configuration'"
      @click="showMapState = !showMapState"
    />
    <ExportState v-if="exportMap" v-model="showMapState" />

    <v-btn
      class="map-btn"
      :icon="[mdiEarthBox]"
      size="small"
      v-tooltip:bottom="'Change map projection'"
      v-if="changeProjection && !!availableMapProjection"
      @click="changeMapProjection(availableMapProjection)"
    />
    <v-btn
      class="map-btn"
      :icon="[compareIcon]"
      size="small"
      v-tooltip:bottom="'Compare mode'"
      v-if="compareIndicators"
      @click="onCompareClick"
    />
    <v-btn
      class="map-btn"
      :icon="[mdiStarFourPointsCircleOutline]"
      size="small"
      v-tooltip:bottom="'back to POIs'"
      v-if="backToPOIs && poi"
      @click="loadPOiIndicator()"
    />
    <PopUp
      v-model="showCompareIndicators"
      :maxWidth="popupWidth"
      :width="popupWidth"
      :max-height="popupHeight"
      :height="popupHeight"
    >
      <EodashItemFilter
        :enableCompare="true"
        :enableHighlighting="false"
        resultType="cards"
        style="--select-filter-max-items: 8"
        filters-title="Select an indicator to compare"
        subTitleProperty="subtitle"
        imageProperty="thumbnail"
        aggregateResults="collection_group"
        results-title=""
        @select="onSelectCompareIndicator"
      />
    </PopUp>
  </div>
</template>
<script setup>
import { makePanelTransparent } from "@/composables";
import { changeMapProjection, setActiveTemplate } from "@/store/actions";
import { availableMapProjection, poi } from "@/store/states";
import {
  mdiCompare,
  mdiCompareRemove,
  mdiEarthBox,
  mdiMapPlus,
  mdiStarFourPointsCircleOutline,
} from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { computed, ref, triggerRef } from "vue";
import PopUp from "./PopUp.vue";
import EodashItemFilter from "./EodashItemFilter.vue";
import { useDisplay } from "vuetify";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { switchToCompare } from "@/utils/states";
import { loadPOiIndicator } from "./EodashProcess/methods/handling";

const { compareIndicators, changeProjection, exportMap, backToPOIs } =
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
      /** @type {import("vue").PropType<boolean | {compareTemplate?:string;fallbackTemplate?:string}> }*/
      type: [Boolean, Object],
      default: true,
    },
    backToPOIs: {
      type: Boolean,
      default: true,
    },
  });
const { selectedStac, selectedCompareStac } = storeToRefs(useSTAcStore());
const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown.value ? "80%" : "70%"));
const popupHeight = computed(() => (smAndDown.value ? "90%" : "70%"));

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
