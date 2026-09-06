import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "generateSW",
      registerType: "prompt",
      injectRegister: false,
      manifest: false,
      workbox: {
        globPatterns: [
          "index.html",
          "assets/index-*.js",
          "assets/index-*.css",
          "*.{svg,png,webmanifest}",
          "assets/common/**/*.{svg,png,webp}"
        ],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/health/,
          /^\/ws/,
          /^\/sw\.js/,
          /\.[a-zA-Z0-9]+$/
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.js$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "glix-game-chunks",
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/assets\/.*\.(?:webp|png|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "glix-media-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true
  },
  build: {
    target: "es2022"
  }
});
