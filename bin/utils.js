#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchForWorkspaceRoot } from 'vite';
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
 * @property {string} cacheDir
 * @property {string} runtime
 * @property {string} base
 * @property {string | number} port
 * @property {boolean} open
 * @property {boolean | string} host
 * @property {string} config
 */
cli.version(pkg.version, '-v, --version', 'output the current version')
  .option('--publicDir <path>', 'path to statically served assets folder')
  .option('--no-publicDir', 'stop serving static assets')
  .option('--outDir <path>', 'minified output folder')
  .option('-e, --entryPoint <path>', 'file exporting `defineConfig`')
  .option('--cacheDir <path>', 'cache folder')
  .option('-r, --runtime <path>', 'file exporting eodash client runtime config')
  .option('-b, --base <path>', 'base public path')
  .option('-p, --port <port>', 'serving  port')
  .option('-o, --open', 'open default browser when the server starts')
  .option('-c, --config <path>', 'path to eodash server and build configuration file')
  .option('--host [IP address]', 'specify which IP addresses the server should listen on')
  .option('--no-host', 'do not expose server to the network')
  .parse(process.argv)


export const userConfig = await getUserConfig(cli.opts(), process.argv?.[2])

export const appPath = fileURLToPath(new URL("..", import.meta.url)),
  publicPath = userConfig.publicDir ? path.resolve(rootPath, userConfig.publicDir) : path.join(rootPath, './public'),
  srcPath = path.join(rootPath, "/src"),
  runtimeConfigPath = userConfig.runtime ? path.resolve(rootPath, userConfig.runtime) : path.join(srcPath, "./config.runtime.js"),
  compiletimeConfigPath = userConfig.entryPoint ? path.resolve(rootPath, userConfig.entryPoint) : path.join(srcPath, "/config.js"),
  dotEodashPath = path.join(rootPath, "/.eodash"),
  buildTargetPath = userConfig.outDir ? path.resolve(rootPath, userConfig.outDir) : path.join(dotEodashPath, '/dist'),
  cachePath = userConfig.cacheDir ? path.resolve(rootPath, userConfig.cacheDir) : path.join(dotEodashPath, 'cache');


/**
 * @param {Options} options
 * @param {string | undefined} command
 */
async function getUserConfig(options, command) {
  let eodashCLiConfigFile = options.config ? path.resolve(rootPath, options.config) : path.join(rootPath, 'eodash.config.js');
  /** @type {import("../core/types").EodashCLiConfig} */
  let config = {};
  if (existsSync(eodashCLiConfigFile)) {
    config = await import(eodashCLiConfigFile).then(config => config.default).catch(err => {
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
    cacheDir: options.cacheDir ?? config.cacheDir,
    entryPoint: options.entryPoint ?? config.entryPoint,
    outDir: options.outDir ?? config.outDir,
    publicDir: options.publicDir ?? config.publicDir,
    runtime: options.runtime ?? config.runtime
  }
}

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
