import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[TheFitnessDen] Missing Supabase environment variables.\n' +
    'Create a .env.local file with:\n' +
    '  VITE_SUPABASE_URL=https://xxxx.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJ...\n' +
    'Never use the service_role key in frontend code.'
  );
}

// We export an untyped client here intentionally.
// All type safety is enforced at the service layer (authService.ts, etc.)
// via the Profile / Database types in src/types and src/lib/database.types.ts.
// This avoids TypeScript inference resolving to 'never' on .update() calls
// when using the hand-written Database generic.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
