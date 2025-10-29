/*
  This script creates a runtime configuration file based on
  environment variables set in the Dockerfile.
  Should be executed after building the app
 */
import fs from "fs";
import path from "path";

const dirname =
  process.argv[process.argv.findIndex((arg) => arg === "--dir") + 1];
const runtimePath = path.join(dirname, "/config.js");

fs.writeFileSync(runtimePath, createRuntimeConfig(), { encoding: "utf-8" });

function createRuntimeConfig(
  stacEndpoint = process.env.STAC_ENDPOINT,
  isApi = process.env.API,
  brand = process.env.BRAND,
) {
  const api = isApi === "true";
  return /* js */ `
  // fetch base config from built manifest
const manifest = await fetch("./.vite/manifest.json").then(res=>res.json())

const fileConfig = manifest["templates/index.js"]

const importedModule = await import("./" + fileConfig.file)
.then(m => m.default || m)
const key = Object.keys(importedModule)[0]
const baseConfig = importedModule[key].default
const getBaseConfig = importedModule[key].getBaseConfig
const lite = baseConfig.templates.lite
const expert = baseConfig.templates.expert
const compare = baseConfig.templates.compare
const explore = baseConfig.templates.explore


const stacEndpoint = ${stacEndpoint ? `"${stacEndpoint}"` : undefined}
const api = ${api}
const brand = await fetchBrand(${brand ? `"${brand}"` : undefined})


const config = await getBaseConfig({
  stacEndpoint:{
    endpoint: stacEndpoint,
    api
  },
  brand:{
    name:${brand ? `"${brand}"` : undefined},
    theme:{
      colors:{
        primary: brand.primary,
        secondary: brand.secondary
      }
    }
  },
})
// if it's api mode, only include explore template
if(api){
  config.templates = {
    explore
  }
}
export default config

async function fetchBrand(workspaceId = "eox"){
  const theme = await import("https://hub-brands.eox.at/" + workspaceId + "/config.mjs")
  .then(m => m.config.theme).catch(e => {
    console.warn("[eodash] Could not load brand config for workspace:", workspaceId, e)
  })
  console.log("theme", theme)
  return {
    primary: theme?.primary_color,
    secondary: theme?.secondary_color ?? theme?.primary_color
  }
}

  `;
}
