import {
  mdiBarley,
  mdiCurrencyEur,
  mdiHospitalBoxOutline,
  mdiImageFilterHdr,
  mdiLeaf,
  mdiLightningBolt,
  mdiSetCenter,
  mdiSnowflake,
  mdiWater,
  mdiWeatherWindy,
  mdiAccountMultiple,
  mdiHiking,
  mdiVolleyball,
  mdiWrench,
} from "@mdi/js";
import { reactive, ref, shallowRef } from "vue";

/**
 * Base layers shown when a collection brings none of its own.
 * Set from `EodashMap`'s `baseLayers` prop, which no store action can reach.
 *
 * @type {import("vue").ShallowRef<import("@eox/map").EoxLayer[]>}
 */
export const defaultBaseLayers = shallowRef([]);

/**
 * Whether the opening view came from the link rather than from a collection,
 * so that a shared position is not overridden by a zoom to the collection.
 */
export const hasRestoredView = ref(false);

/**
 * Whether a newly rendered collection moves the map to its extent.
 * Set from `EodashMap`'s `zoomToExtent` prop, which no store action can reach.
 */
export const shouldZoomToExtent = ref(false);

/**
 * Which item-level time properties the data layers carry. Turning both off also skips
 * fetching the collection's dates.
 * @type {import("@/types").LayerTimeProperties}
 */
export const layerTimeProperties = reactive({
  layerDatetime: true,
  timeControlValues: true,
});

/** whether it's the first load of the app, used to track if there are params in the url */
export const isFirstLoad = ref(false);

/**
 * Restored LayerControl state overrides from URL query parameters.
 * Keys are shortened layer IDs; values contain changed properties: { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }.
 * @type {import("vue").Ref<Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }> | null>}
 */
export const restoredLayersState = ref(null);

/**
 * Restored LayerControl state overrides for the compare map from URL query parameters.
 * @type {import("vue").Ref<Record<string, { visible?: boolean; opacity?: number; datetime?: string; config?: Record<string, any> }> | null>}
 */
export const restoredCompareLayersState = ref(null);

/**
 * Restored process jsonform values from URL query parameters.
 * @type {import("vue").Ref<Record<string, any> | null>}
 */
export const restoredProcessState = ref(null);

/**
 * Restored process jsonform values for compare panel from URL query parameters.
 * @type {import("vue").Ref<Record<string, any> | null>}
 */
export const restoredCompareProcessState = ref(null);

/**
 * Baseline layerConfig default form values captured on initial mount, keyed by layer ID.
 * @type {import("vue").Ref<Record<string, Record<string, any>>>}
 */
export const baselineLayerConfigDefaults = ref({});

/**
 * Baseline layerConfig default form values for compare map, keyed by layer ID.
 * @type {import("vue").Ref<Record<string, Record<string, any>>>}
 */
export const baselineCompareLayerConfigDefaults = ref({});

/**
 * Current value of the layer control JSON form, keyed by layer ID.
 * @type {import("vue").Ref<Record<string, Record<string, any>>>}
 */
export const layerControlFormValue = ref({});

/**
 * Current value of the layer control JSON form for compare map, keyed by layer ID.
 * @type {import("vue").Ref<Record<string, Record<string, any>>>}
 */
export const layerControlFormValueCompare = ref({});

/**
 * Trigger counter for layer state changes (visibility, opacity, datetime, config).
 */
export const layerStateChangeTrigger = ref(0);
export const layerStateChangeTriggerCompare = ref(0);

/**
 * STAC indicators color palette, defaults to Bank-Wong palette
 *  @type {string[]} */
export const collectionsPalette = reactive([
  "#009E73",
  "#0072B2",
  "#E69F00",
  "#CC79A7",
  "#56B4E9",
  "#D55E00",
]);

/**
 * Object containing data themes and their associated brand properties (icon and color).
 */
export const dataThemesBrands = {
  agriculture: {
    icon: mdiBarley,
    color: "#F2AF25",
  },
  water: {
    icon: mdiWater,
    color: "#73A6C7",
  },
  oceans: {
    icon: mdiWater,
    color: "#6DA2C5",
  },
  land: {
    icon: mdiImageFilterHdr,
    color: "#019E73",
  },
  health: {
    icon: mdiHospitalBoxOutline,
    color: "#32322C",
  },
  "covid-19": {
    icon: mdiHospitalBoxOutline,
    color: "#32322C",
  },
  combined: {
    icon: mdiSetCenter,
    color: "#56B4E9",
  },
  air: {
    icon: mdiWeatherWindy,
    color: "#475faf",
  },
  atmosphere: {
    icon: mdiWeatherWindy,
    color: "#475faf",
  },
  climate: {
    icon: mdiWeatherWindy,
    color: "#475faf",
  },
  economy: {
    icon: mdiCurrencyEur,
    color: "#8E81AF",
  },
  commerce: {
    icon: mdiCurrencyEur,
    color: "#8E81AF",
  },
  society: {
    icon: mdiAccountMultiple,
    color: "#8ac501",
  },
  biomass: {
    icon: mdiLeaf,
    color: "#009E73",
  },
  extremes: {
    icon: mdiLightningBolt,
    color: "#a1280a",
  },
  energy: {
    icon: mdiLightningBolt,
    color: "#475faf",
  },
  tourism: {
    icon: mdiHiking,
    color: "#80510aff",
  },
  sport: {
    icon: mdiVolleyball,
    color: "#e98e65ff",
  },
  cryosphere: {
    icon: mdiSnowflake,
    color: "#42C7B8",
  },
  industry: {
    icon: mdiWrench,
    color: "#8d845cff",
  },
};
