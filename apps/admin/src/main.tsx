/**
 * VIYO Admin Portal — Entry Point
 *
 * Initializes Sentry asynchronously (lazy-loaded), then renders the app.
 * Sentry SDK is NOT in the initial bundle — it loads in parallel with
 * the first paint, then wraps the app in ErrorBoundary once ready.
 *
 * Authority: T12 (Sentry), PO bundle size directive
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import { initSentry } from './lib/sentry.js';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Start Sentry init in background — App renders immediately.
// initSentry() is fire-and-forget; ErrorBoundary activates once loaded.
initSentry();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
