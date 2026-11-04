import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { canReadProgramme } from "@/lib/programAccess";
import { contentForDay } from "@/lib/program21Content";

// Serves one day of the paid 21-Day Challenge text, only to someone who has
// paid (or an admin). The text is deliberately absent from the browser
// bundle; this route is the only way to it.
//
// Same auth shape as app/api/import-legacy: the caller proves who they are
// with their Supabase access token, and the decision is made from that
// verified identity.
export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const {
      data: { user },
      error,
    } = await getSupabaseAdmin().auth.getUser(accessToken);
    if (error || !user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    if (!(await canReadProgramme(user.id))) {
      return NextResponse.json({ error: "A paid plan is required" }, { status: 403 });
    }

    const day = Number(request.nextUrl.searchParams.get("day"));
    if (!Number.isInteger(day) || day < 1 || day > 21) {
      return NextResponse.json({ error: "Invalid day" }, { status: 400 });
    }
    const locale = request.nextUrl.searchParams.get("locale") === "zh" ? "zh" : "en";

    // Per-user and paid: never let a shared cache hold it.
    return NextResponse.json(contentForDay(day, locale), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (err) {
    console.error("Programme day route failed", err);
    return NextResponse.json({ error: "Could not load this day" }, { status: 500 });
  }
}
