/**
 * Browser Supabase Client — R22 §2.2
 * Singleton client for the web app using VITE_ prefixed env vars.
 * Auth state is managed automatically by supabase-js (localStorage).
 */
import { createBrowserClient } from '@viyo/shared/auth/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Auth features will not work.',
  );
}

export const supabase = createBrowserClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
);
