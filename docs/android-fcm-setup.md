# Android — FCM + push (Dev Build)

Erreur typique sans FCM :

```text
Unable to get Firebase Messaging instance. Did you configure `googleServicesFile`?
Default FirebaseApp is not initialized
```

Package Android IRL : `com.filrebelo.irlmvp`.

---

## 1. Projet Firebase

1. [Firebase Console](https://console.firebase.google.com/) → **Add project** (ex. `irl-mvp`) ou utilise un projet existant.
2. **Add app** → **Android**.
3. **Android package name** : `com.filrebelo.irlmvp` (exactement comme `app.config.ts`).
4. Télécharge **`google-services.json`**.
5. Place le fichier à la **racine du repo** :

```text
IRL/google-services.json
```

(`app.config.ts` pointe déjà vers `./google-services.json`.)

---

## 2. Clé FCM V1 sur EAS (serveur Expo Push)

1. Firebase → **Project settings** → **Service accounts**.
2. **Generate new private key** → enregistre le JSON (secret).
3. Ajoute ce fichier au `.gitignore` (déjà configuré pour `*-firebase-adminsdk-*.json`).

Sur le Mac :

```bash
cd /Users/filiperebelo/IRL
eas credentials
```

- **Android**
- Profil **development** (ou celui utilisé pour ta build)
- **Google Service Account** → **Manage … FCM V1**
- **Upload a new service account key** → sélectionne le JSON téléchargé

---

## 3. Rebuild Android (obligatoire)

`google-services.json` est **compilé dans l’APK** — l’APK actuel ne suffit pas.

```bash
eas build --profile development --platform android
```

Réinstalle le nouvel APK sur le téléphone.

---

## 4. Retester le token

1. `npm start` (Metro + `.env` Supabase).
2. Ouvre l’app → **Inbox** (ou refais onboarding avec notifications ON).
3. Metro : plus d’erreur Firebase ; idéalement pas de `[push] sync: error`.
4. SQL :

```sql
select user_id, platform, left(expo_push_token, 35), last_seen_at
from push_tokens
order by last_seen_at desc
limit 3;
```

---

## 5. Test push Phase F

```bash
export SUPABASE_URL="https://ppikzwbqegheaoowmwjo.supabase.co"
export CRON_SECRET="..."
npm run functions:invoke:schedule
```

Smoke immédiat : `scripts/phase-f-verify.sql` + `npm run functions:invoke:push -- <deliveryId>`.

---

## Liens

- [Expo — FCM credentials](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [Expo — push setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
