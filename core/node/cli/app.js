#!/usr/bin/env node

import { build as viteBuild, createServer, preview } from "vite";
import { appPath, renderIndexHtml } from "./globals.js";
import { writeFile, rm, cp } from "fs/promises";
import { createViteConfig } from "./viteConfig.js";
import path from "path";
import { existsSync } from "fs";

/** @param {import("./globals.js").EodashContext} ctx */
export const createDevServer = async (ctx) => {
  const server = await createServer(
    await createViteConfig(ctx)({ mode: "development", command: "serve" }),
  );
  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });
};

/** @param {import("./globals.js").EodashContext} ctx */
export const buildApp = async (ctx) => {
  const { userConfig, runtimeConfigPath, buildTargetPath } = ctx;

  const build = async () => {
    const config = await createViteConfig(ctx)({
      mode: "production",
      command: "build",
    });
    await viteBuild(config);

    if (existsSync(runtimeConfigPath)) {
      await cp(runtimeConfigPath, path.join(buildTargetPath, "config.js"), {
        recursive: true,
      }).catch((e) => {
        console.error(e);
      });
    }
  };

  if (userConfig.lib) {
    await build();
    return;
  }

  const htmlPath = path.join(appPath, "/index.html");
  await writeFile(htmlPath, renderIndexHtml(!!userConfig.lib)).then(
    async () => {
      await build();
      await rm(htmlPath).catch(() => {
        console.error("failed to remove index.html");
      });
    },
  );
};

/** @param {import("./globals.js").EodashContext} ctx */
export async function previewApp(ctx) {
  const { userConfig, rootPath, buildTargetPath } = ctx;
  const previewServer = await preview({
    root: rootPath,
    base: userConfig.base ?? "",
    preview: {
      port: isNaN(userConfig.port) ? 8080 : userConfig.port,
      open: userConfig.open,
      host: userConfig.host,
    },
    build: {
      outDir: buildTargetPath,
    },
  });
  previewServer.printUrls();
}
