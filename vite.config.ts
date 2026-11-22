import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/open-stacks-trainer/",
  build: {
    outDir: "dist",
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
