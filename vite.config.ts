import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api/fund": {
        target: "http://fundgz.1234567.com.cn",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fund/, "/js"),
      },
      "/api/search": {
        target: "http://fund.eastmoney.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/search/, "/js"),
      },
    },
  },
});
