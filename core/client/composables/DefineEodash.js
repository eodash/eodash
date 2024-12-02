import store from "@/store";
import { eodashKey } from "@/utils/keys";
import { inject } from "vue";

/**
 * Handles importing user defined instance of Eodash
 *
 * @async
 * @param {string | undefined} runtimeConfig
 * @returns {Promise<import("@/types").Eodash>}
 * @see {@linkplain '@/eodash.js'}
 */
export const useEodashRuntime = async (runtimeConfig) => {
  const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));
  /** @param {import("@/types").Eodash} config */
  const assignInstance = (config) => {
    /** @type {(keyof import("@/types").Eodash)[]} */ (
      Object.keys(eodash)
    ).forEach((key) => {
      //@ts-expect-error to do
      eodash[key] = config[key];
    });
  };

  if (runtimeConfig) {
    assignInstance(
      (
        await import(
          /* @vite-ignore */ new URL(runtimeConfig, import.meta.url).href
        )
      ).default,
    );
    return eodash;
  }

  try {
    const configJs = "/config.js";
    assignInstance(
      (await import(/* @vite-ignore */ new URL(configJs, import.meta.url).href))
        .default,
    );
  } catch {
    try {
      assignInstance(
        await import("user:config").then(async (m) => await m["default"]),
      );
    } catch {
      console.error("no dashboard configuration defined");
    }
  }
  return eodash;
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
