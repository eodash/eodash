#!/usr/bin/env node

import { existsSync, readFileSync } from "fs";
import path from "path";
import { createLogger } from "vite";
import { fileURLToPath } from "url";

/** eodash root path */
export const appPath = searchForPackageRoot();

/** eodash package.json */
export const appPkgJSON =
  JSON.parse(readFileSync(path.join(appPath, "package.json"), "utf-8")) ?? {};

export const nodeModules = [
  "commander",
  "vite",
  "@vitejs/plugin-vue",
  "vite-plugin-vuetify",
];
export const clientModules = Object.keys(appPkgJSON?.dependencies).filter(
  (m) => !nodeModules.includes(m),
);

/**
 * CLI flags object
 *
 * @typedef {object} Options
 * @property {string | false} publicDir
 * @property {string} outDir
 * @property {string | false} entryPoint
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

/**
 * Context inputs for CLI commands and Vite
 *
 * @typedef {ReturnType<typeof resolveEodashContext>} EodashContext
 */

/**
 * CLI flags merged over `eodash.config.js`
 *
 * @typedef {Awaited<ReturnType<typeof getUserConfig>>} ResolvedUserConfig
 */

/**
 * Derives every path from the host application root.
 *
 * @param {ResolvedUserConfig} config
 * @param {string} [root] - host application root
 */
export function resolveEodashContext(
  config,
  root = searchForPackageRoot(process.cwd()),
) {
  const srcPath = path.join(root, "/src");
  const dotEodashPath = path.join(root, "/.eodash");

  /** @type {string | false} */
  const entryPath =
    config.entryPoint === "false" || config.entryPoint === false
      ? false
      : config.entryPoint
        ? path.resolve(root, config.entryPoint)
        : path.join(srcPath, "/main.js");

  return {
    userConfig: config,
    rootPath: root,
    logger: createLogger(undefined, { prefix: "[eodash]" }),
    srcPath,
    dotEodashPath,
    publicPath: config.publicDir
      ? path.resolve(root, config.publicDir)
      : path.join(root, "./public"),
    runtimeConfigPath: config.runtime
      ? path.resolve(root, config.runtime)
      : path.join(srcPath, "./runtime.js"),
    entryPath,
    internalWidgetsPath: config.widgets
      ? path.resolve(root, config.widgets)
      : path.join(srcPath, "widgets"),
    buildTargetPath: config.outDir
      ? path.resolve(root, config.outDir)
      : path.join(dotEodashPath, "/dist"),
    cachePath: config.cacheDir
      ? path.resolve(root, config.cacheDir)
      : path.join(dotEodashPath, "cache"),
  };
}

/**
 * Reads `eodash.config.js` when present and merges CLI flags over it.
 *
 * @param {Partial<Options>} [options] - parsed CLI flags
 * @param {"dev" | "preview" | string} [command]
 * @param {string} [root] - host application root
 */
export async function getUserConfig(
  options = {},
  command = "",
  root = searchForPackageRoot(process.cwd()),
) {
  const configFile = options.config
    ? path.resolve(root, options.config)
    : path.join(root, "eodash.config.js");

  /** @type {import("../types").EodashConfig} */
  let config = {};
  if (existsSync(configFile)) {
    config = await import(configFile).then((userConfig) =>
      userConfig.default instanceof Function
        ? userConfig.default()
        : userConfig.default,
    );
  }

  const forCommand = config?.[/** @type {"dev" | "preview"} */ (command)];

  return {
    base: options.base ?? config?.base,
    port: Number(options.port ?? forCommand?.port),
    host: options.host ?? forCommand?.host,
    open: options.open ?? forCommand?.open,
    cacheDir: options.cacheDir ?? config?.cacheDir,
    entryPoint: options.entryPoint ?? config?.entryPoint,
    outDir: options.outDir ?? config?.outDir,
    publicDir: options.publicDir ?? config?.publicDir,
    runtime: options.runtime ?? config?.runtime,
    widgets: options.widgets ?? config?.widgets,
    lib: options.lib ?? config?.lib,
    vite: config?.vite,
  };
}

/** @param {string} [from] */
export function searchForPackageRoot(
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

/** @param {boolean} lib - render the web component entry instead of the SPA one */
export const renderIndexHtml = (lib) => /* html */ `
<!DOCTYPE html>
<html lang="en" style="overflow: hidden">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Eodash v5</title>
  <style>
    html,
    body {
      width: 100%;
      height: 100%;
      padding: 0;
      margin: 0;
    }
  </style>
</head>

<body>
${
  lib
    ? /* html */ `<eo-dash style="height:100%;"/>
<script type="module" src="${path.resolve(`/@fs/${appPath}`, `core/client/asWebComponent.js`)}"></script>
`
    : /* html */ ` <div id="app" style="height:100%;" />
<script type="module" src="${path.resolve(`/@fs/${appPath}`, `core/client/render.js`)}"></script>
`
}
</body>
</html>`;
