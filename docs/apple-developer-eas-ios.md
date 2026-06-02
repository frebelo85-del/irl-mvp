# Apple Developer + Dev Build iOS + APNs (EAS)

Guide pour débloquer les **push réelles sur iPhone** pour IRL (Phases E–F).  
Bundle ID du projet : `com.filrebelo.irlmvp` — EAS project : `8e6ab3d4-e205-4d94-b9dd-89e3cdd87862`.

---

## Pourquoi c’est nécessaire

| Environnement | Push + `push_tokens` |
|---------------|----------------------|
| Expo Go | Non fiable pour ce projet |
| Simulateur iOS | Pas de push distante réelle |
| **Dev Build sur iPhone** | Oui — nécessite **Apple Developer Program** |

Sans compte Apple payant, EAS ne peut pas signer l’app ni créer la **Apple Push Notifications key** (APNs).

---

## Étape 1 — Créer le compte Apple Developer

1. Va sur [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/).
2. Connecte-toi avec ton **Apple ID** (celui de ton iPhone, de préférence).
3. Active la **validation en deux facteurs** sur cet Apple ID si ce n’est pas déjà fait.
4. Choisis le type d’inscription :
   - **Individual** — le plus simple (ton nom, compte perso).
   - **Organization** — si tu as une société (D-U-N-S, documents supplémentaires).
5. Paie **99 USD / an** (facturation Apple).
6. Attends l’**e-mail d’activation** (souvent quelques minutes à 48 h).

Tu sais que c’est prêt quand tu peux ouvrir [developer.apple.com/account](https://developer.apple.com/account/) et voir **Certificates, Identifiers & Profiles**.

---

## Étape 2 — Prérequis locaux (Mac)

```bash
# CLI EAS (si pas déjà installé)
npm install -g eas-cli

# Connexion Expo (compte qui possède le projet irl-mvp)
eas login

# Depuis la racine du repo
cd /chemin/vers/IRL
```

Vérifie que `.env` contient au minimum :

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_EAS_PROJECT_ID=8e6ab3d4-e205-4d94-b9dd-89e3cdd87862
```

---

## Étape 3 — Enregistrer ton iPhone (distribution internal)

Un Dev Build **internal** ne s’installe que sur des appareils enregistrés.

```bash
eas device:create
```

- Ouvre le lien sur l’iPhone → installe le profil → l’UDID est enregistré.
- Ou connecte l’iPhone au Mac et laisse EAS le détecter.

---

## Étape 4 — Première build iOS (EAS crée APNs + signing)

```bash
eas build --profile development --platform ios
```

Pendant la build, EAS te demandera en général :

1. **Se connecter à Apple** (Apple ID du Developer Program).
2. **Créer / réutiliser** :
   - Distribution certificate (dev)
   - Provisioning profile (development, avec ton iPhone)
   - **Apple Push Notifications key** ← c’est l’équivalent « certificats APNs » côté Expo

Réponds **Yes** quand EAS propose de gérer les credentials automatiquement (**managed credentials**).

> Tu n’as en principe **pas** besoin de créer manuellement un certificat APNs dans le portail Apple : EAS génère une **Push Key** (.p8) et l’associe au projet Expo.

### Si la build échoue ou tu veux forcer la config push

```bash
eas credentials
```

Puis :

- **iOS** → **Push Notifications: Manage your Apple Push Notifications Key** → **Set up a new key** (ou utiliser une existante).

Documentation : [Using automatically managed credentials](https://docs.expo.dev/app-signing/managed-credentials/).

---

## Étape 5 — Installer le Dev Build sur l’iPhone

1. Quand `eas build` finit, ouvre le **lien QR / install** (page expo.dev → Builds).
2. Installe l’app sur l’iPhone enregistré (étape 3).
3. Lance Metro sur le Mac :

```bash
npm start
```

4. Ouvre l’app Dev Build → elle se connecte au bundler (comme Expo, mais c’est **ton** binaire).

---

## Étape 6 — Enregistrer le push token (Phase E)

1. Onboarding avec **notifications ON**.
2. Accepte la popup iOS **Autoriser les notifications**.
3. Arrive sur l’**Inbox** (écran principal).

Vérifie en SQL :

```sql
select user_id, platform, left(expo_push_token, 30) as token_preview, last_seen_at
from push_tokens
where user_id = '<ton-user-uuid>';
```

Tu dois voir `ExponentPushToken[...]`.

---

## Étape 7 — Test push (Phase F — à faire)

Voir [scripts/phase-f-verify.sql](../scripts/phase-f-verify.sql) et [README.md](../README.md) section Phase F.

**Smoke rapide :**

```bash
export SUPABASE_URL="https://ppikzwbqegheaoowmwjo.supabase.co"
export CRON_SECRET="..."   # 1Password

# Après INSERT delivery scheduled dans le passé :
npm run functions:invoke:push -- <delivery-uuid>
```

Ou outil Expo : [expo.dev/notifications](https://expo.dev/notifications) avec le token copié depuis les logs / SQL.

**Scheduler :**

```bash
npm run functions:invoke:schedule
```

Attendu quand éligible : `"processed": 1`, `"scheduled": 1` (push peut être plus tard selon la fenêtre horaire).

---

## Dépannage

| Problème | Piste |
|----------|--------|
| Build iOS refuse Apple login | Compte Developer pas encore activé ; réessayer après e-mail Apple |
| « No devices » | `eas device:create` puis rebuild |
| Pas de token dans `push_tokens` | Permission refusée → Réglages iOS → Notifications → IRL ; relancer inbox |
| Push non reçue, token OK | `eas credentials` → vérifier Push Key ; optionnel `EXPO_ACCESS_TOKEN` dans Supabase secrets |
| `processed: 0` | `token_count = 0` en SQL — refaire étape 6 |

---

## Coûts récap

| Poste | Coût |
|-------|------|
| Apple Developer Program | ~99 USD / an |
| EAS Build (plan gratuit) | Quota mensuel limité — suffisant pour quelques dev builds |
| Supabase / Expo push API | MVP dans les free tiers |

---

## Liens officiels

- [Apple Developer Program](https://developer.apple.com/programs/)
- [EAS Build — iOS](https://docs.expo.dev/build/setup/)
- [Expo push notifications setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Registering iOS devices](https://docs.expo.dev/develop/development-builds/create-a-build/#create-and-install)
