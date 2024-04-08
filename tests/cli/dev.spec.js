import { describe, it, expect } from 'vitest'

import { assertAndKillChildProcess, containsIP } from "./utils"
import { spawn } from 'child_process'

describe("test dev command", { timeout: 10000 }, () => {
  /** @type { import('child_process').ChildProcessWithoutNullStreams} */
  let dev = null
  let output = ''

  it("check dev log output", async () => {
    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/eodash.js"])
    output = ''
    dev.stdout.on("data", (data) => {
      output += data
    })
    await assertAndKillChildProcess(dev, async () => { expect(output).to.contain('➜  Local:   http://localhost:') })
  })

  it("check --port flag", async () => {
    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/eodash.js", "--port", "3000"])
    output = ''
    dev.stdout.on("data", (data) => {
      output += data
    })
    await assertAndKillChildProcess(dev, async () => { expect(output).to.contain('➜  Local:   http://localhost:3000') })
  })

  it("check --host flag", async () => {
    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/eodash.js", "--host"])
    output = ''
    dev.stdout.on("data", (data) => {
      output += data
    })
    await assertAndKillChildProcess(dev, async () => { expect(output).toMatch(containsIP) })
  })

})
