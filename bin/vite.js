#!/usr/bin/env node
import { createServer, preview, build } from 'vite'
import update from './update.js';
import { copyFolders } from './utils.js';

export const dev = async () => {
  await update()

  const server = await createServer({
    root: __appPath,
    server: {
      port: 3000,
    }
  });

  server.watcher.unwatch(__appPath + '**/**.**')
  server.watcher.add(__configPath)

  server.watcher.on('change', async (path) => {
    if (path === __execPath + '/config.js') {
      await update()
    }
  })
  await server.listen();
  server.printUrls();
}

export const buildApp = async () => {
  await update()
  await build({
    root: __appPath,
  })
  await copyFolders(__appPath + 'dist', __execPath + '/app')
}

export const previewApp = async () => {
  const previewServer = await preview({
    root: __execPath,
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
