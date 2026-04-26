/**
 * ThemeToggle — Three-State Theme Switcher
 *
 * Renders a button that cycles through System → Light → Dark theme states.
 * Implements: PO Override (2026-04-25), Arch Lock V3 §6.
 * Wiring Layer: Layer 7 (UI) → Layer 6 (useThemeStore)
 *
 * WHY cycle instead of dropdown:
 * Three states fit naturally in a cycle button (click to advance).
 * A dropdown adds unnecessary complexity for the skeleton. Can be upgraded
 * to a dropdown in a future polish pass if needed.
 */

import { useThemeStore } from '../../stores/theme.js';
import type { ThemePreference } from '@viyo/shared';

/** Maps each theme state to its Lucide-style SVG icon and next state. */
const THEME_CYCLE: Record<ThemePreference, { next: ThemePreference; label: string }> = {
  system: { next: 'light', label: 'System' },
  light: { next: 'dark', label: 'Light' },
  dark: { next: 'system', label: 'Dark' },
};

export function ThemeToggle() {
  const { preference, setTheme } = useThemeStore();
  const current = THEME_CYCLE[preference];

  return (
    <button
      onClick={() => setTheme(current.next)}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      title={`Theme: ${current.label}. Click to switch.`}
      aria-label={`Current theme: ${current.label}. Click to switch to ${THEME_CYCLE[current.next].label}.`}
    >
      {preference === 'system' && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )}
      {preference === 'light' && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      {preference === 'dark' && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}
