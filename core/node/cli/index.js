#!/usr/bin/env node

import { Command } from "commander";
import { buildApp, createDevServer, previewApp } from "./app.js";
import {
  appPkgJSON,
  getUserConfig,
  resolveEodashContext,
  searchForPackageRoot,
} from "./globals.js";

const cli = new Command("eodash");

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
  .option("--no-host", "do not expose server to the network");

cli
  .command("dev")
  .description("start the development server")
  .action(createExecCommand("dev", createDevServer));

cli
  .command("build")
  .description("build the application for production")
  .action(createExecCommand("build", buildApp));

cli
  .command("preview")
  .description("serve the production build locally")
  .action(createExecCommand("preview", previewApp));

await cli.parseAsync(process.argv);

/**
 * Resolves the eodash context for a command, then hands it to the runner.
 *
 * @param {"dev" | "build" | "preview"} command
 * @param {(ctx: import("./globals.js").EodashContext) => Promise<void>} run
 */
function createExecCommand(command, run) {
  return async () => {
    const rootPath = searchForPackageRoot(process.cwd());
    const userConfig = await getUserConfig(cli.opts(), command, rootPath);
    await run(resolveEodashContext(userConfig, rootPath));
  };
}
