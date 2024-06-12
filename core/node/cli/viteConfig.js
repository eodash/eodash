#!/usr/bin/env node

import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import {
  runtimeConfigPath,
  appPath, entryPath,
  cachePath, publicPath, userConfig,
  buildTargetPath,
  logger,
  rootPath,
  internalWidgetsPath
} from "./globals.js";
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
${userConfig.lib ? `<eo-dash style="height:100dvh;"/>
<script type="module" src="${path.resolve(`/@fs/${appPath}`, `core/client/asWebComponent.js`)}"></script>
`: ` <div id="app"/>
<script type="module" src="${path.resolve(`/@fs/${appPath}`, `core/client/render.js`)}"></script>
`}
</body>
</html>`

//@ts-expect-error
export const viteConfig = /** @type {import('vite').UserConfigFnPromise}*/(defineConfig(async ({ mode, command }) => {
  return {
    base: userConfig.base ?? '',
    cacheDir: cachePath,
    plugins: [
      vue({
        // to do: inject styles to web component directly
        customElement: false,
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
    ],
    customLogger: logger,
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': path.join(appPath, 'core/client'),
        '^': path.join(appPath, 'widgets'),
        "user:config": entryPath,
        "user:widgets": internalWidgetsPath
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      warmup: {
        clientFiles: [path.join(appPath, "core/client/**")]
      },
      port: userConfig.port ?? 3000,
      open: userConfig.open,
      fs: {
        allow: [searchForWorkspaceRoot(process.cwd())]
      },
      host: userConfig.host
    },
    root: appPath,
    optimizeDeps: mode === "development" ? {
      include: ["webfontloader", "vuetify", "vue", "pinia", "stac-js", "urijs"],
      noDiscovery: true,
    } : {},
    /** @type {string|false} */
    publicDir: userConfig.publicDir === false ? false : publicPath,
    build: {
      lib: (userConfig.lib && command === 'build') && {
        entry: path.join(appPath, "core/client/asWebComponent.js"),
        fileName: "eo-dash",
        formats: ["es"],
        name: "@eodash/eodash"
      },
      outDir: buildTargetPath,
      emptyOutDir: true,
      rollupOptions: (userConfig.lib && command === 'build') ? {
        input: path.join(appPath, "core/client/asWebComponent.js")
      } : undefined,
      target: "esnext"
    }
  }
}));



/**
 * @type {import("vite").ServerHook}
 */
async function configureServer(server) {
  server.watcher.add([entryPath, runtimeConfigPath, path.join(internalWidgetsPath, "**/*.vue")])

  let updatedPath = ''
  const loggerInfo = logger.info
  logger.info = (msg, options) => {
    if (msg.includes('core')) {
      const removedPath = msg.split('/')[0].split(" ")
      removedPath.pop()
      const updatedMsg = removedPath.join(" ") + " " + updatedPath.replace(rootPath, "")

      return loggerInfo(updatedMsg, options)
    }
    return loggerInfo(msg, options)
  }

  server.watcher.on('change', async (path) => {
    updatedPath = path
    if (path === runtimeConfigPath) {
      server.hot.send({
        type: 'full-reload',
        path: path
      })
    }
  })

  return () => {
    server.middlewares.use(async (req, res, next) => {
      if (req.originalUrl === '/@fs/config.js' || req.originalUrl === '/config.js') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/javascript')
        if (existsSync(runtimeConfigPath)) {
          await readFile(runtimeConfigPath).then(runtimeConfig => {
            res.write(runtimeConfig)
          })
        }
        res.end()
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
