import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { describe, it, expect } from 'vitest'

describe("test build command", () => {
  /** @type { import('child_process').SpawnSyncReturns<Buffer>} */
  let build = null

  it("check build log output", () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "./core/eodash.js"])
    expect(build.output.toString()).to.contain('✓ built in ')
  })

  it("check output html file", async () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "./core/eodash.js"])
    expect(existsSync('.eodash/dist/index.html')).to.be.true
  })

  it("test --outDir flag", () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "./core/eodash.js", "--outDir", "./.eodash/testDest"])
    expect(existsSync('.eodash/testDest/index.html')).to.be.true
  })
})
