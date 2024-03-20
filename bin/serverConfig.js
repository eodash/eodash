#!/usr/bin/env node

import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { fileURLToPath, URL } from 'url';
import {
  runtimeConfigPath,
  appPath, entryPath,
  cachePath, publicPath, userConfig,
  buildTargetPath
} from "./utils.js";
import { readFile } from "fs/promises";
import { defineConfig, searchForWorkspaceRoot } from "vite"
import { existsSync } from 'fs';
import path from "path";

export const indexHtml = `
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
  <script type="module" src="${path.resolve(`/@fs/${appPath}/core/render.js`)}"></script>
</body>
</html>`

export const serverConfig = /** @type {import('vite').UserConfigFnPromise}*/(defineConfig(async ({ mode, command }) => {
  return {
    base: userConfig.base ?? '',
    cacheDir: cachePath,
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
      (mode === "development" && {
        name: "inject-html",
        configureServer
      })
    ],
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../core', import.meta.url)),
        '^': fileURLToPath(new URL('../widgets', import.meta.url)),
        "user:config": entryPath
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      warmup: {
        clientFiles: [path.join(appPath, "core/**")]
      },
      port: userConfig.port ?? 3000,
      open: userConfig.open,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())]
      },
      host: userConfig.host
    },
    root: fileURLToPath(new URL('..', import.meta.url)),
    optimizeDeps: mode === "development" ? {
      include: ["webfontloader", "vuetify", "vue", "pinia"],
      noDiscovery: true,
    } : {},
    /** @type {string|false} */
    publicDir: userConfig.publicDir === false ? false : publicPath,
    build: {
      outDir: buildTargetPath,
      emptyOutDir: true,
      rollupOptions: {
        input: fileURLToPath(new URL(command === 'build' ? '../index.html' : '../core/main.js', import.meta.url)),
      },
      target: "esnext"
    }
  }
}));



/**
 * @type {import("vite").ServerHook}
 */
async function configureServer(server) {
  server.watcher.add([entryPath, runtimeConfigPath])

  server.watcher.on('change', async (path) => {
    server.hot.send({
      type: 'full-reload',
      path: path
    })
  })

  return () => {
    server.middlewares.use(async (req, res, next) => {
      if (req.originalUrl === '/@fs/config.js' && existsSync(runtimeConfigPath)) {
        await readFile(runtimeConfigPath).then(runtimeConfig => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/javascript')
          res.write(runtimeConfig)
          res.end()
        })
        return
      }

      if (req.url?.endsWith('.html')) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        const html = await server.transformIndexHtml(req.url, indexHtml, req.originalUrl)
        res.end(html)
        return
      }
      next()
    })
  }
}
