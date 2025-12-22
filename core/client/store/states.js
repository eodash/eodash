/** setting default log level globally to warning */
import log from "loglevel";
log.setLevel(log.levels.WARN, true);

import { ref, shallowRef } from "vue";

/** Currently selected STAC endpoint */
export const currentUrl = ref("");

/** Currently selected compare STAC endpoint */
export const currentCompareUrl = ref("");

/** Currently selected datetime */
export const datetime = ref("");

/** Currently selected indicator */
export const indicator = ref("");
/** Currently selected compare indicator */
export const compareIndicator = ref("");

/**
 * Current map position
 *
 * @type {import("vue").Ref<(number | undefined)[]>}
 */
export const mapPosition = ref([]);

export const registeredProjections = ["EPSG:4326", "EPSG:3857"];

/** available projection to be rendered by `EodashMap` */
export const availableMapProjection = ref("EPSG:3857");

/** @type {import("vue").Ref<import("@eox/map").EOxMap | null>} */
export const mapEl = shallowRef(null);

/** @type {import("vue").Ref<import("@eox/map").EOxMap | null>} */
export const mapCompareEl = shallowRef(null);

export const activeTemplate = ref("");
/**
 * Selected point of interest, used for location collections
 */
export const poi = ref("");
/**
 * Selected point of interest for comparison, used for location collections
 */
export const comparePoi = ref("");

/** @type {import("vue").Ref<import("@eox/chart").EOxChart | null>} */
export const chartEl = shallowRef(null);

/** @type {import("vue").Ref<import("@eox/chart").EOxChart | null>} */
export const compareChartEl = shallowRef(null);

/**
 * Global loading state
 */
export const loading = ref(false);
