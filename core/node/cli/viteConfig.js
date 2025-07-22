#!/usr/bin/env node

import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import {
  runtimeConfigPath,
  appPath,
  entryPath,
  cachePath,
  publicPath,
  userConfig,
  buildTargetPath,
  logger,
  rootPath,
  internalWidgetsPath,
  indexHtml,
  clientModules,
} from "./globals.js";
import { readFile } from "fs/promises";
import { config } from "dotenv";
import { defineConfig, mergeConfig, searchForWorkspaceRoot } from "vite";
import { existsSync } from "fs";
import path from "path";
import { vueCustomElementStyleInjector } from "./vitePlugins.js";

export const eodashViteConfig = /** @type {import("vite").UserConfigFn} */ (
  defineConfig(async ({ mode, command }) => {
    const envPrefix = ["VITE_", "EODASH_"];
    return /** @type {import("vite").UserConfig} */ ({
      base: userConfig.base ?? "",
      cacheDir: cachePath,
      plugins: [
        vue({
          features: {
            customElement: command === "build" && userConfig.lib,
          },
          template: {
            transformAssetUrls,
            compilerOptions: {
              isCustomElement: (tag) =>
                !tag.includes("v-") && tag.includes("-"),
            },
          },
        }),
        // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
        vuetify({
          autoImport: true,
        }),
        mode === "development" && {
          name: "inject-html",
          configureServer,
        },
        userConfig.lib && vueCustomElementStyleInjector(),
      ],
      customLogger: logger,
      define:
        command === "build" && userConfig.lib
          ? {
              "process.env": "import.meta.env",
            }
          : {
              "process.env": {},
              ...defineEnvVariables(envPrefix),
            },
      envPrefix,
      resolve: {
        alias: {
          "@": path.join(appPath, "core/client"),
          "^": path.join(appPath, "widgets"),
          "user:config": entryPath,
          "user:widgets": internalWidgetsPath,
        },
        extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
      },
      server: {
        allowedHosts: true,
        warmup: {
          clientFiles: [path.join(appPath, "core/client/**"), entryPath],
        },
        port: userConfig.port ?? 3000,
        open: userConfig.open,
        fs: {
          allow: [searchForWorkspaceRoot(process.cwd())],
        },
        host: userConfig.host,
      },
      root: appPath,
      ...(mode === "development" && {
        optimizeDeps: {
          include: [
            "webfontloader",
            "vuetify",
            "vue",
            "pinia",
            "stac-js",
            "urijs",
            "loglevel",
            "vega",
            "vega-lite",
            "vega-embed",
            "@eox/map",
            "@eox/map/src/plugins/advancedLayersAndSources",
            "@eox/layercontrol",
            "@eox/drawtools",
            "@eox/chart",
            "@eox/jsonform",
            "@eox/layout",
            "@eox/itemfilter",
            "@eox/timecontrol",
            "@eox/stacinfo",
            "color-legend-element",
            "@eox/map",
            "@eox/map/src/plugins/advancedLayersAndSources",
            "@eox/layercontrol",
            "@eox/timecontrol",
            "@eox/jsonform",
            "@eox/layout",
            "@eox/itemfilter",
            "@eox/stacinfo",
            "@eox/elements-utils",
          ],
          noDiscovery: true,
        },
      }),
      // false only if the user explicitly sets it to false
      /** @type {string | false} */
      publicDir: userConfig.publicDir === false ? false : publicPath,
      build: {
        outDir: buildTargetPath,
        emptyOutDir: true,
        target: "esnext",
        cssMinify: true,
        ...(userConfig.lib &&
          command === "build" && {
            minify: false,
            lib: {
              entry: path.join(appPath, "core/client/asWebComponent.js"),
              fileName: "eo-dash",
              formats: ["es"],
              name: "@eodash/eodash",
            },
            rollupOptions: {
              input: path.join(appPath, "core/client/asWebComponent.js"),
              // vuetify is compiled by "vite-plugin-vuetify"
              external: (source) => {
                const isCssOrVuetify =
                  source.includes("vuetify") ||
                  source.endsWith(".css") ||
                  source.endsWith("styles");
                const isClientDep = clientModules.some((m) =>
                  source.startsWith(m),
                );
                return !isCssOrVuetify && isClientDep;
              },
            },
          }),
      },
    });
  })
);

export const viteConfig = /** @type {import("vite").UserConfigFn} */ (
  defineConfig(async (env) => {
    return userConfig.vite
      ? mergeConfig(await eodashViteConfig(env), userConfig.vite)
      : eodashViteConfig(env);
  })
);

/** @type {import("vite").ServerHook} */
async function configureServer(server) {
  server.watcher.add([
    entryPath,
    runtimeConfigPath,
    path.join(internalWidgetsPath, "**/*.vue"),
  ]);

  let updatedPath = "";
  const loggerInfo = logger.info;
  logger.info = (msg, options) => {
    if (msg.includes("core")) {
      const removedPath = msg.split("/")[0].split(" ");
      removedPath.pop();
      const updatedMsg =
        removedPath.join(" ") + " " + updatedPath.replace(rootPath, "");

      return loggerInfo(updatedMsg, options);
    }
    return loggerInfo(msg, options);
  };

  server.watcher.on("change", async (path) => {
    updatedPath = path;
    if (path === runtimeConfigPath) {
      server.ws.send({
        type: "full-reload",
        path,
      });
    }
  });

  return () => {
    server.middlewares.use(async (req, res, next) => {
      if (
        req.originalUrl === "/@fs/config.js" ||
        req.originalUrl === "/config.js"
      ) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/javascript");
        if (existsSync(runtimeConfigPath)) {
          await readFile(runtimeConfigPath).then((runtimeConfig) => {
            res.write(runtimeConfig);
          });
        }
        res.end();
        return;
      }

      if (req.url?.endsWith(".html")) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        const html = await server.transformIndexHtml(
          req.url,
          indexHtml,
          req.originalUrl,
        );
        res.end(html);
        return;
      }
      next();
    });
  };
}
/** @param {string[]} prefix */
function defineEnvVariables(prefix) {
  // Load environment variables from .env file
  config();

  const env = {};
  for (const key in process.env) {
    if (prefix.some((p) => key.startsWith(p))) {
      env["process.env." + key] = `"${process.env[key]}"`;
    }
  }
  return env;
}
