import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// detectSessionInUrl is off here because this app also runs a second,
// separate Supabase client (lib/sharedSupabase.ts) for the results import
// flow, which lands on its own redirect page after a magic-link click.
// With auto-detection on for both clients, whichever client initializes
// first could grab tokens meant for the other. Each redirect page instead
// explicitly completes the session for the one client it means to sign
// in — see lib/authCallback.ts.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    detectSessionInUrl: false,
  },
});
