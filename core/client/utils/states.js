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
} from "@mdi/js";
import { reactive, ref, shallowReactive } from "vue";

/**
 * Array of eodash STAC Collections extracted from the current selected indicator.
 * Updated in {@link file://./../store/stac.js `loadSelectedSTAC`} widget
 *
 * @type {import('../eodashSTAC/EodashCollection').EodashCollection[]}
 * @private
 */
export const eodashCollections = shallowReactive([]);

/**
 * Array of eodash STAC Collections extracted from the current selected COMPARE indicator.
 * Updated in {@link file://./../store/stac.js ` loadSelectedCompareSTAC`} widget
 *
 * @type {import('../eodashSTAC/EodashCollection').EodashCollection[]}
 * @private
 */
export const eodashCompareCollections = shallowReactive([]);

/** whether it's the first load of the app, used to track if there are params in the url */
export const isFirstLoad = ref(false);

/**
 * Current value of the layer control JSON form for the latest layer the user interacted with.
 * @type {import("vue").Ref<Record<string, any> | undefined>}
 */
export const layerControlFormValue = ref({});

/**
 * Current value of the layer control JSON form for the latest layer the user interacted with.
 * @type {import("vue").Ref<Record<string, any> | undefined>}
 */
export const layerControlFormValueCompare = ref({});

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
  economy: {
    icon: mdiCurrencyEur,
    color: "#8E81AF",
  },
  biomass: {
    icon: mdiLeaf,
    color: "#009E73",
  },
  extremes: {
    icon: mdiLightningBolt,
    color: "#a1280a",
  },
  cryosphere: {
    icon: mdiSnowflake,
    color: "#42C7B8",
  },
};
/** used for switching in and out of compare mode @see {@link widgets/EodashMapBtns.vue} */
export const switchToCompare = ref(true);
