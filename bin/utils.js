#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// global paths
export const appPath = fileURLToPath(new URL("..", import.meta.url));
export const execPath = fileURLToPath(new URL(process.cwd(), import.meta.url));
export const dotEodashPath = path.join(execPath, "/.eodash");
export const runtimeConfigPath = path.join(dotEodashPath, "./config.runtime.js");
export const compiletimeConfigPath = path.join(dotEodashPath, "/config.js");
export const buildTargetPath = path.join(dotEodashPath, '/dist')



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
