import { eodashConfigKey } from "@/store/Keys"
import { inject } from "vue"
import store from '@/store'

/**
 * Sets user defined configuration on runtime.
 * Consumes `/config.js` file from the base URL, and assign it to `eodashConfig`
 * @async
 * @returns {Promise<import("@/types").EodashConfig>}
 * @see {@linkplain '@/eodashConfig.js'}
 */
export const useEodashRuntimeConfig = async () => {
  const eodashConfig = /** @type {import("@/types").EodashConfig} */(inject(eodashConfigKey))
  /**
   * @param {import("@/types").EodashConfig} updatedConfig
   */
  const assignConfig = (updatedConfig) => {
    /** @type {(keyof import("@/types").EodashConfig)[]} */(Object.keys(eodashConfig))
      .forEach((key) => {
        //@ts-expect-error
        eodashConfig[key] = updatedConfig[key]
      })
  }

  try {
    assignConfig(
      (await import( /* @vite-ignore */new URL('/config.js', import.meta.url).href)).default
    )
  } catch {
    try {
      assignConfig((await import("user:config")).default)
    } catch {
      console.error('no dashboard configuration assigned')
    }
  }
  return eodashConfig
}

/**
 * @param {(store:import("@/types").EodashStore)=> import("@/types").EodashConfig
 * | Promise<import("@/types").EodashConfig>}  configCallback
 */
export const defineCompiletimeConfig = async (configCallback) => {
  return await configCallback(store)
}
