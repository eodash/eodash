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
    <button
      v-if="enableFeedback && eodash?.brand?.feedback"
      class="primary small circle small-elevate"
      @click="showFeedback = !showFeedback"
    >
      <i class="small"
        ><svg viewBox="0 0 24 24">
          <path :d="mdiMessageQuestion" />
        </svg>
      </i>
      <div class="tooltip left">Provide Feedback</div>
    </button>
    <div
      v-if="showFeedback && enableFeedback && eodash?.brand?.feedback"
      class="feedback-container small-elevate"
    >
      <eox-feedback
        :endpoint="eodash?.brand?.feedback?.endpoint"
        .schema="eodash?.brand?.feedback?.schema"
        @close="showFeedback = false"
      ></eox-feedback>
    </div>
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
    <v-alert
      v-if="showZoomHint || showItemViewHint"
      class="mosaic-hint pa-2"
      color="secondary"
      type="info"
      variant="elevated"
      density="compact"
      elevation="4"
    >
      <template v-if="showItemViewHint">
        Viewing individual item —
        <a
          class="mosaic-hint-link"
          @click.prevent="mosaicState.onReturnToOverview?.()"
        >
          Back to overview
        </a>
      </template>
      <template v-else>Zoom in to explore the data</template>
    </v-alert>
  </div>
</template>
<script setup>
import { useTransparentPanel, useEodash } from "@/composables";
import { changeMapProjection } from "@/store/actions";
import {
  activeTemplate,
  availableMapProjection,
  comparePoi,
  isGlobe,
  mapEl,
  mapPosition,
  poi,
} from "@/store/states";
import { mosaicState } from "@/utils/states";
import {
  mdiCompare,
  mdiCompareRemove,
  mdiEarthBox,
  mdiMapPlus,
  mdiMinus,
  mdiPlus,
  mdiStarFourPointsCircleOutline,
  mdiEarth,
  mdiMessageQuestion,
} from "@mdi/js";
import ExportState from "^/ExportState.vue";
import { computed, ref } from "vue";
import PopUp from "^/PopUp.vue";
import EodashItemFilter from "^/EodashItemFilter.vue";
import { useDisplay } from "vuetify";
import { loadPOiIndicator } from "^/EodashProcess/methods/handling";
import {
  onCompareClick,
  onSelectCompareIndicator,
  switchGlobe,
  onMapZoomOut,
  onMapZoomIn,
  showCompareIndicators,
} from "./methods/btns";
import "@eox/geosearch";

if (!customElements.get("eox-feedback")) {
  //@ts-expect-error will be fixed in https://github.com/EOX-A/EOxElements/pull/2238
  await import("@eox/feedback");
}
const eodash = useEodash();

const {
  compareIndicators,
  changeProjection,
  exportMap,
  backToPOIs,
  enableSearch,
  enableZoom,
  searchParams,
  enableGlobe,
  enableFeedback,
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
  enableFeedback: {
    type: Boolean,
    default: true,
  },
});

const { smAndDown } = useDisplay();
const popupWidth = computed(() => (smAndDown.value ? "80%" : "70%"));
const popupHeight = computed(() => (smAndDown.value ? "90%" : "70%"));

const showMapState = ref(false);
const showFeedback = ref(false);
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
const itemFilterConfig = computed(() => {
  return {
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
});

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);

useTransparentPanel(rootRef);

const opencageApiKey = process.env.EODASH_OPENCAGE || "NO_KEY_FOUND";
const opencageUrl = `https://api.opencagedata.com/geocode/v1/json?key=${opencageApiKey}`;

const showZoomHint = computed(() => {
  if (!mosaicState.latestLayer) return false;
  if (mosaicState.isItemView) return false;
  if (mosaicState.shouldRender && !mosaicState.shouldRender()) return false;
  const zoom = mapPosition.value?.[2] ?? 4;
  return zoom < mosaicState.visibilityThreshold;
});

const showItemViewHint = computed(
  () => mosaicState.isItemView && !!mosaicState.latestLayer,
);
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

.feedback-container {
  position: absolute;
  right: 70px;
  pointer-events: auto;
  z-index: 20;
  border-radius: 8px;
  min-width: 300px;
}

/* Make sure buttons have pointer event */
.geosearch-detached {
  pointer-events: auto !important;
}

.mosaic-hint {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  opacity: 0.8;
  border-radius: 8px;
  pointer-events: auto;
}

.mosaic-hint-link {
  color: inherit;
  cursor: pointer;
  text-decoration: underline;
  pointer-events: auto;
}

.mosaic-hint {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  opacity: 0.8;
  border-radius: 8px;
}
</style>
