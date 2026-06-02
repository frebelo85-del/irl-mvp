-- Upsert 26 nature missions (fixed UUIDs). Deactivate legacy nature seed rows.
-- Source: docs/missions.seed.json

insert into public.missions (id, category, teaser, title, body, locale, is_active)
values
  ('a1f2e3d4-c5b6-4789-a012-345678020001'::uuid, 'nature'::public.mission_category, 'The sky is doing something right now.', 'Mission: look up', 'Step outside or find a window. Spend one minute looking only at the sky and notice three different shades or movements. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020002'::uuid, 'nature'::public.mission_category, 'There''s a tree you pass without seeing.', 'Mission: meet a tree', 'Find the nearest tree, even a tiny city one. Stand near it for 30 seconds and notice the shape of its bark or branches. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020003'::uuid, 'nature'::public.mission_category, 'Open a door. Hear the city differently.', 'Mission: sound check', 'Pause outside for two minutes without music or conversation. Count five separate sounds you can hear at the same time. You can head back in after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020004'::uuid, 'nature'::public.mission_category, 'The weather has a texture today.', 'Mission: feel the air', 'Step outside for one minute — even just the sidewalk outside your building. Pay attention to the air on your face and hands. Warm, damp, sharp, heavy — describe it silently to yourself. Stop there.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020005'::uuid, 'nature'::public.mission_category, 'Find one living thing you usually ignore.', 'Mission: tiny life', 'Notice one small living thing nearby — moss, weeds, insects, pigeons, anything. Watch it closely for 60 seconds without taking a photo. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020006'::uuid, 'nature'::public.mission_category, 'Walk slower for exactly one block.', 'Mission: slower route', 'During your next walk, slow your pace for one block. Notice what changes when you stop rushing past the street around you. Stop after that block.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020007'::uuid, 'nature'::public.mission_category, 'There''s movement above you right now.', 'Mission: cloud watch', 'Look at the clouds for two minutes, even if there are only a few. Follow their direction and speed without doing anything else. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020008'::uuid, 'nature'::public.mission_category, 'Borrow five minutes from the evening light.', 'Mission: sunset pause', 'If the timing works today, step outside near sunset. Watch the light change on buildings, pavement, or faces for five quiet minutes. Head back in whenever you''re ready.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020009'::uuid, 'nature'::public.mission_category, 'The ground under you has details.', 'Mission: pavement study', 'Walk slowly for two minutes while looking down instead of ahead. Notice cracks, leaves, reflections, or patterns in the ground. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020011'::uuid, 'nature'::public.mission_category, 'Notice what survives in your neighborhood.', 'Mission: urban green', 'Find one patch of green nearby — a planter, balcony vine, park edge, anything. Spend a minute looking at how it fits into the street around it. Stop there.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020013'::uuid, 'nature'::public.mission_category, 'Find the quietest outdoor spot nearby.', 'Mission: quiet corner', 'Walk until you find a slightly calmer outdoor spot — a bench, side street, courtyard, or corner. Stay there for three minutes and let the street noise settle around you. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020014'::uuid, 'nature'::public.mission_category, 'Something outside is reflecting light.', 'Mission: reflections', 'Look for reflections outdoors — puddles, windows, metal, sunglasses, anything. Spend two minutes noticing how light changes surfaces. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020015'::uuid, 'nature'::public.mission_category, 'Night air feels different.', 'Mission: step into night', 'Go outside after dark for five minutes if you can. Notice the sounds, temperature, and pace of the street at night compared to daytime. Head back in after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020016'::uuid, 'nature'::public.mission_category, 'Watch wind without looking at the wind.', 'Mission: moving things', 'Find something the wind is affecting — leaves, clothes, flags, hair, water. Watch the movement for one minute. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020017'::uuid, 'nature'::public.mission_category, 'Find one natural color today.', 'Mission: color search', 'Choose one color before stepping outside. Spend five minutes spotting that color in plants, sky, stone, water, or light around you. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020018'::uuid, 'nature'::public.mission_category, 'There are birds somewhere nearby.', 'Mission: listen for birds', 'Open a window or go outside for two minutes. Listen carefully for bird sounds hidden under the rest of the city noise. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020019'::uuid, 'nature'::public.mission_category, 'Sunlight lands differently every hour.', 'Mission: follow the light', 'Notice one patch of sunlight indoors or outside. Watch how it shifts or changes shape for a minute before moving on. Stop there.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020020'::uuid, 'nature'::public.mission_category, 'Find water, even a tiny bit.', 'Mission: water nearby', 'Look for water around you — a fountain, puddle, river, rain gutter, coffee steam, anything. Spend one minute paying attention to how it moves. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020021'::uuid, 'nature'::public.mission_category, 'Take the slightly greener path.', 'Mission: detour through green', 'On your next short walk, choose the route with more trees or open sky, even if it''s only one extra minute. Notice how the space feels different. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020022'::uuid, 'nature'::public.mission_category, 'Stand still outside for longer than usual.', 'Mission: pause outdoors', 'Find a place outside to stand still for three minutes. Let people, bikes, clouds, and sounds move around you while you stay put. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020023'::uuid, 'nature'::public.mission_category, 'Morning air has its own personality.', 'Mission: early air', 'If you''re awake early enough, step outside for two minutes before the day fully starts. Notice what the street sounds like before it fills up. Head back in after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020024'::uuid, 'nature'::public.mission_category, 'Look for nature in the wrong places.', 'Mission: unexpected green', 'Find one natural thing growing or existing where it probably wasn''t planned to — cracks, walls, rooftops, fences. Give it a full minute of attention. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020025'::uuid, 'nature'::public.mission_category, 'The temperature changes block by block.', 'Mission: temperature map', 'During a short walk, notice where the air gets cooler, warmer, shaded, or windy. Pay attention for five minutes, then move on with your day.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020026'::uuid, 'nature'::public.mission_category, 'Touch something natural today.', 'Mission: texture check', 'Touch bark, stone, grass, leaves, or even rough concrete outside. Spend 30 seconds noticing texture instead of rushing past it. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020029'::uuid, 'nature'::public.mission_category, 'Notice shadows instead of objects.', 'Mission: shadow watch', 'Spend two minutes paying attention only to shadows outdoors. Watch how they stretch, overlap, or move as people and light shift around you. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678020030'::uuid, 'nature'::public.mission_category, 'There''s weather happening even on ordinary days.', 'Mission: today''s atmosphere', 'Step outside for one minute. Notice whether today feels heavy, bright, soft, restless, or clear — in the air, the light, the pace around you. Stop there.', 'en', true)
on conflict (id) do update set
  category = excluded.category,
  teaser = excluded.teaser,
  title = excluded.title,
  body = excluded.body,
  locale = excluded.locale,
  is_active = excluded.is_active;

update public.missions
set is_active = false
where id in (
  'a1f2e3d4-c5b6-4789-a012-345678901103'::uuid,
  'a1f2e3d4-c5b6-4789-a012-345678901104'::uuid
);
