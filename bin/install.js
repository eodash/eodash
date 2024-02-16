#!/usr/bin/env node

import { readFile } from './utils.js'
import { spawn } from 'child_process';


export default async () => {
  // install node_modules from config-template to app
  const packageJson = JSON.parse(await readFile(__execPath + "/package.json"))
  const appPackageJson = JSON.parse(await readFile(__appPath + "package.json"))
  for (const [dep, version] of Object.entries(packageJson.dependencies)) {
    if (dep in appPackageJson.dependencies || dep.includes('eodash')) {
      continue;
    }
    spawn("npm", ["install", `${dep}@${version}`], { cwd: __appPath, stdio: 'inherit' })
  }
}
