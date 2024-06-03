import { Module } from "module";
import { defineConfig } from "rollup";
import { transformWithEsbuild } from 'vite'
import { cp } from 'fs/promises'


/** @type {import("rollup").Plugin} */
const transform = {
  name: 'transform-esbuild',
  buildEnd: async () => {
    await cp('core/node/types.d.ts', 'dist/node/types.d.ts')
  },
  renderChunk: async (contents, _chunk, { file }) => {
    const { code, warnings } = await transformWithEsbuild(contents, file, {
      format: "esm",
      loader: "js",
      minify: true,
      logLevel: "info",
    });

    if (warnings.length) {
      warnings.forEach(w => {
        console.warn(w.text, `detail:${w.detail}`, `location: ${w.location}`, `notes: ${w.notes}`)
      })
    }

    return { code }
  }
}

const { builtinModules } = Module


export default defineConfig({
  input: {
    cli: 'core/node/cli/index.js',
    main: 'core/node/main.js',
  },
  output: {
    dir: 'dist/node',
    format: 'esm',
  },
  plugins: [transform],
  external: [...builtinModules, "vite", "commander", "@vitejs/plugin-vue", "vite-plugin-vuetify"]
});



