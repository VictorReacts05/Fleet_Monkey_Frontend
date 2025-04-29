import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:7000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          proxy.timeout = 60000; // <-- set timeout properly here
          proxy.proxyTimeout = 60000; // <-- also for proxy timeout
        },
      },
    },
  },
});
