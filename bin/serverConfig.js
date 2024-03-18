#!/usr/bin/env node



import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import virtual, { updateVirtualModule } from 'vite-plugin-virtual'
import { fileURLToPath, URL } from 'url';
import {
  runtimeConfigPath,
  appPath, compiletimeConfigPath,
  cachePath, publicPath,
  buildTargetPath
} from "./utils.js";
import { readFile } from "fs/promises";
import { defineConfig, searchForWorkspaceRoot } from "vite"
import { getUserModules } from './utils.js';
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

/**
 * @type {import('vite').Plugin | null}
 */
let virtualPlugin = null;
export const serverConfig = /** @type {import('vite').UserConfigFnPromise}*/(defineConfig(async ({ mode, command }) => {
  return {
    base: '',
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
      }),
      virtualPlugin = virtual(await getUserModules())
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
    },
    root: fileURLToPath(new URL('..', import.meta.url)),
    optimizeDeps: mode === "development" ? {
      include: ["webfontloader", "vuetify", "vue", "pinia"],
      noDiscovery: true,
    } : {},
    publicDir: publicPath,
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
  server.watcher.add([compiletimeConfigPath, runtimeConfigPath])

  server.watcher.on('change', async (path) => {
    if (path == runtimeConfigPath) {
      server.hot.send('reload')
    } else if (path === compiletimeConfigPath) {
      updateVirtualModule(virtualPlugin, 'user:config',
        await getUserModules().then(modules => modules['user:config']))
    }
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
