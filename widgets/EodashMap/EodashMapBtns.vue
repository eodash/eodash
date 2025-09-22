<template>
  <div ref="rootRef" class="map-buttons d-flex flex-column align-end">
    <button
      v-if="enableZoom"
      class="primary small circle small-elevate"
      @click="onMapZoomIn"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24"><path :d="mdiPlus" /></svg
      ></i>
      <div class="tooltip left">Zoom in</div>
    </button>

    <button
      v-if="enableZoom"
      class="primary small circle small-elevate"
      @click="onMapZoomOut"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24"><path :d="mdiMinus" /></svg
      ></i>
      <div class="tooltip left">Zoom out</div>
    </button>

    <button
      v-if="exportMap"
      class="primary small circle small-elevate"
      @click="showMapState = !showMapState"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24"><path :d="mdiMapPlus" /></svg
      ></i>
      <div class="tooltip left">Extract storytelling configuration</div>
    </button>
    <ExportState v-if="exportMap" v-model="showMapState" />

    <button
      v-if="changeProjection && !!availableMapProjection"
      class="primary small circle small-elevate"
      @click="changeMapProjection(availableMapProjection)"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24"><path :d="mdiEarthBox" /></svg
      ></i>
      <div class="tooltip left">Change map projection</div>
    </button>
    <button
      v-if="compareIndicators"
      class="primary small circle small-elevate"
      @click="onCompareClick"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24"><path :d="compareIcon" /></svg
      ></i>
      <div class="tooltip left">Compare mode</div>
    </button>
    <button
      v-if="backToPOIs && (poi || comparePoi)"
      class="primary small circle small-elevate"
      @click="loadPOiIndicator()"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24">
          <path :d="mdiStarFourPointsCircleOutline" /></svg
      ></i>
      <div class="tooltip left">Back to POIs</div>
    </button>
    <eox-geosearch
      v-if="enableSearch"
      :for="mapEl"
      :endpoint="opencageUrl"
      class="geosearch-detached"
      label="Search"
      small
      button
      list-direction="left"
      results-direction="down"
      tooltip="Search"
      tooltip-direction="left"
    ></eox-geosearch>
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
import { useTransparentPanel } from "@/composables";
import { changeMapProjection, setActiveTemplate } from "@/store/actions";
import {
  activeTemplate,
  availableMapProjection,
  comparePoi,
  mapEl,
  poi,
} from "@/store/states";
import {
  mdiCompare,
  mdiCompareRemove,
  mdiEarthBox,
  mdiMapPlus,
  mdiMinus,
  mdiPlus,
  mdiStarFourPointsCircleOutline,
} from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { computed, ref, triggerRef } from "vue";
import PopUp from "^/PopUp.vue";
import EodashItemFilter from "^/EodashItemFilter.vue";
import { useDisplay } from "vuetify";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import { loadPOiIndicator } from "^/EodashProcess/methods/handling";
import { easeOut } from "ol/easing.js";

import "@eox/geosearch";

const {
  compareIndicators,
  changeProjection,
  exportMap,
  backToPOIs,
  enableSearch,
  enableZoom,
} = defineProps({
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
  enableSearch: {
    type: Boolean,
    default: true,
  },
  enableZoom: {
    type: Boolean,
    default: true,
  },
});
const { selectedStac, selectedCompareStac } = storeToRefs(useSTAcStore());
const { resetSelectedCompareSTAC } = useSTAcStore();
const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown.value ? "80%" : "70%"));
const popupHeight = computed(() => (smAndDown.value ? "90%" : "70%"));

const showMapState = ref(false);
const showCompareIndicators = ref(false);
const compareIcon = computed(() =>
  activeTemplate.value ===
  ((typeof compareIndicators === "object" &&
    compareIndicators?.compareTemplate) ||
    "compare")
    ? mdiCompareRemove
    : mdiCompare,
);

const onCompareClick = () => {
  showCompareIndicators.value =
    activeTemplate.value !==
    ((typeof compareIndicators === "object" &&
      compareIndicators.compareTemplate) ||
      "compare");

  const fallbackTemplate =
    (typeof compareIndicators === "object" &&
      compareIndicators.fallbackTemplate) ||
    "expert";
  selectedCompareStac.value = null;
  resetSelectedCompareSTAC();
  setActiveTemplate(fallbackTemplate);
  triggerRef(selectedStac);
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

useTransparentPanel(rootRef);

const onMapZoomOut = () => {
  const map = mapEl.value?.map;
  const currentZoom = map?.getView().getZoom();
  if (currentZoom !== undefined && currentZoom !== null) {
    const view = map?.getView();

    if (view !== undefined && view.getZoom()) {
      view.animate({
        zoom: currentZoom - 1,
        duration: 250,
        easing: easeOut,
      });
    }
  }
};

const onMapZoomIn = () => {
  const map = mapEl.value?.map;
  const currentZoom = map?.getView().getZoom();
  if (currentZoom !== undefined && currentZoom !== null) {
    const view = map?.getView();

    if (view !== undefined && view.getZoom()) {
      view.animate({
        zoom: currentZoom + 1,
        duration: 250,
        easing: easeOut,
      });
    }
  }
};
const opencageApiKey = process.env.EODASH_OPENCAGE || "NO_KEY_FOUND";
const opencageUrl = `https://api.opencagedata.com/geocode/v1/json?key=${opencageApiKey}`;

/*const menu = document
  .querySelector("eox-geosearch")
  .renderRoot.querySelector("menu");*/
</script>

<style>
@import url("@eox/ui/style.css");

.map-buttons button {
  margin-bottom: 5px;
  background-color: var(--primary);
}

/* Container constraints removal */
eox-geosearch {
  position: relative !important;
  overflow: visible !important;
  z-index: 10;
}
</style>
