/**
 * Build-time loader exposing the dependencies available inside custom widgets.
 * Mirrors the CLI's `clientModules` list (eodash dependencies minus build-only
 * packages - see `nodeModules` in `core/node/cli/globals.js`), keeping `axios`
 * since widgets can use it. globals.js can't be imported here directly because
 * its `#!/usr/bin/env node` shebang breaks esbuild's data-loader bundling.
 */

import pkg from "../../package.json";

const BUILD_ONLY = [
  "commander",
  "vite",
  "@vitejs/plugin-vue",
  "vite-plugin-vuetify",
  "dotenv",
];

export default {
  load() {
    return Object.keys(pkg.dependencies ?? {})
      .filter((name) => !BUILD_ONLY.includes(name))
      .sort()
      .map((name) => ({ name, version: pkg.dependencies[name] }));
  },
};
