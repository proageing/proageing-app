import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PAGE_SIZE = 200;
const MAX_PAGES = 50;

// Server-only. Resolves the app account a guest purchase belongs to.
//
// Guest checkout inverts the old assumption that the buyer already has an
// account: Stripe collects the email during payment, and the account only
// exists afterwards. This has to be safe to call twice, because Stripe
// delivers webhooks at least once.
//
// Create-first rather than look-up-first: the common case is a genuinely
// new buyer, and createUser is O(1) where the paginated scan is O(users).
// The scan only runs when the address is already taken.
export async function findOrCreateUserIdByEmail(rawEmail: string): Promise<string> {
  const email = rawEmail.trim().toLowerCase();
  if (!email) throw new Error("findOrCreateUserIdByEmail: empty email");

  const admin = getSupabaseAdmin();

  // email_confirm marks the address usable without a separate confirmation
  // step. It does not grant access on its own — sign-in is magic-link only,
  // so whoever paid still has to hold the inbox to get in.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (!createError && created.user) return created.user.id;

  const existingId = await findUserIdByEmail(email);
  if (existingId) return existingId;

  throw new Error(`findOrCreateUserIdByEmail: could not create or find ${email}: ${createError?.message ?? "unknown"}`);
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (error) throw new Error(`auth.listUsers: ${error.message}`);

    for (const user of data.users) {
      if (user.email?.toLowerCase() === email) return user.id;
    }
    if (data.users.length < PAGE_SIZE) break;
  }
  return null;
}
