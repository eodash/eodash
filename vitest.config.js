import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import { existsSync, readdirSync } from "node:fs";
import { playwright } from "@vitest/browser-playwright";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import {
  //@ts-expect-error todo
  serveFiles,
  //@ts-expect-error todo
  serveResponses,
  //@ts-expect-error todo
  stopServingFiles,
} from "./tests/support/commands.js";
import { BenchReporter } from "./tests/support/bench-reporter.js";
import { loadFixtures } from "./tests/support/load-fixtures.js";
import { stacSourceAlias } from "./core/node/cli/globals.js";

/** `reporters` is root-only, so this is the only place to keep it off the tests. */
const isBenchRun = process.argv.includes("bench");

const REFERENCE_DIR = ".bench-baseline";
const RESULTS_DIR = ".bench-results";

/** Listed here: `bench.from()` throws on a missing file and the browser cannot stat. */
const benchReference = {
  dir: REFERENCE_DIR,
  resultsDir: RESULTS_DIR,
  referenceSuffix: " (reference)",
  files: existsSync(REFERENCE_DIR)
    ? readdirSync(REFERENCE_DIR).filter((file) => file.endsWith(".json"))
    : [],
};

/** Shared source aliases (mirror the CLI's viteConfig aliases). */
const alias = {
  ...(await stacSourceAlias()),
  "@": fileURLToPath(new URL("./core/client", import.meta.url)),
  "^": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:widgets": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:config": fileURLToPath(
    new URL("./tests/support/user-config-stub.js", import.meta.url),
  ),
};

export default defineConfig({
  test: {
    ...(isBenchRun && {
      reporters: ["default", new BenchReporter(benchReference)],
      fileParallelism: false,
    }),
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
    projects: [
      {
        resolve: { alias },
        test: {
          name: "cli",
          include: ["tests/cli/**/*.spec.js"],
          // Every benchmark is a browser benchmark. Left empty rather than
          // omitted: a project with no `benchmark.include` falls back to
          // `**/*.bench.js` and would run `tests/bench` in a node pool.
          benchmark: { include: [] },
          environment: "node",
          testTimeout: 3 * 60 * 1000,
        },
      },
      {
        resolve: { alias },
        test: {
          name: "stac",
          include: ["packages/stac/tests/**/*.test.js"],
          benchmark: { include: [] },
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
        optimizeDeps: {
          entries: [
            "core/client/render.js",
            "templates/*.js",
            "tests/**/*.test.js",
          ],
          exclude: ["vuetify"],
        },
        test: {
          name: "browser",
          include: [
            "tests/unit/**/*.test.js",
            "tests/component/**/*.test.js",
            "tests/template/**/*.test.js",
          ],
          benchmark: { include: ["tests/bench/**/*.bench.js"] },
          provide: {
            benchReference,
            ...(isBenchRun ? await loadFixtures() : {}),
          },
          setupFiles: ["./tests/support/pinia-setup.js"],
          testTimeout: 60 * 1000,
          // Template boots (app + real STAC fetches) run in beforeAll hooks.
          hookTimeout: 60 * 1000,
          browser: {
            enabled: true,
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
