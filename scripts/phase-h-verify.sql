-- Phase H — vérifications manuelles (SQL Editor Supabase)
-- Remplacer <uuid> par l'id utilisateur de test.

-- 1. Stats : missions completed par catégorie
select m.category, count(*) as completed_count
from mission_deliveries d
join missions m on m.id = d.mission_id
where d.user_id = '<uuid>'
  and d.status = 'completed'
group by m.category
order by completed_count desc;

-- 2. Total completed + in progress
select
  count(*) filter (where status = 'completed') as completed,
  count(*) filter (where status = 'accepted') as in_progress
from mission_deliveries
where user_id = '<uuid>';

-- 3. Preferences (Settings)
select categories, active_hour_start, active_hour_end, frequency,
       notifications_enabled, analytics_consent
from user_preferences
where user_id = '<uuid>';

-- 4. Account link status
select id, account_linked_at, onboarding_completed
from profiles
where id = '<uuid>';

-- Checklist app H1 :
-- [ ] Onglet Stats : totaux + par catégorie
-- [ ] Settings : save categories / hours / frequency
-- [ ] Toggle notifications + analytics
-- [ ] Export my data → Share sheet JSON
-- [ ] Delete account (compte test) → nouvelle session

-- Checklist H2 :
-- [ ] Save progress Apple (iOS) → account_linked_at set
-- [ ] Restore on 2e device → même user_id, inbox/stats
