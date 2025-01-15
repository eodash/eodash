import { ref, shallowReactive } from "vue";

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

/** @type {import("vue").Ref<Record<string,any>|undefined>} */
export const layerControlFormValue = ref({});
