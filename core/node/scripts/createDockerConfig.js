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
const runtimeConfigEnv = process.env.EODASH_RUNTIME_CONFIG;

if (runtimeConfigEnv) {
  updateEnvRuntimeConfig(runtimeConfigEnv, dirname).finally(() => {
    process.exit(0);
  });
}

fs.writeFileSync(runtimePath, createRuntimeConfig(), { encoding: "utf-8" });

function createRuntimeConfig(
  stacEndpointEnv = process.env.STAC_ENDPOINT,
  apiEnv = process.env.API,
  brandEnv = process.env.BRAND,
  templatesStrEnv = process.env.TEMPLATES,
) {
  const api = apiEnv === "true";
  return /* js */ `
  // fetch base config from built manifest
const manifest = await fetch("./.vite/manifest.json").then(async res=> await res.json())

const fileConfig = manifest["templates/index.js"]

const importedModule = await import("./" + fileConfig.file)
.then(m => m.default || m)
const key = Object.keys(importedModule)[0]
const getBaseConfig = importedModule[key].getBaseConfig
const baseConfig = importedModule[key].default

const lite = baseConfig.templates.lite
const expert = baseConfig.templates.expert
const compare = baseConfig.templates.compare
const explore = baseConfig.templates.explore

const baseTemplates = { lite, expert, compare, explore }

const stacEndpoint = ${stacEndpointEnv ? `"${stacEndpointEnv}"` : undefined}
const api = ${api}
const brand = ${brandEnv ? `"${brandEnv}"` : undefined}
const brandConfig =  await fetchBrand(brand)
const templatesStr = ${templatesStrEnv ? `"${templatesStrEnv}"` : undefined}

// determine templates to include
const templateKeys = (() => {
  if (templatesStr) {
    return templatesStr.split(",").map(t => t.trim())
  } else {
    return api ? ["explore"] : ["lite","expert","compare","explore"]
  }
})()


const config = await getBaseConfig({
  stacEndpoint:{
    endpoint: stacEndpoint,
    api
  },
  brand:{
    name:brand,
    theme:{
      colors:{
        primary: brandConfig.primary,
        secondary: brandConfig.secondary
      }
    }
  }
})
config.templates = Object.fromEntries(templateKeys.map(key => [key, baseTemplates[key]]))

export default config

async function fetchBrand(workspaceId = "eox"){
  const theme = await import("https://hub-brands.eox.at/" + workspaceId + "/config.mjs")
  .then(m => m.config.theme).catch(e => {
    console.warn("[eodash] Could not load brand config for workspace:", workspaceId, e)
  })
  return {
    primary: theme?.primary_color,
    secondary: theme?.secondary_color ?? theme?.primary_color
  }
}

  `;
}
async function updateEnvRuntimeConfig(
  runtimeConfigEnv = process.env.EODASH_RUNTIME_CONFIG,
  baseDir = "/usr/share/nginx/html",
) {
  if (!runtimeConfigEnv) {
    return;
  }

  // pattern matching the  minified variable
  const pattern = /\w+\.EODASH_RUNTIME_CONFIG/g;

  const processFile = (filePath) => {
    const content = fs.readFileSync(filePath, "utf-8");
    if (pattern.test(content)) {
      const updated = content.replace(
        pattern,
        JSON.stringify(runtimeConfigEnv),
      );
      fs.writeFileSync(filePath, updated, "utf-8");
      console.log(`[eodash] Updated EODASH_RUNTIME_CONFIG in: ${filePath}`);
    }
  };

  const walkDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && /\.(js)$/.test(entry.name)) {
        processFile(fullPath);
      }
    }
  };

  walkDir(baseDir);
}
