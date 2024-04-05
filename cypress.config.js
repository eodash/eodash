import { defineConfig } from "cypress";
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import vue from '@vitejs/plugin-vue';
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
                isCustomElement: (tag) => !tag.includes('v-') && tag.includes('-')
              }
            },
          }),
          // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
          vuetify({
            autoImport: true,
          }),
        ],
        define: { 'process.env': {} },
        resolve: {
          alias: {
            '@': fileURLToPath(new URL('./core', import.meta.url)),
            '^': fileURLToPath(new URL('./widgets', import.meta.url)),
            "user:config": fileURLToPath(new URL('./core/eodash.js', import.meta.url)),
            "user:widgets": fileURLToPath(new URL('./widgets', import.meta.url))
          },
          extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
        },
        build: {
          outDir: './.eodash/dist',
          target: "esnext"
        }
      },
    },
    port: 3791,
    watchForFileChanges: false,
  }
})
