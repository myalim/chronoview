import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Resolve workspace dependency to source for vitest
      "@chronoview/core": resolve(__dirname, "../core/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
  },
});
