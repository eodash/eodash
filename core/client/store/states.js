/** setting default log level globally to warning */
import log from "loglevel";
log.setLevel(log.levels.WARN, true);

import { ref } from "vue";

/** Currently selected STAC endpoint */
export const currentUrl = ref("");

/** Currently selected compare STAC endpoint */
export const currentCompareUrl = ref("");

/** Currently selected datetime */
export const datetime = ref(new Date().toISOString());

/** Currently selected indicator */
export const indicator = ref("");

/**
 * Current map position
 *
 * @type {import("vue").Ref<(number | undefined)[]>}
 */
export const mapPosition = ref([]);

export const registeredProjections = ["EPSG:4326", "EPSG:3857"];

/** available projection to be rendered by `EodashMap` */
export const availableMapProjection = ref("EPSG:3857");

/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
export const mapEl = ref(null);

/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
export const mapCompareEl = ref(null);

export const activeTemplate = ref("");
