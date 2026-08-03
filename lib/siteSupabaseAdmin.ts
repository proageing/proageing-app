import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// The legacy proageing.org Supabase project, read-only.
//
// Server-only and service_role, unlike lib/sharedSupabase.ts's browser
// client: matching a person across the two projects means reading
// auth.users on the site side, which no anon key can do. Nothing here ever
// writes — proageing.org's project is frozen (proageing-admin's README
// calls it read-only), and this module deliberately offers no way to
// change that.
let cached: SupabaseClient | null = null;

export function getSiteSupabaseAdmin(): SupabaseClient {
  if (!cached) {
    const url = process.env.SITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("SITE_SUPABASE_URL or SITE_SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    cached = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}

export function hasSiteSupabaseConfig(): boolean {
  return Boolean(process.env.SITE_SUPABASE_URL && process.env.SITE_SUPABASE_SERVICE_ROLE_KEY);
}
