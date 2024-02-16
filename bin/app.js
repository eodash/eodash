#!/usr/bin/env node

import { fileURLToPath } from 'url';
import install from './install.js'
import { dev, buildApp, previewApp } from './vite.js';

// global paths
global.__appPath = fileURLToPath(new URL("../", import.meta.url));
global.__execPath = fileURLToPath(new URL(process.cwd(), import.meta.url));
global.__configPath = __execPath + "/config.js"
global.__nodeModsMapPath = __execPath + "/modulesMap.js";

(async () => {
  if (process.argv.includes('install')) {
    await install()
  } else if (process.argv.includes('dev')) {
    // start dev server with HMR
    await dev();
  } else if (process.argv.includes('build')) {
    // builds app and copies it to config project
    await buildApp();
  } else if (process.argv.includes('preview')) {
    // preview built app
    await previewApp();
  }
})()
