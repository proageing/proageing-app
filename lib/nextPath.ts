// Where to send someone after sign-in, when they were trying to reach a
// specific page and got bounced to /signin.
//
// The destination is carried in localStorage rather than on the magic-link
// redirect URL. Supabase only redirects to URLs on its configured
// allow-list, so appending a query string to emailRedirectTo risks the
// link being rejected outright — a broken sign-in is a far worse failure
// than landing on the dashboard. The trade-off is that opening the link on
// a different device than the one that requested it falls back to the
// default, which is the right way round.
const KEY = "proage-post-signin-path";

const DEFAULT_PATH = "/dashboard";

// Only ever a path on this app. Anything protocol-relative ("//evil.com"),
// absolute, or backslash-escaped is rejected — otherwise this is an open
// redirect wearing a helpful hat.
export function isSafeNextPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  return true;
}

export function rememberNextPath(path: string | null | undefined) {
  if (!isSafeNextPath(path)) return;
  try {
    window.localStorage.setItem(KEY, path);
  } catch {
    // Storage unavailable — the user lands on the default instead.
  }
}

// Reads and clears in one go: a remembered destination is used once, so a
// later ordinary sign-in doesn't get redirected somewhere unexpected.
export function takeNextPath(): string {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(KEY);
    window.localStorage.removeItem(KEY);
  } catch {
    return DEFAULT_PATH;
  }
  return isSafeNextPath(stored) ? stored : DEFAULT_PATH;
}

// The ?next= a page adds when bouncing an anonymous visitor to /signin.
export function signInHrefFor(path: string): string {
  return `/signin?next=${encodeURIComponent(path)}`;
}
