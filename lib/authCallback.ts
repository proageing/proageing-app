import type { SupabaseClient } from "@supabase/supabase-js";

// Manually completes a magic-link sign-in for a specific client, since both
// Supabase clients in this app have detectSessionInUrl disabled (see
// lib/supabase.ts). Each redirect page calls this with the one client the
// link was meant for, so a page never accidentally claims tokens intended
// for the other project.
export async function completeSessionFromUrlHash(
  client: SupabaseClient
): Promise<{ error: string | null }> {
  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(rawHash);

  const errorDescription = params.get("error_description");
  if (errorDescription) {
    return { error: errorDescription };
  }

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) {
    return { error: "No sign-in link found in the URL — it may have expired. Try again." };
  }

  const { error } = await client.auth.setSession({ access_token, refresh_token });

  // Drop the tokens from the URL so they aren't left visible or bookmarkable.
  window.history.replaceState({}, document.title, window.location.pathname);

  return { error: error?.message ?? null };
}
