import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.js",
        collections: "src/collections/index.js",
        helpers: "src/helpers/index.js",
        layers: "src/layers/index.js",
      },
      formats: ["es"],
      fileName: (_format, entry) => `${entry}.js`,
    },
    rollupOptions: { external: ["hyparquet", "loglevel", "mustache"] },
  },
});
