# IRL

Companion app (Expo + Supabase) — voir [docs/PRD.md](docs/PRD.md) et [docs/MASTER.md](docs/MASTER.md).

## Prérequis

- Node.js LTS (20+)
- Compte Supabase + **Anonymous Sign-Ins** activés (pour `npm run db:verify` et Phase C)

## Installation

```bash
cp .env.example .env
# Renseigner EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY

npm install
```

## Base de données (Supabase CLI)

Prérequis : [Supabase CLI](https://supabase.com/docs/guides/cli) installé et `supabase login`.

```bash
# Lier le projet cloud (ref = segment d’URL dashboard …/project/<ref>)
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations (schéma + seed missions)
supabase db push

# Régénérer le seed SQL depuis docs/missions.seed.json
npm run db:seed

# Vérifier RLS + 10 missions + trigger profil (auth anonyme)
npm run db:verify
```

Requêtes SQL manuelles : [scripts/phase-b-verify.sql](scripts/phase-b-verify.sql).

## Phase B

Migrations dans `supabase/migrations/` (schéma PRD §4 + seed missions). Après `supabase db push`, `npm run db:verify` doit afficher 10 missions et une ligne `profiles` pour un user anonyme de test.

## Commandes

```bash
npm start      # Metro / Expo dev server
npm run web    # Navigateur
npm run ios    # Simulateur iOS
npm run android
npm run typecheck
npm run db:seed
npm run db:verify
```

## Phase C

Au premier lancement, l’app appelle **`signInAnonymously`** (invisible pour l’utilisateur), restaure la session depuis SecureStore/localStorage puis redirige :

- **`/(onboarding)`** si `profiles.onboarding_completed = false`
- **`/(main)/inbox`** si `onboarding_completed = true`

Relancer l’app **sans réinstaller** : même utilisateur anon (persisté localement).

**Test manuel** : dans le SQL Editor Supabase, passe `profiles.onboarding_completed` à `true` pour ton user — redémarrer l’app doit envoyer vers l’écran inbox stub.

## Phase D

Flow onboarding en 3 écrans : **categories** → **hours** → **consent**. À la fin, l’app écrit :

- une ligne dans `user_preferences` (catégories, fenêtre active, fréquence, consentements)
- `profiles.timezone` (IANA device) + `profiles.onboarding_completed = true`
- éventuellement `analytics_events` si analytics activé

Redirection vers **`/(main)/inbox`**. Relancer l’app saute l’onboarding.

**Test manuel** (nouvel install ou storage vidé) :

1. Choisir ≥ 2 catégories → horaires → consent → **Get started**
2. Vérifier en SQL :

```sql
select * from user_preferences where user_id = '<uuid>';
select timezone, onboarding_completed from profiles where id = '<uuid>';
```

**Push token** : enregistré en **Phase E** si notifications activées (Dev Build + `EXPO_PUBLIC_EAS_PROJECT_ID`).

## Phase E

Après onboarding (si **notifications activées**), l’app demande la permission OS, récupère un **Expo Push Token** et l’upsert dans `push_tokens`.

**Prérequis push réel :**

- `EXPO_PUBLIC_EAS_PROJECT_ID` dans `.env` (UUID projet Expo / EAS)
- **EAS Dev Build** sur device physique (`eas build --profile development`) — Expo Go et simulateur ne garantissent pas un token projet
- Certificats APNs (iOS) / FCM (Android) configurés côté EAS

```bash
# Une fois le projet Expo lié
eas build --profile development --platform ios   # ou android
```

**Flow** : consent (notifications ON) → permission popup → token → row `push_tokens` → inbox. Relancer l’app (stack main) resynchronise le token et met à jour `last_seen_at`.

**Test manuel** :

```sql
select user_id, platform, left(expo_push_token, 20) as token_preview, last_seen_at
from push_tokens where user_id = '<uuid>';
```

Si permission OS refusée : inbox OK, `user_preferences.notifications_enabled` repasse à `false`.

**Web / simulateur** : skip silencieux, pas de crash.

## Phase F (suite)

À venir : Edge Functions `schedule-deliveries` + `send-push` + cron pour envoyer les premières push.
