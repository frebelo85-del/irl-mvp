-- Upsert 26 curiosity missions (fixed UUIDs). Deactivate legacy curiosity seed rows.
-- Source: docs/missions.seed.json

insert into public.missions (id, category, teaser, title, body, locale, is_active)
values
  ('a1f2e3d4-c5b6-4789-a012-345678030001'::uuid, 'curiosity'::public.mission_category, 'There''s a story hiding in an ordinary object.', 'Mission: object detective', 'Choose one everyday object near you. Study it for two minutes and list three details you had never noticed before. Invent one question about how it came to be there. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030002'::uuid, 'curiosity'::public.mission_category, 'Ask a question you normally leave unasked.', 'Mission: one real question', 'The next time you speak with someone today, ask them about a hobby, skill, or routine they know well. Listen to the answer without changing the subject. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030003'::uuid, 'curiosity'::public.mission_category, 'A sound nearby deserves your attention.', 'Mission: follow a sound', 'Pause for one minute and notice a sound in your surroundings. Trace where it might be coming from and what could be creating it. When your curiosity feels satisfied, stop.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030004'::uuid, 'curiosity'::public.mission_category, 'One sign or label can open a rabbit hole.', 'Mission: read the fine print', 'Find a sign, label, plaque, or notice you usually ignore. Read every word. Notice one detail that changes how you see that place or object. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030005'::uuid, 'curiosity'::public.mission_category, 'Take a different route with your eyes.', 'Mission: look higher', 'Walk a short distance or look out a window. Spend two minutes noticing what is above eye level—roofs, branches, wires, clouds, or architecture. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030006'::uuid, 'curiosity'::public.mission_category, 'Something nearby has changed recently.', 'Mission: spot the difference', 'Look around a familiar room, street, yard, or path. Find one thing that wasn''t there before or has shifted since you last paid attention. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030008'::uuid, 'curiosity'::public.mission_category, 'Count something nobody usually counts.', 'Mission: unusual tally', 'Choose one thing around you—red doors, birds, parked bicycles, fence posts, or something else. Count them for two minutes. When the timer ends, you''re done.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030009'::uuid, 'curiosity'::public.mission_category, 'Your neighborhood has a tiny mystery.', 'Mission: trace a clue', 'Notice an object that seems out of place. Spend a few minutes imagining two possible explanations for how it got there. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030010'::uuid, 'curiosity'::public.mission_category, 'Look for evidence of a hidden process.', 'Mission: behind the scenes', 'Find something being maintained, repaired, grown, cleaned, built, or organized. Observe it closely for a minute. Notice signs of the work behind it. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030011'::uuid, 'curiosity'::public.mission_category, 'One shelf can teach you something.', 'Mission: inspect a shelf', 'Choose a shelf, cupboard, drawer, or storage space. Pick one item and wonder why it was kept. Follow that question for a few minutes, then stop.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030012'::uuid, 'curiosity'::public.mission_category, 'Notice what repeats.', 'Mission: find a pattern', 'Look around your environment and identify a repeating shape, sound, color, or behavior. Spend two minutes tracking where else it appears. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030013'::uuid, 'curiosity'::public.mission_category, 'A place you know has an overlooked corner.', 'Mission: explore the edge', 'Visit a familiar room, yard, hallway, or outdoor spot. Pay attention to the least-noticed corner for three minutes. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030014'::uuid, 'curiosity'::public.mission_category, 'Borrow someone else''s perspective.', 'Mission: ask for a favorite', 'Ask someone to tell you their favorite local place, object, view, or routine. Learn why they chose it. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030015'::uuid, 'curiosity'::public.mission_category, 'Something old still has a secret.', 'Mission: date an object', 'Find an older item in your home or surroundings. Look for clues about when it was made or first used. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030016'::uuid, 'curiosity'::public.mission_category, 'Change one angle. See what appears.', 'Mission: new viewpoint', 'Stand, sit, or crouch somewhere you usually pass through. Spend one minute observing from that different height. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030017'::uuid, 'curiosity'::public.mission_category, 'What happens here when you''re not looking?', 'Mission: imagine the timeline', 'Choose a place nearby. Picture what it looked like five years ago and what it might look like five years from now. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030018'::uuid, 'curiosity'::public.mission_category, 'Read a name and wonder about it.', 'Mission: notice names', 'Look for a street name, building name, product name, or family name. Spend a few minutes guessing the story behind it before moving on. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030021'::uuid, 'curiosity'::public.mission_category, 'Your hands know more than your eyes.', 'Mission: texture survey', 'Carefully touch three different surfaces around you. Compare their textures and notice which details are easiest to miss visually. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030022'::uuid, 'curiosity'::public.mission_category, 'A routine path has a missing detail.', 'Mission: reverse attention', 'Walk a familiar route and look for what you normally ignore rather than what usually catches your eye. Notice three things. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030023'::uuid, 'curiosity'::public.mission_category, 'Look for evidence, not answers.', 'Mission: tiny investigation', 'Choose a mark, track, crack, stain, or worn spot. Spend two minutes imagining what repeated action created it. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030024'::uuid, 'curiosity'::public.mission_category, 'The weather is doing more than you think.', 'Mission: weather clues', 'Step outside or look through a window. Find three signs of today''s weather besides temperature. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030025'::uuid, 'curiosity'::public.mission_category, 'Find the oldest thing you can see.', 'Mission: age hunt', 'Look around your surroundings and choose the object, structure, or tree that seems oldest. Notice the clues that led you there. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030026'::uuid, 'curiosity'::public.mission_category, 'One minute of listening can reveal a map.', 'Mission: sound map', 'Close your eyes for sixty seconds. Identify as many distinct sounds as you can and imagine where each one is coming from. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030028'::uuid, 'curiosity'::public.mission_category, 'Ask about a first time.', 'Mission: first memories', 'Talk with someone and ask about the first time they learned, tried, or experienced something important to them. Listen to the story. That''s enough.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030029'::uuid, 'curiosity'::public.mission_category, 'Choose a direction you rarely notice.', 'Mission: look behind you', 'Turn around and study the space behind where you usually sit, stand, or wait. Spend one minute noticing details you normally miss. Stop after that.', 'en', true),
  ('a1f2e3d4-c5b6-4789-a012-345678030030'::uuid, 'curiosity'::public.mission_category, 'There''s a question hiding in plain sight.', 'Mission: wonder aloud', 'Write down one question about something you encounter today. Don''t answer it yet. Let the question exist for a few minutes, then move on.', 'en', true)
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
  'a1f2e3d4-c5b6-4789-a012-345678901105'::uuid,
  'a1f2e3d4-c5b6-4789-a012-345678901106'::uuid
);
