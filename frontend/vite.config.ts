// frontend/vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

export default defineConfig({
  base: "/", // Changed from "/skymart-h/" to "/"

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
    dedupe: ["react", "react-dom", "react-router-dom"], // Add this
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"], // Add this
    force: true, // Add this to force re-optimization
  },

  server: {
    port: 3010,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"], // Add react-router-dom
        },
      },
    },
  },
});
