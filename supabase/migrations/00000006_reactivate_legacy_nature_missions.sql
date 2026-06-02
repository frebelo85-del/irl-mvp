-- Reactivate 2 legacy nature seed missions (kept alongside the 020xxx batch).
-- Source: docs/missions.seed.json

insert into public.missions (id, category, teaser, title, body, locale, is_active)
values
  ('a1f2e3d4-c5b6-4789-a012-345678901103'::uuid, 'nature'::public.mission_category, '30 seconds. No goal. Just look.', 'Mission: notice the outside', 'Go to a window or step outside for 30 seconds. Name one thing you never really noticed before — a sound, a shape, a color.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678901104'::uuid, 'nature'::public.mission_category, 'Touch something alive.', 'Mission: connect with the living world', 'Find a plant, a tree, grass, or a pet. Touch it gently. Take one slow breath while you do.', 'en', true)
on conflict (id) do update set
  category = excluded.category,
  teaser = excluded.teaser,
  title = excluded.title,
  body = excluded.body,
  locale = excluded.locale,
  is_active = excluded.is_active;
