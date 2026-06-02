-- Phase F — vérifications manuelles (SQL Editor Supabase)
-- Remplacer <uuid> par l'id utilisateur de test.

-- 1. Utilisateur éligible au scheduler
select
  p.id,
  p.timezone,
  p.onboarding_completed,
  up.notifications_enabled,
  up.frequency,
  up.active_hour_start,
  up.active_hour_end,
  up.categories,
  count(pt.id) as push_token_count
from profiles p
join user_preferences up on up.user_id = p.id
left join push_tokens pt on pt.user_id = p.id
where p.id = '<uuid>'
group by p.id, up.user_id;

-- 2. Deliveries récentes
select id, mission_id, scheduled_at, delivered_at, status, created_at
from mission_deliveries
where user_id = '<uuid>'
order by created_at desc
limit 10;

-- 3. Smoke send-push : insérer une delivery passée (remplacer mission_id par un id actif)
-- insert into mission_deliveries (user_id, mission_id, scheduled_at, status)
-- values (
--   '<uuid>',
--   (select id from missions where is_active and locale = 'en' limit 1),
--   now() - interval '1 minute',
--   'scheduled'
-- )
-- returning id;

-- 4. Préparer schedule-deliveries (fenêtre incluant l'heure locale actuelle, 0 delivery 7j)
-- update user_preferences
-- set active_hour_start = 0, active_hour_end = 23
-- where user_id = '<uuid>';
