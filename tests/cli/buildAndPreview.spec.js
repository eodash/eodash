import { spawn, spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { describe, it, expect, afterEach, beforeAll, } from 'vitest'
import { assertAndKillChildProcess, containsIP, mockedEodash } from './utils'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import axios from 'axios'


describe("test build and preview commands", () => {

  /** @type { import('child_process').SpawnSyncReturns<Buffer>} */
  let build = null
  /** @type { import('child_process').ChildProcess} */
  let preview = null
  let output = ''

  afterEach(() => {
    output = ''
  })

  describe("test build command", () => {

    it("test build log output", () => {
      build = spawnSync('npx', ['eodash', "build", "--entryPoint", "core/eodash.js"])
      expect(build.output.toString()).to.contain('✓ built in ')
    })

    it("check if the output html file exists", () => {
      build = spawnSync('npx', ['eodash', "build", "--entryPoint", "core/eodash.js"])
      expect(existsSync('.eodash/dist/index.html')).toBeTruthy()
    })

    it("test --base flag", async () => {
      const base = "/base"
      build = spawnSync('npx', ['eodash', "build", "--entryPoint", "core/eodash.js", "--base", base])
      const indexHtml = await readFile(".eodash/dist/index.html", "utf-8")
      expect(indexHtml).toContain(`src="${base}`)
    })

  })


  describe("test preview command", () => {

    beforeAll(() => {
      build = spawnSync('npx', ['eodash', "build", "--entryPoint", "core/eodash.js"])
    })

    it("test preview log output", async () => {
      preview = spawn('npx', ['eodash', "preview"])
      preview.stdout.on("data", (data) => {
        output += data
      })
      await assertAndKillChildProcess(preview, () => { expect(output).to.contain('➜  Local:   http://localhost:') })
    })

    it("test --port flag", async () => {
      preview = spawn('npx', ['eodash', "preview", "--port", "3333"])
      preview.stdout.on("data", (data) => {
        output += data
      })
      await assertAndKillChildProcess(preview, () => { expect(output).to.contain('➜  Local:   http://localhost:3333') })
    })


    it("test --host flag", async () => {
      preview = spawn('npx', ['eodash', "preview", "--host"])
      preview.stdout.on("data", (data) => {
        output += data
      })
      await assertAndKillChildProcess(preview, () => { expect(output).toMatch(containsIP) })
    })

  })

  it("test --outDir flag", async () => {
    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "core/eodash.js", "--outDir", "./.eodash/testDest"])
    expect(existsSync('.eodash/testDest/index.html')).to.be.true

    preview = spawn('npx', ['eodash', "preview", "--outDir", "./.eodash/testDest"])
    preview.stdout.on("data", (data) => {
      output += data
    })

    await assertAndKillChildProcess(preview, () => { expect(output).to.contain('➜  Local:   http://localhost:') })
  })

  it("test --publicDir flag", async () => {
    const testPublic = fileURLToPath(new URL("../../testPublic", import.meta.url));
    await mkdir(testPublic, { recursive: true });
    await writeFile(path.join(testPublic, "test.txt"), "test file")

    build = spawnSync('npx', ['eodash', "build", "--entryPoint", "core/eodash.js", "--publicDir", "testPublic"])
    preview = spawn('npx', ['eodash', "preview"])

    await assertAndKillChildProcess(preview, async () => {
      const text = await axios.get("http://localhost:8080/test.txt").then(resp => resp.data).catch((e) => {
        console.error(e)
      })
      expect(text).toEqual("test file")
    }, { terminate: "after" })
    await rm(testPublic, { recursive: true })
  })

  it("test --runtime flag", async () => {
    const runtimeFile = fileURLToPath(new URL("../../testRuntime.js", import.meta.url));
    await writeFile(runtimeFile, `export default ${JSON.stringify(mockedEodash)}`)

    build = spawnSync('npx', ['eodash', "build", "--runtime", "./testRuntime.js", "--entryPoint", "core/eodash.js"])
    preview = spawn('npx', ['eodash', "preview"])

    await assertAndKillChildProcess(preview, async () => {
      const runtimeStr = await axios.get("http://localhost:8080/config.js")
        .then(resp => resp.data).catch((e) => {
          console.error(e)
        })
      expect(runtimeStr).toContain(JSON.stringify(mockedEodash))
    }, { terminate: "after" })

    await rm(runtimeFile, { recursive: true })
  })
})
