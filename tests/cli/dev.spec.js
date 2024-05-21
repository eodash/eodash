import { describe, it, expect } from 'vitest'

import { assertAndKillChildProcess, containsIP, mockedEodash } from "./utils"
import { spawn } from 'child_process'
import { mkdir, rm, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'

describe("test dev command", () => {
  /** @type { import('child_process').ChildProcessWithoutNullStreams} */
  let dev = null
  let output = ''

  it("check dev log output", async () => {
    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/client/eodash.js"])
    output = ''
    dev.stdout.on("data", (data) => {
      output += data
    })
    await assertAndKillChildProcess(dev, async () => { expect(output).to.contain('➜  Local:   http://localhost:') })
  })

  it("check --port flag", async () => {
    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/client/eodash.js", "--port", "3000"])
    output = ''
    dev.stdout.on("data", (data) => {
      output += data
    })

    await assertAndKillChildProcess(dev, async () => { expect(output).to.contain('➜  Local:   http://localhost:3000') })
  })

  it("check --host flag", async () => {
    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/client/eodash.js", "--host"])
    output = ''
    dev.stdout.on("data", (data) => {
      output += data
    })
    await assertAndKillChildProcess(dev, async () => { expect(output).toMatch(containsIP) })
  })

  it("check --publicDir flag", async () => {
    const testPublic = fileURLToPath(new URL("../../testPublic", import.meta.url));
    await mkdir(testPublic, { recursive: true }).catch(e => {
      console.error(e);
    });
    await writeFile(path.join(testPublic, "test.txt"), "test file").catch(e => {
      console.error(e);
    });

    dev = spawn('npx', ['eodash', "dev", "--entryPoint", "./core/client/eodash.js", "--publicDir", "./testPublic"])

    await assertAndKillChildProcess(dev, async () => {
      const text = await axios.get("http://localhost:5173/test.txt").then(resp => resp.data).catch((e) => {
        console.error(e)
      })
      expect(text).toEqual("test file")
    }, { terminate: "after" })
    await rm(testPublic, { recursive: true })
  })

  it("test --runtime flag", async () => {
    const runtimeFile = fileURLToPath(new URL("../../testRuntime.js", import.meta.url));
    await writeFile(runtimeFile, `export default ${JSON.stringify(mockedEodash)}`)

    dev = spawn('npx', ['eodash', "dev", "--runtime", "./testRuntime.js", "--entryPoint", "core/client/eodash.js"])

    await assertAndKillChildProcess(dev, async () => {
      const runtimeStr = await axios.get("http://localhost:5173/@fs/config.js")
        .then(resp => resp.data).catch((e) => {
          console.error(e)
        })
      expect(runtimeStr).toContain(JSON.stringify(mockedEodash))
    }, { terminate: "after" })

    await rm(runtimeFile, { recursive: true })
  })
})
