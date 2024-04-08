import terminate from "terminate/promise"

/**
 * @param {import('child_process').ChildProcessWithoutNullStreams} subprocess
 * @param {Function} assertFn
 * @param {number} delay
 * @returns
 */
export async function assertAndKillChildProcess(subprocess, assertFn, delay = 2000) {
  // check vi.waitFor & vi.waitUntil
  return await new Promise((resolve, _) => {
    setTimeout(async () => {
      try {
        await terminate(subprocess.pid);
      } catch (err) {
        console.error('child process was not terminated:', err);
      }
      assertFn()
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
