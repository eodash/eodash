import terminateProcess from "terminate/promise"

/**
 * @param {import('child_process').ChildProcessWithoutNullStreams} subprocess
 * @param {Function} assertFn
 * @optional @param {{
 * delay?:number;
 * terminate?:"before"|"after" // terminate subproces before or after assertion
 * }} options
 * @returns
 */
export async function assertAndKillChildProcess(subprocess, assertFn, options = {}) {
  const { terminate, delay } = { terminate: options.terminate ?? "before", delay: options.delay ?? 2000 }
  return await new Promise((resolve, _) => {
    setTimeout(async () => {
      if (terminate == "after") {
        await assertFn()
      }

      try {
        await terminateProcess(subprocess.pid);
      } catch (err) {
        console.error('child process was not terminated:', err);
      }

      if (terminate == "before") {
        await assertFn()
      }
      return resolve()
    }, delay)
  })
}

export async function delay(time = 2000) {
  return await new Promise((res, _) => {
    setTimeout(() => {
      res()
    }, time)
  })
}

export const containsIP = /\b(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b/

/** @type {import("../../core/client/types.d.ts").Eodash<"runtime">} */
export const mockedEodash = {
  brand: {
    name: "mocked",
  },
  stacEndpoint: "https://esa-eodash.github.io/RACE-catalog/RACE/catalog.json",
  template: {
    widgets: []
  }
}
