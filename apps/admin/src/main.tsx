/**
 * VIYO Admin Portal — Entry Point
 * T12: Sentry MUST be imported first for error capture before React renders.
 */
import './lib/sentry.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
