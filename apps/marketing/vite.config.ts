/**
 * VIYO Marketing — Vite Configuration
 * Purpose: Builds the static Coming Soon marketing placeholder for viyo.new.
 * Spec: Size S staging-first placeholder; no backend logic, no API calls, no CDN dependencies.
 * Wiring Layer: Frontend static build surface for the standalone viyo-marketing Vercel project.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
  },
  preview: {
    allowedHosts: true,
    port: 4175,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
