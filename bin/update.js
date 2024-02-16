#!/usr/bin/env node

import { copyFile, copyFolders } from './utils.js'

export default async () => {
  // 1. copy public
  const publicPath = __execPath + "/public"
  const appPublicPath = __appPath + "public"
  await copyFolders(publicPath, appPublicPath)
  // 2. copy config
  const appConfigPath = __appPath + "public/config.js";
  await copyFile(__configPath, appConfigPath)
  // 3. copy node_modules map
  const appNodeModsMapPath = __appPath + "core/modulesMap.js"
  await copyFile(__nodeModsMapPath, appNodeModsMapPath)
}
