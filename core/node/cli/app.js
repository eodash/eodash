#!/usr/bin/env node

import { build as viteBuild, createServer, preview } from "vite";
import {
  rootPath,
  appPath,
  buildTargetPath,
  userConfig,
  runtimeConfigPath,
  indexHtml,
} from "./globals.js";
import { writeFile, rm, cp } from "fs/promises";
import { viteConfig } from "./viteConfig.js";
import path from "path";
import { existsSync } from "fs";

export const createDevServer = async () => {
  const server = await createServer(
    await viteConfig({ mode: "development", command: "serve" }),
  );
  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({ print: true });
};

export const buildApp = async () => {
  const build = async () => {
    const config = await viteConfig({ mode: "production", command: "build" });
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
  } else {
    const htmlPath = path.join(appPath, "/index.html");
    await writeFile(htmlPath, indexHtml).then(async () => {
      await build();
      await rm(htmlPath).catch(() => {
        console.error("failed to remove index.html");
      });
    });
  }
};

export async function previewApp() {
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
