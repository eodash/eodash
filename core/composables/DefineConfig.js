import { eodashConfigKey } from "@/store/Keys"
import { inject } from "vue"
import store from '@/store'

/**
 * Sets user defined configuration on runtime.
 * Consumes `/config.js` file from the base URL, and assign it to `eodashConfig`
 * @async
 * @returns {Promise<EodashConfig>}
 * @see {@linkplain '@/eodashConfig.js'}
 */
export const useEodashRuntimeConfig = async () => {
  const eodashConfig = /** @type {EodashConfig} */(inject(eodashConfigKey))
  /**
   * @param {EodashConfig} updatedConfig
   */
  const assignConfig = (updatedConfig) => {
    /** @type {(keyof EodashConfig)[]} */(Object.keys(eodashConfig))
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
 * @param {(store:EodashStore)=>EodashConfig} configCallback
 */
export const defineCompiletimeConfig = (configCallback) => {
  return configCallback(store)
}
