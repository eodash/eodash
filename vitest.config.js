import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
import { playwright } from "@vitest/browser-playwright";
//@ts-expect-error todo
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

const pkg = createRequire(import.meta.url)("./package.json");
// Mirror core/node/cli/globals.js `clientModules`: app dependencies minus the
// node-only ones. Pre-bundling them stops Vite discovering a dep mid-run (via a
// dynamic/side-effect widget import) and reloading a test.
const nodeOnlyDeps = [
  "commander",
  "vite",
  "@vitejs/plugin-vue",
  "vite-plugin-vuetify",
  "dotenv",
  "stac-ts",
];
const clientDeps = Object.keys(pkg.dependencies ?? {}).filter(
  (m) => !nodeOnlyDeps.includes(m),
);

const vuetifySubpaths = [
  "vuetify/components",
  "vuetify/directives",
  "vuetify/components/VTable",
];

/** Shared source aliases (mirror the CLI's viteConfig aliases). */
const alias = {
  "@": fileURLToPath(new URL("./core/client", import.meta.url)),
  "^": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:widgets": fileURLToPath(new URL("./widgets", import.meta.url)),
};

export default defineConfig({
  test: {
    projects: [
      {
        // Logic/unit tests run in a headless browser
        plugins: [
          vue({
            template: {
              compilerOptions: {
                isCustomElement: (tag) =>
                  !tag.includes("v-") && tag.includes("-"),
              },
            },
          }),
        ],
        resolve: { alias },
        define: { "process.env": {} },
        optimizeDeps: { include: clientDeps },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
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
        optimizeDeps: { include: [...clientDeps, ...vuetifySubpaths] },
        test: {
          name: "component",
          include: ["tests/component/**/*.test.js"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            viewport: { width: 1440, height: 900 },
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
