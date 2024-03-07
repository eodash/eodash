import { cp } from "fs/promises";
import { execPath, appPath, runtimeConfigPath } from "./utils.js";
import { existsSync } from "fs";
import path from "path";

export async function update() {
  await cp(path.join(execPath, "/public"), path.join(appPath, "/public"), { recursive: true }).catch(err => {
    console.error(err)
  })
  if (existsSync(runtimeConfigPath)) {
    await cp(runtimeConfigPath, path.join(appPath, '/public/config.js')).catch((e) => {
      console.error(e)
    })
  }
}
