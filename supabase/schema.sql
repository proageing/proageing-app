-- ProAgeing 90-Day Premium App — database schema
-- DRAFT: not yet run anywhere. Paste into the SQL Editor of the new,
-- isolated Supabase project once it exists (see docs/PLAN.md §9, Phase 0).
-- Follows the same conventions as CelebrateYouHub's supabase/schema.sql
-- (snake_case, public. prefix, an is_admin() helper, RLS on every table).
--
-- Deliberately does NOT include: video_progress detail, HR dashboard
-- aggregation views, or corporate SSO — those are Phase 2 per the plan.
-- corporate_accounts exists here only as a nullable FK target so profiles
-- doesn't need a schema change later to add it.

-- ============================================================
-- TABLES
-- ============================================================

-- Minimal placeholder for B2B2C — expand in Phase 2 with the HR dashboard
-- (participation, aggregate risk flags, etc. per PLAN.md §4).
create table public.corporate_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  employee_tier text,  -- '50-199' | '200-999' | '1000+', drives per-seat pricing (PLAN.md §5)
  created_at timestamptz not null default now()
);

-- One row per user, extending Supabase's built-in auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  corporate_account_id uuid references public.corporate_accounts (id) on delete set null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- PDPA consent log. Append-only by design — a new consent event is a new
-- row, never an edit to an old one, so there's always an accurate record
-- of what a user agreed to and when (PLAN.md §8).
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_version text not null,  -- matches the exact consent copy version shown at the time
  scope text not null,            -- e.g. 'assessment_data', 'marketing_comms'
  granted_at timestamptz not null default now()
);

-- Mirrors proageing-site's proageing_results shape exactly (same
-- assessment_type values, same entry_data jsonb shape — see PLAN.md §3)
-- so a user's existing history can be copied in as-is via the read-path,
-- not transformed. `source` distinguishes a fresh in-app check-in from an
-- imported row.
create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  assessment_type text not null,  -- one of the 9 ProAgeing Steps types, PLAN.md §3
  entry_data jsonb not null,
  source text not null default 'app',  -- 'app' | 'proageing_site_import'
  created_at timestamptz not null default now()
);

-- program_length_days stays variable (not hardcoded to 90) per the
-- deferred 21-day/8-week decision in PLAN.md §2.
create table public.program_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_length_days int not null default 90,
  started_at date not null default current_date,
  status text not null default 'active',  -- 'active' | 'completed' | 'cancelled'
  created_at timestamptz not null default now()
);

-- One row per enrolled day. video_watched/habit_completed are booleans for
-- MVP — "skip complex analytics" per PLAN.md §9 Phase 1 scope.
create table public.day_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.program_enrollments (id) on delete cascade,
  day_number int not null,
  video_watched boolean not null default false,
  habit_completed boolean not null default false,
  checkin_note text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (enrollment_id, day_number)
);

-- Day 21's "share your story" prompt (PLAN.md testimony collection).
-- Distinct from day_progress.checkin_note: that's a private daily journal
-- entry, this is a structured, multi-field response the user has
-- explicitly been asked whether they're willing to have referenced
-- (anonymised) in marketing. consent_to_share is the source of truth for
-- that — a row existing here is not itself permission to use it; only
-- consent_to_share = true rows should ever be reviewed for that, and even
-- then a human curates/anonymises before anything is published elsewhere.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  enrollment_id uuid not null references public.program_enrollments (id) on delete cascade,
  day_number int not null,  -- 21 today; kept general in case an earlier checkpoint is added later
  improved_most text,  -- 'energy' | 'strength' | 'sleep' | 'confidence' | 'motivation' | 'other'
  improved_most_other text,
  consent_to_share boolean,
  before_concern text,
  change_noticed text,
  recommendation text,
  created_at timestamptz not null default now(),
  unique (enrollment_id, day_number)
);

-- Written by the backend's Stripe webhook handler (service_role, bypasses
-- RLS) — the policies below only need to stop a signed-in user from
-- writing their own row directly through the client.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null,  -- '21-day' | '90-day' — one-time purchases; ongoing
  -- membership (trend history) is free for every signed-in user and isn't
  -- a plan value here.
  status text not null default 'active',  -- mirrors Stripe subscription status values
  current_period_end timestamptz,
  -- Idempotency key for the Stripe webhook. Stripe delivers at least once,
  -- and one-time purchases (mode: 'payment') have no stripe_subscription_id
  -- to dedupe on, so a retry would otherwise insert the same purchase twice.
  stripe_checkout_session_id text unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.corporate_accounts enable row level security;
