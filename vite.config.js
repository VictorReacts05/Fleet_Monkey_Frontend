import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:7000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          proxy.timeout = 60000;
          proxy.proxyTimeout = 60000;
        },
      },
    },
    allowedHosts: [
      "22b2-2402-a00-408-591e-75ef-3988-5d17-47d7.ngrok-free.app"
    ],
  },
});
