import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",   // your Express server
        changeOrigin: true,
        secure: false,
        // forward /api/profile/update -> http://localhost:3000/profile/update
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
