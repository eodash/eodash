#!/usr/bin/env node

import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import { appPath, renderIndexHtml, clientModules } from "./globals.js";
import { readFile } from "fs/promises";
import {
  defineConfig,
  loadEnv,
  mergeConfig,
  searchForWorkspaceRoot,
} from "vite";
import { existsSync } from "fs";
import path from "path";
import { vueCustomElementStyleInjector } from "./vitePlugins.js";

/** @param {import("./globals.js").EodashContext} ctx */
export const createEodashViteConfig = (ctx) =>
  /** @type {import("vite").UserConfigFn} */ (
    defineConfig(async ({ mode, command }) => {
      const {
        userConfig,
        rootPath,
        cachePath,
        publicPath,
        entryPath,
        internalWidgetsPath,
        buildTargetPath,
        logger,
      } = ctx;
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
            configureServer: createConfigureServer(ctx),
          },
          userConfig.lib && vueCustomElementStyleInjector(),
        ],
        customLogger: logger,
        define: {
          __userConfigExist__: !!entryPath,
          ...(command === "build" && userConfig.lib
            ? {
                "process.env": "import.meta.env",
              }
            : {
                "process.env": {},
                ...defineEnvVariables(envPrefix, rootPath, mode),
              }),
        },
        envPrefix,
        resolve: {
          alias: {
            "@": path.join(appPath, "core/client"),
            "^": path.join(appPath, "widgets"),
            "user:widgets": internalWidgetsPath,
            ...(entryPath && {
              "user:config": entryPath,
            }),
          },
          extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
        },
        server: {
          allowedHosts: true,
          warmup: {
            clientFiles: [
              path.join(appPath, "core/client/**"),
              path.join(appPath, "widgets/**"),
              path.join(appPath, "templates/**"),
              ...(entryPath ? [entryPath] : []),
            ],
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
            entries: [
              path.join(appPath, "core/client/render.js"),
              path.join(appPath, "core/client/asWebComponent.js"),
              path.join(appPath, "templates/**.js"),
            ],
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
          // spa build configuration
          ...(!userConfig.lib &&
            command === "build" && {
              manifest: true,
              rolldownOptions: {
                input: {
                  main: path.join(appPath, "index.html"),
                  templates: path.join(appPath, "templates/index.js"),
                },
              },
            }),
          // lib build configuration
          ...(userConfig.lib &&
            command === "build" && {
              minify: false,
              lib: {
                entry: path.join(appPath, "core/client/asWebComponent.js"),
                fileName: (_, entryFileName) => {
                  return entryFileName === "asWebComponent"
                    ? "eo-dash.js"
                    : "templates.js";
                },
                cssFileName: "eo-dash",
                formats: ["es"],
                name: "@eodash/eodash",
              },
              rolldownOptions: {
                input: {
                  asWebComponent: path.join(
                    appPath,
                    "core/client/asWebComponent.js",
                  ),
                  templates: path.join(appPath, "templates/index.js"),
                },
                // vuetify is compiled by "vite-plugin-vuetify"
                external: (source) => {
                  const isCssOrVuetify =
                    source.includes("vuetify") ||
                    source.endsWith(".css") ||
                    source.endsWith("styles");
                  const isClientDep = clientModules.some(
                    (m) => source === m || source.startsWith(m + "/"),
                  );
                  // treeshaking drops "user:config", but the import must still resolve
                  const isUserConfig = source === "user:config" && !entryPath;
                  return (!isCssOrVuetify && isClientDep) || isUserConfig;
                },
                treeshake: {
                  moduleSideEffects: true,
                  propertyReadSideEffects: false,
                  unknownGlobalSideEffects: false,
                },
                onwarn(warning, defaultHandler) {
                  if (warning.code === "UNUSED_EXTERNAL_IMPORT") return;
                  defaultHandler(warning);
                },
              },
            }),
        },
      });
    })
  );

/**
 * Merges the host app's `vite` overrides over eodash's config.
 *
 * @param {import("./globals.js").EodashContext} ctx
 */
export const createViteConfig = (ctx) =>
  /** @type {import("vite").UserConfigFn} */ (
    defineConfig(async (env) => {
      const eodashViteConfig = createEodashViteConfig(ctx);
      return ctx.userConfig.vite
        ? mergeConfig(await eodashViteConfig(env), ctx.userConfig.vite)
        : eodashViteConfig(env);
    })
  );

/**
 * @param {import("./globals.js").EodashContext} ctx
 * @returns {import("vite").ServerHook}
 */
function createConfigureServer(ctx) {
  return async (server) => {
    const {
      userConfig,
      rootPath,
      entryPath,
      internalWidgetsPath,
      runtimeConfigPath,
      logger,
    } = ctx;
    const watchedFiles = [
      runtimeConfigPath,
      path.join(internalWidgetsPath, "**/*.vue"),
    ];
    if (entryPath) {
      watchedFiles.push(entryPath);
    }
    server.watcher.add(watchedFiles);

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
            renderIndexHtml(!!userConfig.lib),
            req.originalUrl,
          );
          res.end(html);
          return;
        }
        next();
      });
    };
  };
}

/**
 * Loads environment variables
 *
 * @param {string[]} prefix
 * @param {string} envDir - host application root
 * @param {string} mode
 */
function defineEnvVariables(prefix, envDir, mode) {
  /** @type {Record<string, string>} */
  const env = {};
  for (const [key, value] of Object.entries(loadEnv(mode, envDir, prefix))) {
    env["process.env." + key] = JSON.stringify(value);
  }
  return env;
}
