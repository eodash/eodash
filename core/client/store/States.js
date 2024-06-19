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
