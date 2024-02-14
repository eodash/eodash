import { eodashConfigKey } from "@/store/Keys"
import { inject } from "vue"

/**
 * Sets user defined configuration on runtime.
 * Consumes `/config.js` file from the base URL, and assign it to `eodashConfig`
 * @async
 * @returns {Promise<EodashConfig>}
 * @see {@linkplain '@/eodashConfig.js'}
 */
export const useEodashRuntimeConfig = async () => {
  const eodashConfig = inject(eodashConfigKey)

  try {
    const config = (await import( /* @vite-ignore */new URL('/config.js', import.meta.url).href)).default

    Object.keys(eodashConfig).forEach(key => {
      eodashConfig[key] = config[key]
    })
  } catch (e) {
    console.error(e)
  }

  return eodashConfig
}
