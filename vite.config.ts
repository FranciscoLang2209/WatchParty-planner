import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { planApi } from './server/plan-api';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  plugins: [react(), planApi()],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss()] } },
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: true,
    watch: { ignored: ['**/project-plan/**'] },
  },
  preview: { host: '127.0.0.1', port: 5180, strictPort: true },
});
