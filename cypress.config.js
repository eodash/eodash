import { defineConfig } from "cypress";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "url";

export default defineConfig({
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
      viteConfig: {
        cacheDir: "./.eodash/cache",
        plugins: [
          vue({
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
        ],
        define: { "process.env": {} },
        server: {
          warmup: {
            clientFiles: ["./core/client/**", "./tests/cypress/**"],
          },
        },
        resolve: {
          alias: {
            "@": fileURLToPath(new URL("./core/client", import.meta.url)),
            "^": fileURLToPath(new URL("./widgets", import.meta.url)),
            "user:config": fileURLToPath(
              new URL("./core/client/eodash.js", import.meta.url),
            ),
            "user:widgets": fileURLToPath(
              new URL("./widgets", import.meta.url),
            ),
          },
          extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
        },
        build: {
          outDir: "./.eodash/dist",
          target: "esnext",
        },
      },
    },
    port: 3791,
    watchForFileChanges: false,
    supportFile: "./tests/cypress/support/component.js",
    indexHtmlFile: "./tests/cypress/support/component-index.html",
    fixturesFolder: "./tests/cypress/fixtures",
    screenshotsFolder: "./tests/cypress/screenshots",
    downloadsFolder: "./tests/cypress/screenshots",
  },
});
