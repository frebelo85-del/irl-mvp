-- Phase Share V1: optional user reflection after mission completion (GDPR export/delete via mission_responses).

alter table public.mission_responses
  add column if not exists reflection_text text;

comment on column public.mission_responses.reflection_text is
  'Optional short note after completing a mission; included in user data export.';

alter table public.mission_responses
  add constraint mission_responses_reflection_length
  check (reflection_text is null or char_length(reflection_text) <= 200);
