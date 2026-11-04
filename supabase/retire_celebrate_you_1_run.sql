-- RETIRE CELEBRATE YOU from the shared project (xdmamjeqqqsglqiltzvn).
-- DESTRUCTIVE. Already run on 2026-11-04 (kept for the record; do not re-run).
-- Before running it: the Celebrate You data was exported to a zip, and the
-- pre-flight was reviewed. A first attempt rolled back harmlessly because two
-- policies (teams, cohorts) depended on profiles; step 3a drops them first.
--
-- What it does, in the only safe order:
--   1. copies each person's email, name and sign-up date to a private contact table
--   2. removes the trigger that creates a Celebrate You profile for every new login
--      (must go BEFORE the tables, or every future sign-in on the site would error)
--   3. drops Celebrate You's tables and its signup function
-- What it does NOT touch: auth.users (all logins kept), proageing_results (the
-- site's saved check results), or is_admin() (harmless, may be used elsewhere).
--
-- No CASCADE anywhere, and it runs as one transaction. If anything unexpected
-- depends on these objects, Postgres refuses with an error and NOTHING changes.

begin;

-- 1. Keep contact details only (not reflections, feedback or course progress).
create table if not exists public.former_participants (
  email        text primary key,
  full_name    text,
  signed_up_at timestamptz,
  source       text not null default 'celebrate-you'
);
-- RLS on with no policies = readable only with the service-role key, never via the API.
alter table public.former_participants enable row level security;

insert into public.former_participants (email, full_name, signed_up_at)
select p.email, p.full_name, u.created_at
from public.profiles p
join auth.users u on u.id = p.id
where p.email is not null
on conflict (email) do nothing;

-- 2. Drop every trigger on auth.users that runs handle_new_user, whatever it is named.
do $$
declare r record;
begin
  for r in
    select t.tgname
    from pg_trigger t
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace n on n.oid = p.pronamespace
    where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal
      and n.nspname = 'public' and p.proname = 'handle_new_user'
  loop
    execute format('drop trigger %I on auth.users', r.tgname);
  end loop;
end $$;

-- 3a. These two policies live on teams/cohorts but read from profiles, which blocks
--     dropping profiles. They belong to tables we are dropping anyway, so remove them first.
drop policy if exists "teams: select own or admin" on public.teams;
drop policy if exists "cohorts: select own or admin" on public.cohorts;

-- 3b. Drop the tables, children before parents. No CASCADE: a dependency = an error = no change.
drop table if exists public.peer_posts;
drop table if exists public.feedback_queue;
drop table if exists public.submissions;
drop table if exists public.invited_participants;
drop table if exists public.weekly_content;
drop table if exists public.profiles;
drop table if exists public.teams;
drop table if exists public.cohorts;
drop function if exists public.handle_new_user();

-- 4. Check before committing: contacts copied, site results untouched.
select (select count(*) from public.former_participants) as contacts_kept,
       (select count(*) from auth.users)                  as logins_kept,
       (select count(*) from public.proageing_results)    as site_results_kept;

commit;
