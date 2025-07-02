import store from "@/store";
import { reactive } from "vue";

/**
 * Handles importing user defined instance of Eodash
 *
 * @async
 * @param {string | undefined} runtimeConfig
 * @returns {Promise<import("@/types").Eodash | null | undefined>}
 * @see {@linkplain '@/eodash.js'}
 */
export const useEodashRuntime = async (runtimeConfig) => {
  let eodashConfig;

  if (runtimeConfig) {
    try {
      eodashConfig = await import(
        /* @vite-ignore */ new URL(runtimeConfig, import.meta.url).href
      ).then(async (m) => await m["default"]);
    } catch (e) {
      console.error("Error importing runtime config:", e);
      eodashConfig = null;
    }

    return reactive(eodashConfig);
  }

  try {
    const configJs = "/config.js";
    eodashConfig = await import(
      /* @vite-ignore */ new URL(configJs, import.meta.url).href
    ).then(async (m) => await m["default"]);
    if (!eodashConfig) {
      eodashConfig = await import("user:config").then(
        async (m) => await m["default"],
      );
      console.log("using user:config", eodashConfig);
    }
  } catch {
    try {
      eodashConfig = await import("user:config").then(
        async (m) => await m["default"],
      );
    } catch {
      console.error("no dashboard configuration defined");
      eodashConfig = null;
    }
  }
  return eodashConfig;
};

/**
 * @param {((
 *       store: typeof import("@/store").default,
 *     ) => (Promise<import("@/types").Eodash> | import("@/types").Eodash))
 *   | import("@/types").Eodash} config
 */
export const createEodash = async (config) => {
  if (config instanceof Function) {
    return await config(store);
  } else {
    return config;
  }
};
