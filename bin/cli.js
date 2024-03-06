#!/usr/bin/env node

import { build, createServer, preview } from "vite"
import { execPath, appPath, buildTargetPath } from "./utils.js";
import { writeFile, rm, cp } from "fs/promises";
import { update } from "./update.js";
import { indexHtml, serverConfig } from "./serverConfig.js";
import path from "path";



export const createDevServer = async () => {
  const server = await createServer(serverConfig({ mode: 'development', command: 'serve' }))
  await server.listen()
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}

export const buildApp = async () => {
  const htmlPath = path.join(appPath, '/index.html')
  await writeFile(htmlPath, indexHtml).then(async () => {
    await update()
    await build(serverConfig({ mode: 'production', command: 'build' }))
    await rm(htmlPath).catch(() => {
      console.error('failed to remove index.html')
    })
  })

  if (appPath.includes('node_modules')) {
    await cp(appPath + 'dist', buildTargetPath, { recursive: true }).then(() => {
      console.info('dashboard built successfully')
    }).catch((e) => {
      console.error(e)
    })
  }
}


export async function previewApp() {
  const previewServer = await preview({
    root: execPath,
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
