#!/usr/bin/env node

import { build, createServer, defineConfig, preview, searchForWorkspaceRoot } from "vite"
// Plugins
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// Utilities
import { fileURLToPath, URL } from 'url';
import { execPath, configPath, appPath, dotEodashPath } from "./utils.js";
import { readFile, writeFile, rm, cp } from "fs/promises";
import { update } from "./update.js";


const indexHtml = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Eodash v5</title>
</head>

<body>
  <div id="app"></div>
  <script type="module" src="/@fs/${appPath}/core/main.js"></script>
</body>
</html>`

const serverConfig = defineConfig(({ mode, command }) => {
  return {
    base: '',
    cacheDir: dotEodashPath + '/cache',
    plugins: [
      vue({
        template: {
          transformAssetUrls,
          compilerOptions: {
            isCustomElement: (tag) => !tag.includes('v-') && tag.includes('-')
          }
        },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
      vuetify({
        autoImport: true,
      }),
      {
        name: "inject-html",
        configureServer: mode === "development" ? configureServer : undefined,
        transformIndexHtml: command === "build" ? () => {
          return indexHtml
        } : undefined
      }
    ],
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../core', import.meta.url)),
        '^': fileURLToPath(new URL('../widgets', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      port: 3000,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())]
      },
      open: '/'
    },
    publicDir: appPath + '/public',
    root: fileURLToPath(new URL('..', import.meta.url)),
    optimizeDeps: mode === "development" ? {
      include: ["webfontloader", "vuetify", "vue", "pinia"],
      noDiscovery: true,
    } : {},
    build: {
      rollupOptions: {
        input: fileURLToPath(new URL(command === 'build' ? '../index.html' : '../core/main.js', import.meta.url)),
      },
      target: "esnext"
    }
  }
});



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


/**
 * @type {import("vite").ServerHook}
 */
async function configureServer(server) {
  await readFile(configPath).then(() => {
    server.watcher.add(configPath)
  }).catch(() => {
    console.error('no config file was found')
  })

  server.watcher.on('change', async (path) => {
    if (path == configPath) {
      update()
      server.hot.send('config:update')
    }
  })
  return () => {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url
      if (url?.endsWith('.html')) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        const html = await server.transformIndexHtml(url, indexHtml, req.originalUrl)
        res.end(html)
        return
      }
      next()
    })
  }
}
