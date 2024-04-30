import { ref } from "vue";

/**
 * currently selected STAC endpoint
 */
export const currentUrl = ref('');

/**
 * ol map object. Updated by the config file.
 * @type {import("vue").Ref<import('openlayers').Map | null>}
 */
export const mapInstance = ref(null);

/**
 * currently selected datetime
 */
export const datetime = ref(new Date().toISOString());

/**
 * Currently selected indicator
 */
export const indicator = ref("")

/**
 * Current map position
 * @type {import("vue").Ref<(number|undefined)[]>}
 */
export const mapPosition = ref([])
