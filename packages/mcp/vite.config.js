import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);

const stacRoot = path.resolve(__dirname, "../stac");

const stacAliases = {
  "@eodash/stac/collections": path.join(stacRoot, "src/collections/index.js"),
  "@eodash/stac/helpers": path.join(stacRoot, "src/helpers/index.js"),
  "@eodash/stac/layers": path.join(stacRoot, "src/layers/index.js"),
  "@eodash/stac": path.join(stacRoot, "src/index.js"),
};

const externalDeps = Object.keys(pkg.dependencies || {}).filter(
  (dep) => dep !== "@eodash/stac",
);

export default defineConfig({
  resolve: {
    alias: stacAliases,
  },
  ssr: {
    noExternal: [/@eodash\/stac/, "mustache", "loglevel", "hyparquet"],
  },
  build: {
    target: "node18",
    ssr: true,
    lib: {
      entry: {
        index: "index.js",
        server: "server.js",
        helpers: "helpers.js",
      },
      formats: ["es"],
      fileName: (_format, entry) => `${entry}.js`,
    },
    rollupOptions: {
      external: (id) => {
        if (id.startsWith("node:") || builtinModules.includes(id)) {
          return true;
        }
        return externalDeps.some(
          (dep) => id === dep || id.startsWith(`${dep}/`),
        );
      },
    },
  },
});
