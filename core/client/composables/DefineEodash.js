import store from "@/store";
import { eodashKey } from "@/utils/keys";
import { inject, reactive } from "vue";

/**
 * Handles importing user defined instance of Eodash
 *
 * @async
 * @param {string | undefined| (()=> Promise<import("@/types").Eodash>) | Function} runtimeConfig
 * @see {@linkplain '@/eodash.js'}
 */
export const useEodashRuntime = async (
  runtimeConfig = process.env.EODASH_RUNTIME_CONFIG,
) => {
  let eodashConfig;
  const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

  if (runtimeConfig) {
    eodashConfig =
      typeof runtimeConfig === "function"
        ? await runtimeConfig()
        : await import(
            /* @vite-ignore */ new URL(runtimeConfig, import.meta.url).href
          ).then(async (m) => await m["default"]);
    if (!eodashConfig) {
      throw new Error(
        "No dashboard configuration defined in the runtime config:" +
          runtimeConfig,
      );
    }
    Object.assign(eodash, eodashConfig);
    return reactive(eodashConfig);
  }

  async function importUserConfig() {
    /* global __userConfigExist__:readonly */
    // injected by vite
    if (__userConfigExist__) {
      return import("user:config").then(async (m) => await m["default"]);
    }
  }
  try {
    const configJs = "/config.js";
    eodashConfig = await import(
      /* @vite-ignore */ new URL(configJs, import.meta.url).href
    ).then(async (m) => await m["default"]);
    if (!eodashConfig) {
      eodashConfig = await importUserConfig();
    }
  } catch {
    try {
      eodashConfig = await importUserConfig();
    } catch {
      console.error("no dashboard configuration defined");
      eodashConfig = null;
    }
  }
  Object.assign(eodash, eodashConfig);
  return reactive(eodash);
};

/**
 * @template {import("@/types").Eodash} T
 * @param {T | ((store: typeof import("@/store").default) => Promise<T>)} config
 * @returns {Promise<T>}
 */
export const createEodash = async (config) => {
  if (config instanceof Function) {
    return await config(store);
  } else {
    return config;
  }
};
