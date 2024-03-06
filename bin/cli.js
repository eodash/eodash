#!/usr/bin/env node

import { build, createServer, preview } from "vite"
import { execPath, appPath } from "./utils.js";
import { writeFile, rm, cp } from "fs/promises";
import { update } from "./update.js";
import { indexHtml, serverConfig } from "./serverConfig.js";



export const createDevServer = async () => {
  await update()
  const server = await createServer(serverConfig({ mode: 'development', command: 'serve' }))
  await server.listen()
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}

export const buildApp = async () => {
  await update()
  const htmlPath = appPath + 'index.html'
  await writeFile(htmlPath, indexHtml).then(async () => {
    await build(serverConfig({ mode: 'production', command: 'build' }))
    await rm(htmlPath).catch(() => {
      console.error('failed to remove index.html')
    })
  }).catch(() => {
    console.error('failed to create production entry point')
  })
  if (appPath.includes('node_modules')) {
    await cp(appPath + 'dist', execPath + '/app', { recursive: true }).then(() => {
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
      outDir: 'app'
    }
  })
  previewServer.printUrls()
}
