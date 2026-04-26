/**
 * Vite Configuration — VIYO Admin Portal
 *
 * Wiring Layer: Layer 10 (CI/CD + Build)
 *
 * KNOWN ISSUE (GAP-0003): @viyo/shared barrel exports include server-only
 * modules (api-keys.js, vault.js) that import node:crypto. Rollup fails
 * when these are pulled into the browser bundle. The proper fix is to split
 * @viyo/shared into browser-safe and server-only subpath exports.
 *
 * WORKAROUND: resolve.alias stubs node:crypto with a browser-safe no-op
 * module that throws clear errors if accidentally called at runtime.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'node:path';

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
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting for optimal loading:
         * - vendor-react: React + ReactDOM (framework, cached long-term)
         * - vendor-router: TanStack Router (routing core)
         * - vendor-supabase: Supabase SDK (lazy-loaded via auth store)
         * - vendor-sentry: Sentry SDK (lazy-loaded via initSentry)
         * - vendor-zod: Zod (pulled in by @viyo/shared barrel)
         * Pages are automatically split by React.lazy() in router.tsx.
         */
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || (id.includes('/react/') && !id.includes('react-router'))) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-router') || id.includes('@tanstack/router-core') || id.includes('@tanstack/history')) {
              return 'vendor-router';
            }
            if (id.includes('@supabase/')) {
              return 'vendor-supabase';
            }
            if (id.includes('@sentry/')) {
              return 'vendor-sentry';
            }
            if (id.includes('/zod/')) {
              return 'vendor-zod';
            }
          }
          return undefined;
        },
      },
    },
  },
  /**
   * GAP-0003 WORKAROUND: Stub node:crypto for browser builds.
   * The @viyo/shared barrel pulls in api-keys.js and vault.js which
   * import { randomBytes, createHash } from 'node:crypto'. These modules
   * are never called at runtime in the browser — they exist only because
   * Rollup can't tree-shake the barrel's re-exports.
   */
  resolve: {
    alias: {
      'node:crypto': path.resolve(__dirname, 'src/lib/node-crypto-stub.ts'),
    },
  },
}));
