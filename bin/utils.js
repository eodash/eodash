#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchForWorkspaceRoot } from 'vite';
import { Command } from 'commander';
const cli = new Command('eodash')

const pkg = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../package.json', import.meta.url))
    , 'utf-8')
);

cli.version(pkg.version, '-v, --version', 'output the current version')
  .option('--publicDir <path>', 'path to statically served assets folder')
  .option('--no-publicDir', 'stop serving static assets')
  .option('--outDir <path>', 'minified output folder')
  .option('-e, --entryPoint <path>', 'file exporting `defineConfig`')
  .option('-c, --cacheDir <path>', 'cache folder')
  .option('-r, --runtime <path>', 'file exporting eodash runtime config')
  .option('-b, --base <path>', 'base public path')
  .option('-p, --port <port>', 'serving  port')
  .option('-o, --open', 'open default browser when the server starts')
  .parse(process.argv)


export const userConfig = cli.opts()
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
