/**
 * Supabase Client Factory — R22 §2
 * Provides typed client constructors for browser (anon) and server (service_role) contexts.
 * Browser clients use VITE_ prefixed env vars; server clients use non-prefixed vars.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a browser-side Supabase client using the anon key.
 * Auth state is managed automatically by supabase-js (localStorage).
 * Used by apps/web and apps/admin.
 */
export function createBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a server-side Supabase client scoped to a user's JWT.
 * Used by apps/worker auth middleware for JWT-authenticated requests.
 * RLS policies are enforced because we pass the user's access token.
 */
export function createServerClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  accessToken: string,
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a service-role Supabase client that bypasses RLS.
 * R22 §5.2: Used by background workers (Inngest) and webhook receivers.
 * Application logic MUST manually enforce tenant isolation when using this client.
 */
export function createServiceRoleClient(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type { SupabaseClient };
