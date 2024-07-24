import { ref } from "vue";

/** Currently selected STAC endpoint */
export const currentUrl = ref("");
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
export const availableMapProjection = ref("");

/** @type {import("vue").Ref<HTMLElement & Record<string,any> | null>} */
export const mapEl = ref(null);
