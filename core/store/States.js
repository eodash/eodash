import { ref } from "vue";

/**
 * currently selected STAC endpoint
 */
export const currentUrl = ref('');
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
