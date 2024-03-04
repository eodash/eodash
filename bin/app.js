#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { preview } from 'vite'
import express from "express";
import * as chokidar from "chokidar"
import { copyFile, cp, readFile, writeFile } from "fs/promises";
import { WebSocketServer } from 'ws';


// global paths
const __appPath = fileURLToPath(new URL("../", import.meta.url));
const __execPath = fileURLToPath(new URL(process.cwd(), import.meta.url));
const __configPath = __execPath + "/config.js";


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
  await cp(publicPath, distPath, { recursive: true }).catch(err => {
    console.error(err)
  })
  // 2. copy config
  const appConfigPath = __appPath + "dist/config.js";
  await copyFile(__configPath, appConfigPath).catch(err => {
    console.error(err)
  });
}

const wsClientScript = `<script type="module">
const client = new WebSocket("ws://localhost:3333/");
client.onerror = function (e) {
  console.error('WebSocket Client Error', e);
};
client.onopen = function () {
  console.info('client connected');
};
client.onclose = function () {
  console.info('client closed');
};
client.onmessage = function (evt) {
  if (evt.data === 'reload') {
    window.location.reload()
  }
};
</script>`

async function dev() {
  // copy files to app
  await update();
  // inject ws client for dev
  await injectInHTML(wsClientScript)
  // create static server
  const server = express();
  server.use(express.static(__appPath + "dist"));

  server.listen(3000, () => {
    console.info(`server is running on http://localhost:3000`);
  })

  server.all("*", (req, res) => {
    // handle query
    const params = new URLSearchParams(req.query).toString()
    // redirect to the app
    res.redirect(`${params.length ? '/?' + params : '/'}`)
  })

  // create files watcher
  const watcher = chokidar.watch(__execPath + '/**/**.js', {
    ignored: ["**/node_modules/**", __execPath + "/app/**", __appPath + '**/**.**'],
    depth: 2
  });

  // create ws server for reloading
  const wsServer = new WebSocketServer({ port: 3333 });

  let websocket = null
  wsServer.on('connection', (ws) => {
    websocket = ws
  });

  // reload on change
  watcher.on('change', async (path) => {
    if (path === __configPath) {
      await update()
      websocket.send('reload')
      console.info(`updated config.js ✨`)
    }
  })
}



async function buildApp() {
  await update()
  // remove injected script before copying to exec path
  await injectInHTML(wsClientScript, true)
  await cp(__appPath + 'dist', __execPath + '/app', { recursive: true }).catch(err => {
    console.error(err)
  })
  console.info(`built successfully`)
}

async function previewApp() {
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


async function injectInHTML(injected, remove) {
  const htmlPath = __appPath + 'dist/index.html'
  const updatedHtml = await readFile(htmlPath, 'utf8').then(data => {
    let html = ''
    if (remove) {
      html = data.replace(injected, '')
    } else {
      if (!data.includes(injected)) {
        const splitHtml = data.split("\n")
        splitHtml.splice(splitHtml.indexOf("</body>"), 0, injected);
        html = splitHtml.join("\n")
      }
    }
    return html
  }).catch(err => {
    throw err
  })

  if (updatedHtml.length) {
    await writeFile(htmlPath, updatedHtml).catch(err => {
      throw err;
    });
  }
}
