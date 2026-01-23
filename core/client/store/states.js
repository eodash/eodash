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

/** Whether the map is in globe mode */
export const isGlobe = ref(false);

/** Whether the charts are in fullscreen mode
 * @type {import("vue").Ref<boolean>}
 */
export const areChartsSeparateLayout = ref(false);

/** Holds main chart data
 *  @type {import("vue").Ref<Record<string,any>|null>}
 */
export const chartData = ref(null);

/** Holds compare chart data
 *  @type {import("vue").Ref<Record<string,any>|null>}
 */
export const compareChartData = ref(null);

/** Holds main chart spec
 * @type {import("vue").Ref<import("vega-embed").VisualizationSpec | null>}
 */
export const chartSpec = ref(null);

/** Holds compare chart spec
 * @type {import("vue").Ref<import("vega-embed").VisualizationSpec | null>}
 */
export const compareChartSpec = ref(null);

/** One of conditional flag for processing panel to show (it is forcibly changed to force between selecting indicator and finishing loading of a new one to prevent double load)
 * @type {import("vue").Ref<boolean>}
 */
export const processingPanelEnabledFlag = ref(true);

/** One of conditional flag for compare processing panel to show (it is forcibly changed to force between selecting compare indicator and finishing loading of a new one to prevent double load)
 * @type {import("vue").Ref<boolean>}
 */
export const processingPanelCompareEnabledFlag = ref(true);
