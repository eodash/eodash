import { ref } from "vue";

/**
 * currently selected STAC endpoint
 */
export const currentUrl = ref('');

/**
 * ol map object. Updated by the config file.
 * @type {import("vue").Ref<import('ol').Map | null>}
 */
export const mapInstance = ref(null);
