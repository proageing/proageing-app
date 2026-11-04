-- PRE-FLIGHT for retiring Celebrate You. READ-ONLY: changes nothing.
-- Run in the Supabase SQL Editor of the SHARED project (xdmamjeqqqsglqiltzvn),
-- then send me the results of all four tabs. They are table/function names
-- only -- no personal data -- so they are safe to paste into chat.

-- 1. Every trigger on auth.users and the function it calls.
--    I expect exactly one: handle_new_user. Anything else I need to see.
select t.tgname as trigger_name, n.nspname||'.'||p.proname as calls_function
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
join pg_namespace n on n.oid = p.pronamespace
where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal;

-- 2. Policies (any table) that lean on Celebrate You objects. If proageing_results
--    shows up here, dropping those objects could break the site's check saving.
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and (coalesce(qual,'') || ' ' || coalesce(with_check,'')) ~* '(profiles|is_admin|cohort|team|submission)'
order by tablename, policyname;

-- 3. Every function in the public schema.
select p.proname as function_name
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' order by 1;

-- 4. Every table in the public schema, with row counts, so nothing is a surprise.
select relname as table_name, n_live_tup as approx_rows
from pg_stat_user_tables where schemaname = 'public' order by 1;
