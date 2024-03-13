#!/usr/bin/env node

import { build, createServer, preview } from "vite"
import {
  rootPath, appPath, buildTargetPath,
  appPublicPath, rootPublicPath, runtimeConfigPath
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

export const buildApp = async (baseFlag) => {
  const htmlPath = path.join(appPath, '/index.html')
  await writeFile(htmlPath, indexHtml).then(async () => {
    if (rootPublicPath !== appPublicPath) {
      await cp(rootPublicPath, appPublicPath, { recursive: true }).catch(err => {
        console.error(err)
      })
      if (existsSync(runtimeConfigPath)) {
        await cp(runtimeConfigPath, path.join(appPath, '/public/config.js')).catch((e) => {
          console.error(e)
        })
      }
    }

    const config = await serverConfig({ mode: 'production', command: 'build' });
    if (baseFlag !== null) {
      config.base = baseFlag
    }
    await build(config)

    await rm(htmlPath).catch(() => {
      console.error('failed to remove index.html')
    })
    if (appPath.includes('node_modules') && existsSync(appPublicPath)) {
      await rm(appPublicPath, { recursive: true }).catch((e) => {
        console.error(e)
      })
    }
  })
}


export async function previewApp() {
  const previewServer = await preview({
    root: rootPath,
    preview: {
      port: 8080,
      open: true,
    },
    build: {
      outDir: buildTargetPath
    }
  })
  previewServer.printUrls()
}
