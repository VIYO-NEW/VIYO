/**
 * Auth Store — Admin Portal (Lazy Supabase)
 *
 * Zustand store for admin authentication state.
 * Uses getSupabase() (async lazy loader) instead of eagerly importing
 * the Supabase client, so the ~210KB SDK is only loaded when auth
 * is actually initialized.
 *
 * Authority: R22 §2.2, PO bundle size directive
 * Wiring Layer: Layer 2 (Auth) → Layer 7 (UI)
 */
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase.js';

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

  signInWithMagicLink: async (email: string) => {
    set({ loading: true });
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    set({ loading: false });
    return { error: error ? new Error(error.message) : null };
  },

  signOut: async () => {
    set({ loading: true });
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    set({ session: null, user: null, loading: false });
  },

  initialize: () => {
    // Fire-and-forget async initialization.
    // The subscription cleanup is returned synchronously via a ref.
    let unsubscribe: (() => void) | null = null;

    getSupabase().then((supabase) => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          initialized: true,
        });
      });

      unsubscribe = () => subscription.unsubscribe();

      supabase.auth.getSession().then(({ data: { session } }) => {
        set({
          session,
          user: session?.user ?? null,
          initialized: true,
        });
      });
    });

    // Return cleanup function. If Supabase hasn't loaded yet,
    // the unsubscribe will be a no-op (component unmounted before init).
    return () => {
      if (unsubscribe) unsubscribe();
    };
  },
}));
