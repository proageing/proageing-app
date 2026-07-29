import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-only — never import this from a "use client" file. Uses the
// service_role key, which bypasses RLS entirely (supabase/schema.sql
// deliberately restricts `subscriptions` writes to service_role, since only
// the Stripe webhook handler should ever write that table).
//
// Lazily constructed for the same reason as lib/stripe.ts: SUPABASE_SERVICE_
// ROLE_KEY won't exist until the Supabase project settings are pulled
// (docs/PLAN.md §9), and `next build` must not fail before then.
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!cached) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
    }
    cached = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return cached;
}
