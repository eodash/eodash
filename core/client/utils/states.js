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

/** whether the map postion was set in URL params on first load */
export const posIsSetFromUrl = ref(false);

/**
 * Current value of the layer control JSON form for the latest layer the user interacted with.
 * @type {import("vue").Ref<Record<string, any> | undefined>}
 */
export const layerControlFormValue = ref({});
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
