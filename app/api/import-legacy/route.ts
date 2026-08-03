import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { importLegacyResultsFor } from "@/lib/legacyImport";
import { hasSiteSupabaseConfig } from "@/lib/siteSupabaseAdmin";

// Pulls the caller's proageing.org history into their app account.
//
// The caller authenticates with their Supabase access token, same as
// app/api/stripe/checkout — and crucially the email used for matching is
// taken from that verified token, never from the request body. A client
// cannot ask for someone else's history.
export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    // Establish who is asking before anything else, so an invalid token
    // gets the same 401 whether or not the legacy project is configured.
    const {
      data: { user },
      error: userError,
    } = await getSupabaseAdmin().auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    if (!hasSiteSupabaseConfig()) {
      // Not an error the user can act on — the legacy project simply isn't
      // wired up in this environment.
      return NextResponse.json({ imported: 0, skipped: 0, matched: false, configured: false });
    }

    const result = await importLegacyResultsFor(user.id, user.email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ...result, configured: true });
  } catch (err) {
    // Deliberately generic. Failures here are configuration problems, and
    // their messages name environment variables — not something to hand
    // back to an unauthenticated caller.
    console.error("Legacy import route failed", err);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
