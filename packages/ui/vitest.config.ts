import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@chronoview/core": resolve(__dirname, "../core/src/index.ts"),
      "@chronoview/react": resolve(__dirname, "../react/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
  },
});
