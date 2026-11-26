import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/open-stacks-trainer/",
  plugins: [
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: "Open Stacks Trainer",
        short_name: "Open Stacks",
        description:
          "A free, private, browser-only trainer for memorized card stacks.",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FAF6EE",
        theme_color: "#FAF6EE",
        lang: "en",
        categories: ["education", "utilities"],
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,svg,png,webmanifest}"],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        navigateFallback: "index.html",
      },
    }),
  ],
  build: {
    outDir: "dist",
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
