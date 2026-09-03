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
import { config as performanceReport } from "./tests/performance/report-config.js";
import { PerformanceReporter } from "./tests/performance/reporter/index.js";

const pkg = createRequire(import.meta.url)("./package.json");

/** The measured run: template tests plus settle waits, reported on. */
const isPerformanceRun = Boolean(process.env.VITE_PERF);

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
    coverage: {
      include: [
        "core/client/**/*.{js,vue}",
        "widgets/**/*.{js,vue}",
        "packages/*/src/**/*.js",
      ],
      exclude: ["**/*.d.ts", "**/types/**"],
      reporter: ["text-summary", "html"],
      reportOnFailure: true,
    },
    ...(isPerformanceRun && {
      reporters: [
        "default",
        new PerformanceReporter({
          outputFile: "tests/performance/report.json",
          report: performanceReport,
        }),
      ],
    }),
    projects: [
      {
        resolve: { alias },
        test: {
          name: "cli",
          include: ["tests/cli/**/*.spec.js"],
          environment: "node",
          testTimeout: 3 * 60 * 1000,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "stac",
          include: ["packages/stac/tests/**/*.test.js"],
          environment: "node",
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
        ...(isPerformanceRun && {
          server: {
            warmup: {
              clientFiles: [
                "./core/client/render.js",
                "./core/client/asWebComponent.js",
              ],
            },
          },
        }),
        test: {
          name: "browser",
          include: [
            "tests/unit/**/*.test.js",
            "tests/component/**/*.test.js",
            "tests/template/**/*.test.js",
          ],
          // Registers measurement hooks only when VITE_PERF is set.
          setupFiles: ["./tests/support/performance-setup.js"],
          ...(isPerformanceRun && { maxWorkers: 4, minWorkers: 4 }),
          testTimeout: 60 * 1000,
          // Template boots (app + real STAC fetches) run in beforeAll hooks.
          hookTimeout: 60 * 1000,
          browser: {
            enabled: true,
            // Pinned: how many tiles a map asks for depends on the viewport and
            // scale factor, so measurements are only comparable while both stay
            // fixed.
            provider: playwright({ contextOptions: { deviceScaleFactor: 1 } }),
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
