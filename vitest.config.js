import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    bail: 1,
    testTimeout: 3 * 60 * 1000
  },
})
