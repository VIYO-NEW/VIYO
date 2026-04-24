/**
 * Auth Store — R22 §2.2, ADR-002 (Vite SPA + Zustand)
 * Zustand store managing user session state for the web app.
 * Listens to Supabase onAuthStateChange and syncs to store.
 */
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  /**
   * Send a magic link to the given email address.
   * R22 §2.1: Magic Link is the primary passwordless auth method.
   */
  signInWithMagicLink: async (email: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    set({ loading: false });
    return { error: error ? new Error(error.message) : null };
  },

  /**
   * Sign out the current user and clear session state.
   */
  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, loading: false });
  },

  /**
   * Initialize the auth listener. Returns an unsubscribe function.
   * Must be called once on app mount (e.g., in main.tsx or App.tsx useEffect).
   */
  initialize: () => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
      });
    });

    // Also get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        initialized: true,
      });
    });

    return () => subscription.unsubscribe();
  },
}));
