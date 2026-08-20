import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
import { playwright } from "@vitest/browser-playwright";
//@ts-expect-error todo
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import {
  serveFiles,
  serveResponses,
  stopServingFiles,
} from "./tests/support/commands.js";

const pkg = createRequire(import.meta.url)("./package.json");

const nodeOnlyDeps = [
  "commander",
  "vite",
  "@vitejs/plugin-vue",
  "vite-plugin-vuetify",
  "dotenv",
  "stac-ts",
];

const clientDeps = Object.keys(pkg.dependencies ?? {}).filter(
  (m) => !nodeOnlyDeps.includes(m) && m !== "vuetify",
);

/** Shared source aliases (mirror the CLI's viteConfig aliases). */
const alias = {
  "@": fileURLToPath(new URL("./core/client", import.meta.url)),
  "^": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:widgets": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:config": fileURLToPath(
    new URL("./tests/support/user-config-stub.js", import.meta.url),
  ),
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: "mcp",
          include: ["tests/mcp/**/*.test.js", "mcp-server/**/*.test.js"],
          environment: "node",
          testTimeout: 60 * 1000,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "cli",
          include: ["tests/cli/**/*.spec.js"],
          environment: "node",
          testTimeout: 3 * 60 * 1000,
        },
      },
      // One project for all browser tiers: a project launches its own browser,
      // so per-tier projects would open one window each in headed mode. Tiers
      // are scoped by path filters instead (`vitest run tests/unit`).
      {
        plugins: [
          vue({
            template: {
              compilerOptions: {
                isCustomElement: (tag) =>
                  !tag.includes("v-") && tag.includes("-"),
              },
            },
          }),
          vuetify({ autoImport: true }),
        ],
        resolve: { alias },
        define: { "process.env": {} },
        optimizeDeps: { include: clientDeps, exclude: ["vuetify"] },
        test: {
          name: "browser",
          include: [
            "tests/unit/**/*.test.js",
            "tests/component/**/*.test.js",
            "tests/template/**/*.test.js",
          ],
          testTimeout: 60 * 1000,
          // Template boots (app + real STAC fetches) run in beforeAll hooks.
          hookTimeout: 60 * 1000,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            viewport: { width: 1440, height: 900 },
            instances: [{ browser: "chromium" }],
            commands: { serveFiles, serveResponses, stopServingFiles },
          },
        },
      },
    ],
  },
});
