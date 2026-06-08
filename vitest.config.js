import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./core/client", import.meta.url)),
    },
  },
  test: {
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    bail: 1,
    testTimeout: 3 * 60 * 1000,
  },
});
