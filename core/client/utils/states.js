import { shallowReactive } from "vue";

/**
 * Array of eodash STAC Collections extracted from the current selected indicator.
 * Updated in {@link file://./../store/stac.js `loadSelectedSTAC`} widget
 * @type {import('./eodashSTAC').EodashCollection[]}
 * @private
 */
export const eodashCollections = shallowReactive([]);

/**
 * Array of eodash STAC Collections extracted from the current selected COMPARE indicator.
 * Updated in {@link file://./../store/stac.js ` loadSelectedCompareSTAC`} widget
 * @type {import('./eodashSTAC').EodashCollection[]}
 * @private
 */
export const eodashCompareCollections = shallowReactive([]);
