# IRL

Companion app (Expo + Supabase) — voir [docs/PRD.md](docs/PRD.md) et [docs/MASTER.md](docs/MASTER.md).

## Prérequis

- Node.js LTS (20+)
- Compte Supabase + **Anonymous Sign-Ins** activés (Phase C)

## Installation

```bash
cp .env.example .env
# Renseigner EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY

npm install
```

## Commandes

```bash
npm start      # Metro / Expo dev server
npm run web    # Navigateur
npm run ios    # Simulateur iOS
npm run android
npm run typecheck
```

## Phase A

Écran d’accueil vérifie les variables d’environnement et appelle `supabase.auth.getSession()`. Aucune migration DB ni auth anonyme automatique pour l’instant — voir Phase B/C du PRD.
