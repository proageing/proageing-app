import "server-only";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Whether this user may read the paid programme text: an active 21-Day or
// 90-Day plan, or an admin (so the programme can be reviewed without buying
// it). This mirrors the gate in app/program/page.tsx, but here it is the
// real lock — the page's own check only decides what to draw, and anything
// the browser can fetch without this check is public.
//
// Uses the service role because it must not depend on the caller's own
// row-level read access, and it decides from the verified user id, never
// from anything the request says about itself.
export async function canReadProgramme(userId: string): Promise<boolean> {
  const admin = getSupabaseAdmin();

  const [{ data: profile }, { data: sub }] = await Promise.all([
    admin.from("profiles").select("is_admin").eq("id", userId).maybeSingle(),
    admin
      .from("subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .eq("status", "active")
      .in("plan", ["21-day", "90-day"])
      .limit(1)
      .maybeSingle(),
  ]);

  return Boolean(profile?.is_admin) || Boolean(sub);
}
