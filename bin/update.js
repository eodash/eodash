import { cp } from "fs/promises";
import { rootPublicPath, appPath, runtimeConfigPath, appPublicPath } from "./utils.js";
import { existsSync } from "fs";
import path from "path";

export async function update() {
  if (rootPublicPath !== appPublicPath) {
    await cp(rootPublicPath, appPublicPath, { recursive: true }).catch(err => {
      console.error(err)
    })
    if (existsSync(runtimeConfigPath)) {
      await cp(runtimeConfigPath, path.join(appPath, '/public/config.js')).catch((e) => {
        console.error(e)
      })
    }
  }
}
