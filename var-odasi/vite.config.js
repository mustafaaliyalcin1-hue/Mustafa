import { defineConfig } from 'vite';

// Göreli yollar: derlenen oyun herhangi bir klasörden / statik sunucudan çalışır.
export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  build: { target: 'es2020', chunkSizeWarningLimit: 2000 },
});
