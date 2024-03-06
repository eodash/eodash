#!/usr/bin/env node

import { defineConfig, searchForWorkspaceRoot } from "vite"
// Plugins
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// Utilities
import { fileURLToPath, URL } from 'url';
import { configPath, appPath, dotEodashPath, execPath } from "./utils.js";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
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
  <script type="module" src="${path.resolve(`/@fs/${appPath}/core/main.js`)}"></script>
</body>
</html>`

export const serverConfig = defineConfig(({ mode, command }) => {
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
        name: "inject-files",
        configureServer: mode === "development" ? configureServer : undefined
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
    root: fileURLToPath(new URL('..', import.meta.url)),
    optimizeDeps: mode === "development" ? {
      include: ["webfontloader", "vuetify", "vue", "pinia"],
      noDiscovery: true,
    } : {},
    publicDir: command === 'build' ? path.join(appPath, './public') : path.join(execPath, '/public'),
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: fileURLToPath(new URL(command === 'build' ? '../index.html' : '../core/main.js', import.meta.url)),
      },
      target: "esnext"
    }
  }
});



/**
 * @type {import("vite").ServerHook}
 */
async function configureServer(server) {
  if (existsSync(configPath)) {
    server.watcher.add(configPath)
  }

  server.watcher.on('change', async (path) => {
    if (path == configPath) {
      server.hot.send('config:update')
    }
  })
  return () => {
    server.middlewares.use(async (req, res, next) => {
      if (req.originalUrl === '/@fs/config.js' && existsSync(configPath)) {
        await readFile(configPath).then(config => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/javascript')
          res.write(config)
          res.end()
        }).catch()
        return
      }

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
