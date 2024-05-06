#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchForWorkspaceRoot, createLogger } from 'vite';
import { Command } from 'commander';

export const rootPath = searchForWorkspaceRoot(process.cwd());
const cli = new Command('eodash')

const pkg = JSON.parse(
  readFileSync(
    path.join(rootPath, 'package.json')
    , 'utf-8')
);

/**
 * CLI flags object
 * @typedef {Object} Options
 * @property {string | false} publicDir
 * @property {string} outDir
 * @property {string} entryPoint
 * @property {string} widgets
 * @property {string} cacheDir
 * @property {string} runtime
 * @property {string} base
 * @property {string | number} port
 * @property {boolean} open
 * @property {boolean | string} host
 * @property {string} config
 * @property {boolean} lib
 */
cli.version(pkg.version, '-v, --version', 'output the current version')
  .option('--publicDir <path>', 'path to statically served assets folder')
  .option('--no-publicDir', 'stop serving static assets')
  .option('--outDir <path>', 'minified output folder')
  .option('-e, --entryPoint <path>', 'file exporting `createEodash`')
  .option('-w, --widgets <path>', 'folder that contains vue components as internal widgets')
  .option('--cacheDir <path>', 'cache folder')
  .option('-r, --runtime <path>', 'file exporting eodash client runtime config')
  .option('-b, --base <path>', 'base public path')
  .option('-p, --port <port>', 'serving  port')
  .option('-o, --open', 'open default browser when the server starts')
  .option('-c, --config <path>', 'path to eodash server and build configuration file')
  .option('--host [IP address]', 'specify which IP addresses the server should listen on')
  .option('-l, --lib', 'builds eodash as a web component library')
  .option('--no-lib', 'builds eodash as an SPA')
  .option('--no-host', 'do not expose server to the network')
  .parse(process.argv)


export const userConfig = await getUserConfig(cli.opts(), process.argv?.[2])

export const appPath = fileURLToPath(new URL("..", import.meta.url)),
  publicPath = userConfig.publicDir ? path.resolve(rootPath, userConfig.publicDir) : path.join(rootPath, './public'),
  srcPath = path.join(rootPath, "/src"),
  runtimeConfigPath = userConfig.runtime ? path.resolve(rootPath, userConfig.runtime) : path.join(srcPath, "./runtime.js"),
  entryPath = userConfig.entryPoint ? path.resolve(rootPath, userConfig.entryPoint) : path.join(srcPath, "/main.js"),
  internalWidgetsPath = userConfig.widgets ? path.resolve(rootPath, userConfig.widgets) : path.join(srcPath, "widgets"),
  dotEodashPath = path.join(rootPath, "/.eodash"),
  buildTargetPath = userConfig.outDir ? path.resolve(rootPath, userConfig.outDir) : path.join(dotEodashPath, '/dist'),
  cachePath = userConfig.cacheDir ? path.resolve(rootPath, userConfig.cacheDir) : path.join(dotEodashPath, 'cache');


export const logger = createLogger()

/**
 * @param {Options} options
 * @param {string | undefined} command
 */
async function getUserConfig(options, command) {
  let eodashCLiConfigFile = options.config ? path.resolve(rootPath, options.config) : path.join(rootPath, 'eodash.config.js');
  /** @type {import("./types").EodashConfig} */
  let config = {};
  if (existsSync(eodashCLiConfigFile)) {
    config = await import(eodashCLiConfigFile).then(config => {
      if (config.default instanceof Function) {
        return config.default()
      } else {
        return config.default
      }
    }).catch(err => {
      console.error(err);
    })
  } else {
    eodashCLiConfigFile = null
  }

  return {
    base: options.base ?? config?.base,
    port: Number(options.port ?? config?.[command]?.port),
    host: options.host ?? config?.[/**@type {"dev"|"preview"} */(command)]?.host,
    open: options.open ?? config?.[/**@type {"dev"|"preview"} */(command)]?.open,
    cacheDir: options.cacheDir ?? config?.cacheDir,
    entryPoint: options.entryPoint ?? config?.entryPoint,
    outDir: options.outDir ?? config?.outDir,
    publicDir: options.publicDir ?? config?.publicDir,
    runtime: options.runtime ?? config?.runtime,
    widgets: options.widgets ?? config?.widgets,
    lib: options.lib ?? config?.lib
  }
}
