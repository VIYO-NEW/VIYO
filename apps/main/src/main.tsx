/**
 * VIYO Marketing — Coming Soon Page
 * Purpose: Renders the lightweight viyo.new placeholder while the full marketing site is prepared.
 * Spec: Text wordmark, launch headline, subline, non-functional email capture UI, white/light theme.
 * Wiring Layer: Frontend UI only; no backend, no API calls, and no external font/CDN dependencies.
 * Design Reminder: Editorial Swiss-modern minimalism with warm white space, precise typography, and restrained ink/accent contrast.
 */
import { StrictMode, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function handlePlaceholderSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
}

/** Renders the static VIYO Coming Soon main placeholder. */
function MarketingComingSoon() {
  return (
    <main className="page-shell" aria-labelledby="coming-soon-title">
      <section className="hero-panel" aria-describedby="coming-soon-description form-note">
        <div className="wordmark" aria-label="VIYO wordmark">
          VIYO
        </div>

        <div className="hero-copy">
          <p className="eyebrow">A new brand intelligence platform is on the way.</p>
          <h1 id="coming-soon-title">Something big is coming.</h1>
          <p id="coming-soon-description" className="subline">
            VIYO is launching soon. Stay tuned.
          </p>
        </div>

        <form className="notify-form" aria-label="Launch notification signup" onSubmit={handlePlaceholderSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              aria-describedby="form-note"
            />
          </div>
          <button type="submit">Notify me</button>
        </form>

        <p id="form-note" className="form-note">
          Notification signup is a placeholder while the launch experience is being prepared.
        </p>
      </section>
    </main>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <MarketingComingSoon />
  </StrictMode>,
);
