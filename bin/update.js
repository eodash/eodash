import { cp } from "fs/promises";
import { execPath, appPath, configPath } from "./utils.js";
import { existsSync } from "fs";
import path from "path";

export async function update() {
  if (existsSync(configPath)) {
    await cp(path.join(execPath, "/public"), path.join(appPath, "/public"), { recursive: true }).catch(err => {
      console.error(err)
    })
    await cp(configPath, path.join(appPath, '/public/config.js')).catch((e) => {
      console.error(e)
    })
  } else console.error('no config file was found');
}
