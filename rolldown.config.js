import { Module } from "module";
import { defineConfig } from "rolldown";
import { cp } from "fs/promises";

/** @type {import("rolldown").Plugin} */
const copyTypes = {
  name: "copy-node-types",
  buildEnd: async () => {
    await cp("core/node/types.d.ts", "dist/node/types.d.ts");
  },
};

const { builtinModules } = Module;

export default defineConfig({
  input: {
    cli: "core/node/cli/index.js",
    main: "core/node/main.js",
  },
  output: {
    dir: "dist/node",
    format: "esm",
    minify: true,
  },
  plugins: [copyTypes],
  external: [
    ...builtinModules,
    "vite",
    "commander",
    "@vitejs/plugin-vue",
    "vite-plugin-vuetify",
    "dotenv",
  ],
});
