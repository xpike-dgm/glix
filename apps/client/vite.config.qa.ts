import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    strictPort: false
  },
  build: {
    target: "es2022",
    outDir: "dist-qa",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        devPreview: resolve(__dirname, "dev-stage11d.html")
      }
    }
  }
});
