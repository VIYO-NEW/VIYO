/**
 * Browser Supabase Client — Admin Portal (Lazy-loaded)
 *
 * Creates the Supabase client on first access, not at module scope.
 * This defers loading the full Supabase SDK (~210KB minified) until
 * auth is actually needed (AuthGuard initialization).
 *
 * WHY lazy: The Supabase SDK includes auth-js, postgrest-js, storage-js,
 * realtime-js, and phoenix — all pulled in by createClient(). Eager loading
 * adds ~210KB to the initial bundle for a skeleton that may not need auth
 * on every page load (e.g., cached sessions).
 *
 * Authority: R22 §2.2, PO bundle size directive
 * Wiring Layer: Layer 2 (Auth) → Layer 7 (UI)
 */

import type { SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

/**
 * Get the Supabase browser client (lazy singleton).
 * First call dynamically imports @supabase/supabase-js and creates the client.
 * Subsequent calls return the cached instance synchronously.
 */
export async function getSupabase(): Promise<SupabaseClient> {
  if (_client) return _client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth features will not work.',
    );
  }

  const { createClient } = await import('@supabase/supabase-js');
  _client = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}
