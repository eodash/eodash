#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import path from "path";
import { createLogger } from "vite";
import { Command } from "commander";
import { fileURLToPath } from "url";

const cli = new Command("eodash");

/** eodash root path */
export const appPath = searchForPackageRoot();

/** Root path to the host application */
export const rootPath = searchForPackageRoot(process.cwd());

/** host application  package.json */
export const rootPkgJSON =
  JSON.parse(readFileSync(path.join(rootPath, "package.json"), "utf-8")) ?? {};
/** eodash package.json */
export const appPkgJSON =
  JSON.parse(readFileSync(path.join(appPath, "package.json"), "utf-8")) ?? {};

export const nodeModules = [
  "commander",
  "vite",
  "@vitejs/plugin-vue",
  "vite-plugin-vuetify",
  "axios",
];
export const clientModules = Object.keys(appPkgJSON?.dependencies).filter(
  (m) => !nodeModules.includes(m),
);

/**
 * CLI flags object
 *
 * @typedef {Object} Options
 * @property {string | false} publicDir
 * @property {string} outDir
 * @property {string} entryPoint
 * @property {string} widgets
 * @property {string} cacheDir
 * @property {string} runtime
 * @property {string} base
 * @property {string | number} port
 * @property {boolean} open
 * @property {boolean | string} host
 * @property {string} config
 * @property {boolean} lib
 */

cli.version(appPkgJSON.version, "-v, --version", "output the current version");

cli
  .option("--publicDir <path>", "path to statically served assets folder")
  .option("--no-publicDir", "stop serving static assets")
  .option("--outDir <path>", "minified output folder")
  .option("-e, --entryPoint <path>", "file exporting `createEodash`")
  .option(
    "-w, --widgets <path>",
    "folder that contains vue components as internal widgets",
  )
  .option("--cacheDir <path>", "cache folder")
  .option("-r, --runtime <path>", "file exporting eodash client runtime config")
  .option("-b, --base <path>", "base public path")
  .option("-p, --port <port>", "serving  port")
  .option("-o, --open", "open default browser when the server starts")
  .option(
    "-c, --config <path>",
    "path to eodash server and build configuration file",
  )
  .option(
    "--host [IP address]",
    "specify which IP addresses the server should listen on",
  )
  .option("-l, --lib", "builds eodash as a web component library")
  .option("--no-lib", "builds eodash as an SPA")
  .option("--no-host", "do not expose server to the network")
  .parse(process.argv);

export const userConfig = await getUserConfig(cli.opts(), process.argv?.[2]);

export const publicPath = userConfig.publicDir
    ? path.resolve(rootPath, userConfig.publicDir)
    : path.join(rootPath, "./public"),
  srcPath = path.join(rootPath, "/src"),
  runtimeConfigPath = userConfig.runtime
    ? path.resolve(rootPath, userConfig.runtime)
    : path.join(srcPath, "./runtime.js"),
  entryPath = userConfig.entryPoint
    ? path.resolve(rootPath, userConfig.entryPoint)
    : path.join(srcPath, "/main.js"),
  internalWidgetsPath = userConfig.widgets
    ? path.resolve(rootPath, userConfig.widgets)
    : path.join(srcPath, "widgets"),
  dotEodashPath = path.join(rootPath, "/.eodash"),
  buildTargetPath = userConfig.outDir
    ? path.resolve(rootPath, userConfig.outDir)
    : path.join(dotEodashPath, "/dist"),
  cachePath = userConfig.cacheDir
    ? path.resolve(rootPath, userConfig.cacheDir)
    : path.join(dotEodashPath, "cache");

export const logger = createLogger(undefined, { prefix: "[eodash]" });

/**
 * @param {Options} options
 * @param {string | undefined} command
 */
async function getUserConfig(options, command) {
  let eodashCLiConfigFile = options.config
    ? path.resolve(rootPath, options.config)
    : path.join(rootPath, "eodash.config.js");
  /** @type {import("../types").EodashConfig} */
  let config = {};
  if (existsSync(eodashCLiConfigFile)) {
    config = await import(eodashCLiConfigFile)
      .then((userConfig) => {
        if (userConfig.default instanceof Function) {
          return userConfig.default();
        } else {
          return userConfig.default;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  } else {
    eodashCLiConfigFile = null;
  }

  return {
    base: options.base ?? config?.base,
    port: Number(options.port ?? config?.[command]?.port),
    host:
      options.host ??
      config?.[/** @type {"dev" | "preview"} */ (command)]?.host,
    open:
      options.open ??
      config?.[/** @type {"dev" | "preview"} */ (command)]?.open,
    cacheDir: options.cacheDir ?? config?.cacheDir,
    entryPoint: options.entryPoint ?? config?.entryPoint,
    outDir: options.outDir ?? config?.outDir,
    publicDir: options.publicDir ?? config?.publicDir,
    runtime: options.runtime ?? config?.runtime,
    widgets: options.widgets ?? config?.widgets,
    lib: options.lib ?? config?.lib,
    vite: config.vite,
  };
}

/** @param {string} [from] */
function searchForPackageRoot(
  from = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url)),
) {
  if (from?.split("/").length) {
    if (existsSync(path.resolve(from, "package.json"))) {
      return from;
    }
    return searchForPackageRoot(path.resolve(from, ".."));
  } else {
    throw new Error("no package root found from " + from);
  }
}

export const indexHtml = `
<!DOCTYPE html>
<html lang="en" style="overflow: hidden">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Eodash v5</title>
</head>

<body>
${
  userConfig.lib
    ? `<eo-dash style="height:100dvh;"/>
<script type="module" src="${path.resolve(`/@fs/${appPath}`, `core/client/asWebComponent.js`)}"></script>
`
    : ` <div id="app" />
<script type="module" src="${path.resolve(`/@fs/${appPath}`, `core/client/render.js`)}"></script>
`
}
</body>
</html>`;
