import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";

import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    port: 3000, // http://localhost:3000 でアクセス可能
    open: false, // 起動時にブラウザを自動に開くことを抑制（好みの問題なので true も可）
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // "@/components/Button" でインポートできる
    },
  },
});
