import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Panel, ana uygulamanın yanında /panel/ klasöründen yayınlanır (GitHub Pages).
// İçerik ve karakter çizimleri ana uygulamanın js/ klasöründen ortak kullanılır.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@app": fileURLToPath(new URL("../js", import.meta.url)),
    },
  },
  server: { fs: { allow: [".."] } },
  // Panel artık ana uygulamanın ana ekranında; bu proje bileşen kaynağı olarak duruyor.
  build: { outDir: "dist", emptyOutDir: true },
});
