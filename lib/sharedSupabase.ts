import { createClient } from "@supabase/supabase-js";

// The CelebrateYouHub / proageing-site shared Supabase project — source of
// a user's existing ProAgeing Steps history (docs/PLAN.md §3, §9 Open
// decisions item 5). Deliberately a second, separate client from
// lib/supabase.ts's own (isolated) project.
//
// Values come from .env.example (already public in CelebrateYouHub's
// js/config.js — the anon key only grants what that project's RLS allows,
// scoped to auth.uid(), see docs/PLAN.md §Open decisions item 6).
const SHARED_SUPABASE_URL = process.env.NEXT_PUBLIC_SHARED_SUPABASE_URL!;
const SHARED_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SHARED_SUPABASE_ANON_KEY!;

// A distinct storage key so this client's session never collides with, or
// gets overwritten by, the primary app's own Supabase auth session in the
// same browser (see lib/supabase.ts).
export const sharedSupabase = createClient(SHARED_SUPABASE_URL, SHARED_SUPABASE_ANON_KEY, {
  auth: {
    storageKey: "proageing-shared-auth",
  },
});
