/**
 * Browser Supabase Client — Admin Portal
 * Same pattern as apps/web but for the admin app.
 * R22 §2.2
 */
import { createBrowserClient } from '@viyo/shared';

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
