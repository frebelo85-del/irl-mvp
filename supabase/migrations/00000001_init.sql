-- IRL MVP: schema, RLS, auth profile bootstrap (docs/PRD.md §4)
-- Note: uses timestamp in filename ordering; aligns with Phase B plan numbering intent.

create extension if not exists "uuid-ossp";

-- Categories alignées MASTER
create type public.mission_category as enum (
  'social','nature','curiosity','adventure','creativity','calm','learning'
);

create type public.frequency_tier as enum ('low','medium');

create type public.delivery_status as enum (
  'scheduled','delivered','opened','accepted','postponed','skipped','completed'
);

create type public.response_action as enum ('accepted','postponed','skipped');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  timezone text not null default 'UTC',
  onboarding_completed boolean not null default false,
  account_linked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  categories mission_category[] not null check (
    categories is not null and coalesce(array_length(categories, 1), 0) >= 2
  ),
  active_hour_start smallint not null check (active_hour_start between 0 and 23),
  active_hour_end smallint not null check (active_hour_end between 0 and 23),
  frequency frequency_tier not null default 'low',
  notifications_enabled boolean not null default true,
  analytics_consent boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  platform text not null check (platform in ('ios','android')),
  last_seen_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  category mission_category not null,
  teaser text not null,
  title text not null,
  body text not null,
  locale text not null default 'en',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.mission_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  mission_id uuid not null references public.missions (id) on delete restrict,
  scheduled_at timestamptz not null,
  delivered_at timestamptz,
  opened_at timestamptz,
  status delivery_status not null default 'scheduled',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_deliveries_user_scheduled on public.mission_deliveries (user_id, scheduled_at desc);
create index idx_deliveries_user_status on public.mission_deliveries (user_id, status);

create table public.mission_responses (
  delivery_id uuid primary key references public.mission_deliveries (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  action response_action not null,
  helpful boolean,
  responded_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  event text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_analytics_user_created on public.analytics_events (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger deliveries_updated_at
before update on public.mission_deliveries
for each row
execute function public.set_updated_at();

-- New auth user → public.profile (anonymous: account_linked_at null)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, timezone, onboarding_completed, account_linked_at)
  values (
    new.id,
    'UTC',
    false,
    case
      when coalesce(new.is_anonymous, false) then null
      else now()
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.push_tokens enable row level security;
alter table public.missions enable row level security;
alter table public.mission_deliveries enable row level security;
alter table public.mission_responses enable row level security;
alter table public.analytics_events enable row level security;

create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);

create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

create policy prefs_self_all on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy tokens_self_all on public.push_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy missions_read on public.missions
  for select to authenticated using (is_active = true);

create policy deliveries_self_all on public.mission_deliveries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy responses_self_all on public.mission_responses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy analytics_self_insert on public.analytics_events
  for insert with check (auth.uid() = user_id);

create policy analytics_self_select on public.analytics_events
  for select using (auth.uid() = user_id);
