-- Phase I: user-chosen return time for postponed missions

alter table public.mission_deliveries
  add column if not exists postponed_until timestamptz;

comment on column public.mission_deliveries.postponed_until is
  'When set with status postponed, scheduler re-activates and sends push at or after this time.';

create index if not exists idx_deliveries_postponed_until
  on public.mission_deliveries (status, postponed_until)
  where status = 'postponed' and postponed_until is not null;
