#!/usr/bin/env node

import { build, createServer, preview } from "vite"
import {
  rootPath, appPath, buildTargetPath,
  userConfig, runtimeConfigPath,
} from "./utils.js";
import { writeFile, rm, cp } from "fs/promises";
import { indexHtml, serverConfig } from "./serverConfig.js";
import path from "path";
import { existsSync } from "fs";


export const createDevServer = async () => {
  const server = await createServer(await serverConfig({ mode: 'development', command: 'serve' }))
  await server.listen()
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}

export const buildApp = async () => {
  /** @param {"production"|"lib"} mode  */
  const viteBuild = async (mode) => {
    const config = await serverConfig({ mode, command: 'build' });
    await build(config)

    if (existsSync(runtimeConfigPath)) {
      await cp(runtimeConfigPath, path.join(buildTargetPath, 'config.js'),
        { recursive: true }).catch((e) => {
          console.error(e)
        })
    }
  }
  if (userConfig.lib) {
    await viteBuild("lib")
  } else {
    const htmlPath = path.join(appPath, '/index.html')
    await writeFile(htmlPath, indexHtml).then(async () => {
      await viteBuild("production")
      await rm(htmlPath).catch(() => {
        console.error('failed to remove index.html')
      })
    })
  }
}


export async function previewApp() {
  const previewServer = await preview({
    root: rootPath,
    base: userConfig.base ?? '',
    preview: {
      port: userConfig.port ?? 8080,
      open: userConfig.open,
      host: userConfig.host
    },
    build: {
      outDir: buildTargetPath,
    }
  })
  previewServer.printUrls()
}
