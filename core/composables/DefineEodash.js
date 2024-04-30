import store from "@/store";
import { eodashKey } from "@/store/Keys";
import { inject } from "vue";



/**
 * Sets user defined instance on runtime.
 * Consumes `/@fs/config.js` and assign it to `eodash`
 * @async
 * @returns {Promise<import("@/types").Eodash>}
 * @param {string | undefined} runtimeConfig
 * @see {@linkplain '@/eodash.js'}
 */
export const useEodashRuntime = async (runtimeConfig) => {
  const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey))
  /**
   * @param {import("@/types").Eodash} config
   */
  const assignInstance = (config) => {
    Object.assign(eodash, config)
  }

  if (runtimeConfig) {
    assignInstance((await import( /* @vite-ignore */new URL(runtimeConfig, import.meta.url).href)).default)
    console.log(new URL(runtimeConfig, import.meta.url).href);
    return eodash
  }

  try {
    assignInstance(
      (await import( /* @vite-ignore */new URL('/config.js', import.meta.url).href)).default
    )
  } catch {
    try {
      assignInstance(await import("user:config").then(async m => await m['default']))
    } catch {
      console.error('no dashboard configuration defined')
    }
  }
  return eodash
}

/**
 * @param {(store:import("@/types").EodashStore)=> import("@/types").Eodash
 * | Promise<import("@/types").Eodash>}  configCallback
 */
export const createEodash = async (configCallback) => {
  return await configCallback(store)
}
