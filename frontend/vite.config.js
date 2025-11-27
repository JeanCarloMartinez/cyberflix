// frontend/vite.config.js

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // La entrada principal (index.html)
        main: resolve(__dirname, "index.html"),

        // La entrada del panel de administración
        adminPanel: resolve(__dirname, "src/AdminPanel.html"),
      },
    },
    outDir: "dist",
  },
});
