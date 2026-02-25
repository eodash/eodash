<template>
  <div ref="rootRef" class="map-buttons d-flex flex-column align-end">
    <button
      v-if="enableZoom && !isGlobe"
      class="primary small circle small-elevate"
      @click="onMapZoomIn"
    >
      <i class="small">
        <svg viewBox="0 0 24 24"><path :d="mdiPlus"></path></svg>
      </i>
      <div class="tooltip left">Zoom in</div>
    </button>
    <button
      v-if="enableZoom && !isGlobe"
      class="primary small circle small-elevate"
      @click="onMapZoomOut"
    >
      <i class="small">
        <svg viewBox="0 0 24 24"><path :d="mdiMinus"></path></svg>
      </i>
      <div class="tooltip left">Zoom out</div>
    </button>
    <button
      v-if="showMosaicButton"
      class="primary small circle small-elevate"
      @click="showMosaicLayer"
    >
      <i class="small">
        <svg viewBox="0 0 24 24"><path :d="mdiMap"></path></svg>
      </i>
      <div class="tooltip left">Back to Mosaic</div>
    </button>
    <button
      v-if="exportMap"
      class="primary small circle small-elevate"
      @click="showMapState = !showMapState"
    >
      <i class="small">
        <svg viewBox="0 0 24 24"><path :d="mdiMapPlus"></path></svg>
      </i>
      <div class="tooltip left">Extract storytelling configuration</div>
    </button>
    <ExportState v-if="exportMap" v-model="showMapState" />

    <button
      v-if="changeProjection && !!availableMapProjection"
      class="primary small circle small-elevate"
      @click="changeMapProjection(availableMapProjection)"
    >
      <i class="small">
        <svg viewBox="0 0 24 24"><path :d="mdiEarthBox"></path></svg>
      </i>
      <div class="tooltip left">Change map projection</div>
    </button>
    <button
      v-if="compareIndicators && !isGlobe"
      class="primary small circle small-elevate"
      @click="onCompareClick(compareIndicators)"
    >
      <i class="small">
        <svg viewBox="0 0 24 24"><path :d="compareIcon"></path></svg>
      </i>
      <div class="tooltip left">Compare mode</div>
    </button>
    <button
      v-if="backToPOIs && (poi || comparePoi)"
      class="primary small circle small-elevate"
      @click="loadPOiIndicator()"
    >
      <i class="small">
        <svg viewBox="0 0 24 24">
          <path :d="mdiStarFourPointsCircleOutline"></path>
        </svg>
      </i>
      <div class="tooltip left">Back to POIs</div>
    </button>
    <button
      v-if="enableGlobe && !isInCompareMode"
      class="primary small circle small-elevate"
      @click="switchGlobe"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24">
          <path :d="mdiEarth" />
        </svg>
      </i>
      <div class="tooltip left">
        {{ isGlobe ? "switch to 2D" : "switch to 3D" }}
      </div>
    </button>
    <eox-geosearch
      v-if="mapEl && !isGlobe && enableSearch"
      :for="mapEl"
      :endpoint="opencageUrl"
      :params="searchParams"
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
        v-bind="itemFilterConfig"
        :enableCompare="true"
        @select="onSelectCompareIndicator(compareIndicators)"
      />
    </PopUp>
  </div>
</template>
<script setup>
import { useTransparentPanel } from "@/composables";
import { changeMapProjection } from "@/store/actions";
import {
  activeTemplate,
  availableMapProjection,
  comparePoi,
  isGlobe,
  mapEl,
  poi,
} from "@/store/states";
import { mosaicState } from "@/utils/states";
import {
  mdiMap,
  mdiCompare,
  mdiCompareRemove,
  mdiEarthBox,
  mdiMapPlus,
  mdiMinus,
  mdiPlus,
  mdiStarFourPointsCircleOutline,
  mdiEarth,
} from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { computed, inject, ref } from "vue";
import PopUp from "^/PopUp.vue";
import EodashItemFilter from "^/EodashItemFilter.vue";
import { useDisplay } from "vuetify";
import { loadPOiIndicator } from "^/EodashProcess/methods/handling";
import { renderLatestMosaic } from "@/eodashSTAC/mosaic";
import {
  onCompareClick,
  onSelectCompareIndicator,
  switchGlobe,
  onMapZoomOut,
  onMapZoomIn,
  showCompareIndicators,
} from "./methods/btns";
import "@eox/geosearch";
import { eodashKey } from "@/utils/keys";

const showMosaicLayer = async () => {
  renderLatestMosaic();
  mosaicState.showButton = false;
};

const {
  compareIndicators,
  changeProjection,
  exportMap,
  backToPOIs,
  enableSearch,
  enableZoom,
  searchParams,
  enableGlobe,
  enableMosaic,
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
    /** @type {import("vue").PropType<boolean | {
    compareTemplate?:string;
    fallbackTemplate?:string;
    itemFilterConfig?:Partial<InstanceType<import("./EodashItemFilter.vue").default>["$props"]>
    }> }*/
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
  searchParams: {
    type: [Boolean, Object],
    default: true,
  },
  enableZoom: {
    type: Boolean,
    default: true,
  },
  enableGlobe: {
    type: Boolean,
    default: true,
  },
  enableMosaic: {
    type: Boolean,
    default: true,
  },
});

const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown.value ? "80%" : "70%"));
const popupHeight = computed(() => (smAndDown.value ? "90%" : "70%"));

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));
const showMosaicButton = computed(() => {
  const currentTemplate =
    "template" in eodash
      ? eodash?.template
      : eodash?.templates[activeTemplate.value];
  const mosaicPropIsEnabled = currentTemplate?.widgets.some((w) => {
    if ("defineWidget" in w) {
      const sw = w.defineWidget(null);
      //@ts-expect-error todo
      return sw?.widget?.properties?.useMosaic;
    }
    //@ts-expect-error todo
    return w?.widget?.properties && w?.widget?.properties?.useMosaic;
  });
  return mosaicState.showButton && enableMosaic && mosaicPropIsEnabled;
});

const showMapState = ref(false);
const isInCompareMode = computed(
  () =>
    activeTemplate.value ===
    ((typeof compareIndicators === "object" &&
      compareIndicators?.compareTemplate) ||
      "compare"),
);
const compareIcon = computed(() =>
  isInCompareMode.value ? mdiCompareRemove : mdiCompare,
);
const itemFilterConfig = {
  enableHighlighting: false,
  resultType: "cards",
  style: "--select-filter-max-items: 8",
  "filters-title": "Select an indicator to compare",
  subTitleProperty: "subtitle",
  imageProperty: "thumbnail",
  aggregateResults: "collection_group",
  "results-title": "",
  ...(typeof compareIndicators === "object" &&
    compareIndicators.itemFilterConfig),
};

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);

useTransparentPanel(rootRef);

const opencageApiKey = process.env.EODASH_OPENCAGE || "NO_KEY_FOUND";
const opencageUrl = `https://api.opencagedata.com/geocode/v1/json?key=${opencageApiKey}`;
</script>

<style scoped>
@import url("@eox/ui/style.css");
/* Make sure panel does pass click event through */
.map-buttons {
  pointer-events: none !important;
}

.map-buttons button {
  pointer-events: auto !important;
  margin-bottom: 5px;
  background-color: var(--primary);
}
/* Make sure buttons have pointer event */
.geosearch-detached {
  pointer-events: auto !important;
}

/* Container constraints removal */
eox-geosearch {
  position: relative !important;
  overflow: visible !important;
  z-index: 10;
}
</style>
