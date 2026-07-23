import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";
import { createRequire } from "node:module";
import { playwright } from "@vitest/browser-playwright";
//@ts-expect-error todo
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

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
  (m) => !nodeOnlyDeps.includes(m),
);

// vite-plugin-vuetify is used instead
const componentDeps = clientDeps.filter((m) => m !== "vuetify");

/** Shared source aliases (mirror the CLI's viteConfig aliases). */
const alias = {
  "@": fileURLToPath(new URL("./core/client", import.meta.url)),
  "^": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:widgets": fileURLToPath(new URL("./widgets", import.meta.url)),
  "user:config": fileURLToPath(
    new URL("./tests/support/user-config-stub.js", import.meta.url),
  ),
};

/** Vue plugin with the app's custom-element compiler option. */
const vuePlugin = () =>
  vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => !tag.includes("v-") && tag.includes("-"),
      },
    },
  });

/**
 * A mounted-Vue browser project (component + template tiers). vuetify is
 * excluded from the optimizer because `autoImport` rewrites SFCs to
 * per-component subpaths that Vite would otherwise discover mid-run.
 * @param {Record<string, unknown>} test Project `test` config (name, include, timeouts, ...).
 */
const browserAppProject = (test) => ({
  plugins: [vuePlugin(), vuetify({ autoImport: true })],
  resolve: { alias },
  define: { "process.env": {} },
  optimizeDeps: { include: componentDeps, exclude: ["vuetify"] },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      viewport: { width: 1440, height: 900 },
      instances: [{ browser: /** @type {const} */ ("chromium") }],
    },
    ...test,
  },
});

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
      browserAppProject({
        name: "component",
        include: ["tests/component/**/*.test.js"],
      }),
      browserAppProject({
        name: "template",
        include: ["tests/template/**/*.test.js"],
        testTimeout: 60 * 1000,
      }),
    ],
  },
});
