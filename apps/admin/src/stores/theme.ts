/**
 * Theme Store — Platform-Wide Theme System
 *
 * Implements the PO-mandated three-state theme: System (auto) / Light / Dark.
 * Authority: PO Override (2026-04-25), Arch Lock V3 §6, Doc9 V2 Part 10, R17 V2 §10.
 * Wiring Layer: Layer 6 (State Management)
 *
 * WHY three states instead of a simple toggle:
 * The PO mandated "automatic system preference detection" alongside manual
 * light/dark selection. The 'system' state delegates to the OS-level
 * prefers-color-scheme media query, while 'light' and 'dark' are explicit overrides.
 *
 * WHY localStorage:
 * Theme preference must persist across sessions per R17 V2 §10.
 * The key 'viyo-theme' is read on initialization to restore the user's choice.
 *
 * HOW dark mode is applied:
 * Tailwind's darkMode: 'class' strategy requires adding/removing the 'dark' class
 * on the <html> element. This store manages that class imperatively because
 * React's virtual DOM does not control <html> attributes.
 */

import { create } from 'zustand';
import type { ThemePreference } from '@viyo/shared';

const STORAGE_KEY = 'viyo-theme';

/** Reads the OS-level color scheme preference. */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies the resolved theme to the document.
 * Adds or removes the 'dark' class on <html> for Tailwind's class-based dark mode.
 */
function applyTheme(preference: ThemePreference): void {
  const resolved = preference === 'system' ? getSystemTheme() : preference;
  const root = document.documentElement;

  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

interface ThemeState {
  /** Current theme preference: 'system' | 'light' | 'dark' */
  preference: ThemePreference;
  /** Set theme preference, persist to localStorage, and apply to DOM */
  setTheme: (preference: ThemePreference) => void;
  /** Initialize theme from localStorage and set up system preference listener */
  initialize: () => () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',

  setTheme: (preference: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, preference);
    applyTheme(preference);
    set({ preference });
  },

  /**
   * Initializes the theme system:
   * 1. Reads persisted preference from localStorage
   * 2. Applies the resolved theme to the DOM
   * 3. Listens for OS-level theme changes (only matters when preference is 'system')
   *
   * Returns a cleanup function to remove the media query listener.
   */
  initialize: () => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null;
    const preference = stored ?? 'system';

    set({ preference });
    applyTheme(preference);

    // Listen for OS theme changes to update when preference is 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (get().preference === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  },
}));
