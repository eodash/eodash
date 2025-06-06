/**
 * `eodash` injection key.
 * @type {import("vue").InjectionKey<import("@/types").Eodash>}
 * @see {@link "@/plugins/index.js"}
 */
export const eodashKey = Symbol("eodash");
/** @type {import("@vueuse/core").EventBusKey<"layers:updated"|"time:updated"|"process:updated">} */
export const eoxLayersKey = Symbol("eoxMapLayers");
