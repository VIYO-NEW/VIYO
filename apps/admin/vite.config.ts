import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    /**
     * T12: Sentry Vite Plugin — uploads source maps on production builds.
     * Only active when SENTRY_AUTH_TOKEN and SENTRY_ORG are set.
     * Source maps are uploaded then deleted from the bundle for security.
     */
    mode === 'production' &&
      process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT_ADMIN ?? 'viyo-admin',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        sourcemaps: {
          filesToDeleteAfterUpload: ['./dist/**/*.map'],
        },
        release: {
          name: `viyo-admin@${process.env.npm_package_version ?? '0.0.0'}`,
        },
      }),
  ].filter(Boolean),
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
}));
