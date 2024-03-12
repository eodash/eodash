#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchForWorkspaceRoot } from 'vite';

// global paths
export const appPath = fileURLToPath(new URL("..", import.meta.url)),
  appPublicPath = path.join(appPath, './public'),
  rootPath = searchForWorkspaceRoot(process.cwd()),
  rootPublicPath = path.join(rootPath, './public'),
  srcPath = path.join(rootPath, "/src"),
  runtimeConfigPath = path.join(srcPath, "./config.runtime.js"),
  compiletimeConfigPath = path.join(srcPath, "/config.js"),
  dotEodashPath = path.join(rootPath, "/.eodash"),
  buildTargetPath = path.join(dotEodashPath, '/dist'),
  cachePath = path.join(dotEodashPath, 'cache');



export const getUserModules = async () => {
  /** @type {Record<string,string>} */
  let userModules = {}
  const indexJs = await readFile(compiletimeConfigPath, 'utf-8').catch(() => {
    if (!existsSync(runtimeConfigPath)) {
      console.error(new Error("no eodash configuration found"))
    }
  })
  userModules['user:config'] = typeof indexJs === 'string' ? indexJs : ''
  return userModules
}
