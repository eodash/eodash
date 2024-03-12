#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchForWorkspaceRoot } from 'vite';

const getFlag = (flag, defaultVal) => {
  const flagIdx = process.argv.indexOf(flag)
  let val = flagIdx !== -1 ? process.argv[flagIdx + 1] : (defaultVal ?? null)
  if (/^(true|false|\d+)$/.test(val)) {
    val = JSON.parse(val)
  }
  return val
}

export const userConfig = {
  /** statically served files path
   * @type {string | false}
   */
  publicDir: getFlag('--publicDir'),
  /** output folder
   * @type {string}
    */
  outDir: getFlag('--outDir'),
  /** file exporting `defineConfig`
   * @type {string}
   */
  entryPoint: getFlag('--entryPoint'),
  /** base public path
   * @type {string}
    */
  base: getFlag('--base'),
  /** cache folder
   * @type {string}
   */
  cacheDir: getFlag('--cacheDir'),
  /** runtime eodash configuration file
   * @type {string}
   */
  runtimeFile: getFlag('--runtime'),
  /**
   * Open default browser when the server starts
   * @type {boolean}
   */
  open: process.argv.includes('--open'),
  /** serving  port
   * @type {number}
   */
  port: getFlag('--port')
}

// global paths
export const appPath = fileURLToPath(new URL("..", import.meta.url)),
  appPublicPath = path.join(appPath, './public'),
  rootPath = searchForWorkspaceRoot(process.cwd()),
  rootPublicPath = userConfig.publicDir ? path.resolve(rootPath, userConfig.publicDir) : path.join(rootPath, './public'),
  srcPath = path.join(rootPath, "/src"),
  runtimeConfigPath = userConfig.runtimeFile ? path.resolve(rootPath, userConfig.runtimeFile) : path.join(srcPath, "./config.runtime.js"),
  compiletimeConfigPath = userConfig.entryPoint ? path.resolve(rootPath, userConfig.entryPoint) : path.join(srcPath, "/config.js"),
  dotEodashPath = path.join(rootPath, "/.eodash"),
  buildTargetPath = userConfig.outDir ? path.resolve(rootPath, userConfig.outDir) : path.join(dotEodashPath, '/dist'),
  cachePath = userConfig.cacheDir ? path.resolve(rootPath, userConfig.cacheDir) : path.join(dotEodashPath, 'cache');


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