alter table public.profiles enable row level security;
alter table public.consent_records enable row level security;
alter table public.assessment_results enable row level security;
alter table public.program_enrollments enable row level security;
alter table public.day_progress enable row level security;
alter table public.testimonials enable row level security;
alter table public.subscriptions enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- corporate_accounts: admin only for now (Phase 2 adds HR-role read access
-- scoped to their own corporate_account_id).
create policy "corporate_accounts: admin only" on public.corporate_accounts
  for all using (public.is_admin()) with check (public.is_admin());

-- profiles: same shape as CelebrateYouHub's — own row, or admin.
create policy "profiles: select own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin write" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "profiles: insert own" on public.profiles
  for insert with check (id = auth.uid());

-- Stops a user granting themselves admin or a corporate account via the
-- profiles update endpoint (RLS above only restricts *which row*, not
-- *which columns*). Same defence as CelebrateYouHub's
-- protect_profile_privilege_columns trigger.
create or replace function public.protect_profile_privilege_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.is_admin is distinct from old.is_admin
       or new.corporate_account_id is distinct from old.corporate_account_id then
      raise exception 'Only an admin can change is_admin or corporate_account_id';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_profile_privilege_columns
  before update on public.profiles
  for each row execute procedure public.protect_profile_privilege_columns();

-- consent_records: a user can see and add their own; no update/delete —
-- consent is an append-only log (PLAN.md §8).
create policy "consent_records: select own or admin" on public.consent_records
  for select using (user_id = auth.uid() or public.is_admin());
create policy "consent_records: insert own" on public.consent_records
  for insert with check (user_id = auth.uid());

-- assessment_results: same policy shape as proageing-site's
-- proageing_results (PLAN.md §3, item 6) — select/insert own, no update.
-- Delete is intentionally omitted here (proageing_results allows delete;
-- this app's copy is treated as an immutable progress record instead —
-- revisit if that turns out to be wrong).
create policy "assessment_results: select own or admin" on public.assessment_results
  for select using (user_id = auth.uid() or public.is_admin());
create policy "assessment_results: insert own" on public.assessment_results
  for insert with check (user_id = auth.uid());

-- program_enrollments: own or admin; can update own (e.g. status to 'completed').
create policy "program_enrollments: select own or admin" on public.program_enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy "program_enrollments: insert own" on public.program_enrollments
  for insert with check (user_id = auth.uid());
create policy "program_enrollments: update own" on public.program_enrollments
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "program_enrollments: admin write" on public.program_enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- day_progress: ownership is via the parent enrollment, not a direct user_id column.
create policy "day_progress: select own or admin" on public.day_progress
  for select using (
    enrollment_id in (select id from public.program_enrollments where user_id = auth.uid())
    or public.is_admin()
  );
create policy "day_progress: insert own" on public.day_progress
  for insert with check (
    enrollment_id in (select id from public.program_enrollments where user_id = auth.uid())
  );
create policy "day_progress: update own" on public.day_progress
  for update using (
    enrollment_id in (select id from public.program_enrollments where user_id = auth.uid())
  ) with check (
    enrollment_id in (select id from public.program_enrollments where user_id = auth.uid())
  );

-- testimonials: own or admin, same shape as day_progress but with a
-- direct user_id column (simpler than joining through enrollment, and
-- this is the table an admin will actually query to find shareable
-- stories, so a direct owner column is worth the small duplication).
create policy "testimonials: select own or admin" on public.testimonials
  for select using (user_id = auth.uid() or public.is_admin());
create policy "testimonials: insert own" on public.testimonials
  for insert with check (user_id = auth.uid());
create policy "testimonials: update own" on public.testimonials
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subscriptions: users can only ever read their own; all writes are
-- admin/service_role (the Stripe webhook handler uses service_role, which
-- bypasses RLS entirely — this just stops a client from self-granting one).
create policy "subscriptions: select own or admin" on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());
create policy "subscriptions: admin write" on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

-- Same pattern as CelebrateYouHub: only create the profile once the
-- email is actually confirmed, and keep it idempotent since this fires on
-- every auth.users update, not just the confirming one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  if exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

  insert into public.profiles (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();
