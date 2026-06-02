# Alica

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

Redirection vers **`/(main)/inbox`**. Une **première mission** est créée tout de suite (Edge Function `welcome-delivery`) — visible dans l’inbox sans attendre le cron `schedule-deliveries`. Si les notifications sont activées et le push token est enregistré, une push teaser part aussi.

Relancer l’app saute l’onboarding.

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

### Test push iPhone — **à faire** (bloqué sans Apple Developer)

> **Statut :** infra push (Phase E code + Phase F Edge/cron) OK en remote ; **validation sur iPhone physique non faite** — pas de Dev Build ni de ligne `push_tokens` tant qu’il n’y a pas de compte Apple Developer + build EAS.

Checklist quand le compte Apple est actif :

- [ ] Compte [Apple Developer Program](https://developer.apple.com/programs/) (99 USD/an)
- [ ] `eas device:create` + `eas build --profile development --platform ios`
- [ ] APNs : laisser EAS créer la **Push Notifications key** (`eas credentials` → iOS → Push)
- [ ] Onboarding sur iPhone → `push_tokens` rempli en SQL
- [ ] Smoke `npm run functions:invoke:push -- <deliveryId>` → notification reçue
- [ ] `npm run functions:invoke:schedule` → `processed >= 1`

Guide pas à pas : **[docs/apple-developer-eas-ios.md](docs/apple-developer-eas-ios.md)**.

Alternative sans Apple : Dev Build **Android** (`eas build --profile development --platform android`) pour valider push avant iPhone. Si Metro affiche **Firebase / googleServicesFile** : suivre **[docs/android-fcm-setup.md](docs/android-fcm-setup.md)** (`google-services.json` + FCM V1 sur EAS + **rebuild** APK).

## Phase F

Scheduler server-side : Edge Functions **`schedule-deliveries`** (cron horaire) et **`send-push`** (Expo Push API).

### Prérequis

- Phases B–E OK (migrations, onboarding, `push_tokens` sur **device physique** Dev Build)
- Secrets Supabase (Edge Functions → **Secrets**) :

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | URL projet (souvent auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role — **jamais** dans l’app |
| `CRON_SECRET` | Secret partagé cron + appels `send-push` |
| `EXPO_ACCESS_TOKEN` | Optionnel si requis par ton projet Expo |

### Déploiement

```bash
supabase link --project-ref YOUR_PROJECT_REF

# Définir les secrets (une fois) — garde la même valeur pour le cron Dashboard
supabase secrets set CRON_SECRET="$(openssl rand -hex 32)"
# supabase secrets set EXPO_ACCESS_TOKEN=...   # si besoin

supabase functions deploy schedule-deliveries --no-verify-jwt
supabase functions deploy welcome-delivery
supabase functions deploy send-push --no-verify-jwt
```

### Cron (toutes les heures)

Dashboard Supabase → **Edge Functions → Schedules** :

- Function : `schedule-deliveries`
- Schedule : `0 * * * *`
- HTTP header : `Authorization: Bearer <CRON_SECRET>`

### Tests unitaires (logique scheduler)

```bash
npm run test:scheduler
```

### Invocation manuelle

```bash
export SUPABASE_URL="https://YOUR_REF.supabase.co"
export CRON_SECRET="your-secret"

npm run functions:invoke:schedule
# Smoke push pour une delivery existante :
npm run functions:invoke:push -- <delivery-uuid>
```

Requêtes SQL : [scripts/phase-f-verify.sql](scripts/phase-f-verify.sql).

### Test manuel bout-en-bout

1. Utilisateur avec onboarding terminé, notifications ON, ligne `push_tokens`.
2. **Smoke `send-push`** : insérer une `mission_deliveries` `scheduled` avec `scheduled_at` dans le passé (voir SQL commenté dans `phase-f-verify.sql`) → `npm run functions:invoke:push -- <id>` → notification reçue, `status = delivered`.
3. **Scheduler** : élargir fenêtre active si besoin, 0 delivery sur 7j → `npm run functions:invoke:schedule` → vérifier INSERT ; push immédiate si `scheduled_at <= now()`, sinon attendre le créneau + cron ou rappeler `send-push`.

**Note :** le deep link `irl://mission/...` ouvre la mission en **Phase G** ; la push Phase F affiche le **teaser** uniquement.

### Test push — **à faire**

Serveur + cron : OK (`functions:invoke:schedule` → 200). Il reste le test **device** :

- iPhone : voir checklist **[docs/apple-developer-eas-ios.md](docs/apple-developer-eas-ios.md)** (Apple Developer requis).
- Android : Dev Build possible sans compte Apple.

Sans `push_tokens` sur un device réel, le scheduler renvoie `processed: 0` (comportement normal).

## Phase G

Boucle UX mission : **Inbox** → **Mission** → Accept / Later / Skip → **I did it** → feedback 👍/👎. Deep link depuis push (`irl://mission/<missionId>?deliveryId=<uuid>`).

### Prérequis

- Phases B–F OK (deliveries en base ; push testée sur device si test notification)
- Session anonyme + onboarding terminé

### Fichiers clés

| Zone | Fichiers |
|------|----------|
| Données | `src/lib/deliveries.ts`, `src/lib/analytics.ts`, `src/types/mission.ts` |
| UI | `app/(main)/inbox.tsx`, `app/mission/[id].tsx` |
| Deep link | `src/hooks/useMissionNotificationLink.ts`, `src/lib/mission-link.ts` |

### Test manuel bout-en-bout

1. Avoir au moins une `mission_deliveries` (`delivered` ou `scheduled`) — voir [scripts/phase-f-verify.sql](scripts/phase-f-verify.sql) ou `npm run functions:invoke:schedule` + `invoke:push`.
2. Ouvrir l’app → **Inbox** : la mission apparaît.
3. Tap mission → statut `opened`, corps complet (title + body).
4. **Accept** → **I did it** → feedback helpful → retour inbox.
5. Autre delivery : **Later** ou **Skip** → statut terminal, pas de « I did it ».
6. Tap notification push → même écran mission (deep link).

Requêtes SQL : [scripts/phase-g-verify.sql](scripts/phase-g-verify.sql).

### Analytics (opt-in)

Si `analytics_consent` : `mission_opened`, `mission_accepted`, `mission_postponed`, `mission_skipped`, `mission_completed`, `feedback_helpful_yes` / `feedback_helpful_no`.

## Phase I — Later avec date/heure

Au tap **Later**, l’utilisateur choisit quand être re-nudgé (min. 30 min, max. 30 jours). La delivery passe en `postponed` avec `postponed_until`.

### Migration

Appliquer sur Supabase :

```bash
# SQL Editor ou supabase db push
# supabase/migrations/00000003_postponed_until.sql
```

### Re-livraison

Le cron horaire `schedule-deliveries` réactive les deliveries `postponed` dont `postponed_until <= now()` → `scheduled` + `send-push`. En pratique la push peut arriver jusqu’à ~1 h après l’heure choisie (granularité cron).

Test manuel rapide : reporter à une heure passée en SQL puis `npm run functions:invoke:schedule`.

**Dev Build** : après ajout du DateTimePicker, refaire un build EAS si le picker natif ne s’affiche pas en JS-only reload.

**Reprise anticipée** : missions **Set aside** ou **Skipped** → ouvrir depuis l’inbox → **Pick up now** → statut `opened`, Accept / Later / Skip à nouveau (`postponed_until` effacé, pas de double nudge cron).

## Phase H

Navigation **Inbox | Stats | Settings** ; GDPR ; liaison compte (H2).

### H1 — Stats, Settings, GDPR

**Écrans :** `app/(main)/stats.tsx`, `app/(main)/settings.tsx`, tabs dans `app/(main)/_layout.tsx`.

**Edge Functions** (JWT utilisateur — `verify_jwt` par défaut) :

```bash
supabase functions deploy user-data-export
supabase functions deploy delete-account
```

Secrets Edge : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (admin pour delete).

**Tests H1 :** [scripts/phase-h-verify.sql](scripts/phase-h-verify.sql)

| Action | Attendu |
|--------|---------|
| Stats | Total completed + par catégorie |
| Settings | Save prefs ; toggles notifs / analytics |
| Export | Share sheet avec JSON |
| Delete | Compte supprimé ; nouvelle session anonyme |

### H2 — Save progress / Restore

**Prérequis Supabase Dashboard :** Auth → Apple + Google activés ; redirect URLs projet.

**`.env` :**

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=   # Google Cloud OAuth Web client
```

**Code :** `src/lib/auth-link.ts` — `linkWithApple` / `linkWithGoogle` ; `restoreWithApple` / `restoreWithGoogle`.

**iOS :** Apple Sign In capability (EAS gère souvent via plugin) — **nouveau Dev Build** après pull.

**Test :** link sur device A → `profiles.account_linked_at` renseigné ; restore sur device B → même `user_id`, inbox/stats.

## Phase Share (V1)

Après **I did it** : note optionnelle (≤200 car.) → preview carte → **Share** (share sheet iOS/Android) ou **Not now** → feedback 👍/👎.

- Photo optionnelle (galerie, collage sur la carte) — **pas d’upload serveur**
- `mission_responses.reflection_text` — migration `00000012_reflection_text.sql` → `supabase db push`
- Analytics opt-in : `mission_shared`
- **Nouveau Dev Build** requis après install (`expo-image-picker`, `react-native-view-shot`)

**Test :** compléter une mission → ajouter une phrase → Share → vérifier image dans Instagram/Messages ; export GDPR contient `reflection_text`.
