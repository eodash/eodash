#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { preview } from 'vite'
import express from "express";
import chokidar from "chokidar"
import fs from "fs/promises";

// global paths
global.__appPath = fileURLToPath(new URL("../", import.meta.url));
global.__execPath = fileURLToPath(new URL(process.cwd(), import.meta.url));
global.__configPath = __execPath + "/config.js";

(async () => {
  if (process.argv.includes('dev')) {
    await dev();
  } else if (process.argv.includes('build')) {
    await buildApp();
  } else if (process.argv.includes('preview')) {
    await previewApp();
  }
})();

async function update() {
  // 1. copy public
  const publicPath = __execPath + "/public"
  const distPath = __appPath + "dist"
  await copyFolders(publicPath, distPath)
  // 2. copy config
  const appConfigPath = __appPath + "dist/config.js";
  await copyFile(__configPath, appConfigPath)
}


async function dev() {
  await update();
  var app = startDevServer()
  // watch config and public folders
  const watcher = chokidar.watch(__execPath + '/**/**.js', {
    ignored: ["**/node_modules/**", __execPath + "/app/**"],
    persistent: true
  });
  watcher.on('change', async (path) => {
    if (path === __configPath) {
      await update()
      app.close(() => {
        app = startDevServer()
      })
    }
    console.info(`File ${path} has changed`)
  })
}

function startDevServer() {
  const server = express();
  server.use(express.static(__appPath + "dist"));
  const app = server.listen(3000, () => {
    console.info(`Server is running on http://localhost:3000`);
  });
  server.all("*", (_, res) => {
    res.redirect("/")
  })
  return app
}
async function buildApp() {
  await update()
  await copyFolders(__appPath + 'dist', __execPath + '/app')
}

async function previewApp() {
  const previewServer = await preview({
    root: __execPath,
    server: {
      watch: __configPath,
    },
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


// utils
async function copyFolders(from, to) {
  await fs.cp(from, to, { recursive: true }, (err) => {
    if (err) throw err;
    console.info(`copied files from ${from} to ${to}`);
  });
}

async function copyFile(from, to) {
  await fs.copyFile(from, to).then(() => {
    console.info(`${from} was copied to ${to}`);
  }).catch(err => {
    console.error(err)
  });
}
