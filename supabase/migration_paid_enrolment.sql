-- Require a paid plan to enrol in the 21-Day Programme.
-- Run once in the Supabase SQL Editor for the APP project. Safe to re-run.
--
-- Does not touch existing enrolments or progress; it only stops NEW enrolments
-- by anyone without a paid plan (admins exempt). The Stripe webhook enrols
-- buyers using the service role, which bypasses RLS, so purchases still work.

create or replace function public.has_paid_plan()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = auth.uid()
      and status = 'active'
      and plan in ('21-day', '90-day')
  );
$$;

drop policy if exists "program_enrollments: insert own" on public.program_enrollments;

create policy "program_enrollments: insert own" on public.program_enrollments
  for insert with check (
    user_id = auth.uid()
    and (public.has_paid_plan() or public.is_admin())
  );
