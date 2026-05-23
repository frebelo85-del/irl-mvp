-- Phase B checks (run in Supabase SQL Editor or `psql`)

-- 1) Missions seed
select count(*) as mission_count
from public.missions
where locale = 'en' and is_active = true;
-- Expect: >= 10

-- 2) RLS on key tables
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','missions','mission_deliveries');

-- 3) Policies
select tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4) Auth bootstrap trigger
select tgname from pg_trigger
where tgrelid = 'auth.users'::regclass
  and tgname = 'on_auth_user_created';
