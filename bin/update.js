import { cp, readFile } from "fs/promises";
import { execPath, appPath, configPath } from "./utils.js";

export async function update() {
  await readFile(configPath).then(async () => {

    await cp(execPath + "/public", appPath + "/public", { recursive: true }).catch(err => {
      console.error(err)
    })
    await cp(configPath, appPath + '/public/config.js').catch((e) => {
      console.error(e)
    })
  }).catch(() => {
    console.error('no config file was found')
  })
}
