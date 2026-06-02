-- Phase G — vérifications manuelles (SQL Editor Supabase)
-- Remplacer <uuid> par l'id utilisateur de test.

-- 1. Deliveries + missions (inbox)
select
  d.id as delivery_id,
  d.mission_id,
  d.status,
  d.scheduled_at,
  d.delivered_at,
  d.opened_at,
  m.teaser,
  m.title
from mission_deliveries d
join missions m on m.id = d.mission_id
where d.user_id = '<uuid>'
order by d.scheduled_at desc
limit 20;

-- 2. Réponses utilisateur
select
  r.delivery_id,
  r.action,
  r.helpful,
  r.responded_at,
  r.completed_at,
  d.status as delivery_status
from mission_responses r
join mission_deliveries d on d.id = r.delivery_id
where r.user_id = '<uuid>'
order by r.responded_at desc
limit 20;

-- 3. Analytics mission (si analytics_consent = true)
select event, payload, created_at
from analytics_events
where user_id = '<uuid>'
  and event like 'mission_%'
   or event like 'feedback_%'
order by created_at desc
limit 30;

-- 4. Smoke : delivery prête pour test inbox (après send-push ou insert)
-- insert into mission_deliveries (user_id, mission_id, scheduled_at, status)
-- values (
--   '<uuid>',
--   (select id from missions where is_active and locale = 'en' limit 1),
--   now() - interval '1 minute',
--   'delivered'
-- )
-- returning id;

-- Checklist app (Dev Build) :
-- [ ] Inbox liste au moins une delivery
-- [ ] Tap → status opened + opened_at
-- [ ] Accept → I did it → completed → feedback helpful
-- [ ] Tap push → deep link irl://mission/...?deliveryId=...
-- [ ] Later / Skip → status terminal, retour inbox
