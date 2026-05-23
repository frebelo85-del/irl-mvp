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

## Phase D (suite)

À venir : flow onboarding (catégories, horaires, consentement) puis `onboarding_completed = true` depuis l’app.
