
import { spawn, spawnSync } from 'child_process'
import { describe, it, expect } from 'vitest'
import { assertAndKillChildProcess, containsIP } from './utils'

describe("test preview command", { timeout: 10000 }, () => {
  /** @type { import('child_process').SpawnSyncReturns<Buffer>} */
  let build = null
  let preview = null
  let output = ''

  it("check preview log output", async () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "./core/eodash.js"])
    preview = spawn('npx', ['eodash', "preview"])
    preview.stdout.on("data", (data) => {
      output += data
    })

    await assertAndKillChildProcess(preview, () => { expect(output).to.contain('➜  Local:   http://localhost:') })
  })

  it("check --port flag", async () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "./core/eodash.js"])
    preview = spawn('npx', ['eodash', "preview", "--port", "3333"])
    preview.stdout.on("data", (data) => {
      output += data
    })

    await assertAndKillChildProcess(preview, () => { expect(output).to.contain('➜  Local:   http://localhost:3333') })
  })

  it("check --host flag", async () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "./core/eodash.js"])
    preview = spawn('npx', ['eodash', "preview", "--host"])
    preview.stdout.on("data", (data) => {
      output += data
    })

    await assertAndKillChildProcess(preview, () => { expect(output).toMatch(containsIP) })
  })
})
