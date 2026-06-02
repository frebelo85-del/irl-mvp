# Prompt ChatGPT — génération de missions IRL

Copier-coller le bloc **« PROMPT PRINCIPAL »** ci-dessous dans ChatGPT.  
**Recommandation :** une conversation **par catégorie** (7 chats), demander **40–50 missions** par chat → ~280–350 missions au total.

Après génération : fusionner les JSON dans `docs/missions.seed.json`, puis `npm run db:seed` et `supabase db push` (ou appliquer la migration générée).

**Public visé (contenu missions)** : adultes sur toute la durée de vie active jusqu’aux retraités ; contextes urbains **et** ruraux / faible densité. Ne pas restreindre à 22–28 ni à la ville seule.

---

## PROMPT PRINCIPAL (à copier)

```
You are a senior UX writer for a mobile app called IRL (working title). The app sends sparse, curiosity-driven nudges that pull people into small real-world actions — NOT screen-time reduction, NOT productivity, NOT guilt.

## Product rules (non-negotiable)

- Tone: calm companion, warm, direct, never preachy, never medical/wellness-clinical, never parental.
- Do NOT mention: screen time, doomscrolling, addiction, detox, productivity hacks, streaks, or shame.
- Do NOT ask users to post on social media or share proof.
- Actions must be doable in 2–15 minutes, mostly offline, realistic for **adults across the lifespan** (young adult through retirees), in **urban or rural** settings — alone, with someone, or socially drifting; do not assume a single age band or city-only lifestyle.
- Missions must work without special equipment, without spending money (or at most trivial cost like a coffee).
- Locale: English (en) only.
- Each mission is independent; avoid inside jokes or references to previous missions.

## Notification architecture

- **teaser** = push notification text ONLY (max ~90 characters). Intriguing, incomplete — user must open the app for the full mission. No spoilers of the action steps.
- **title** = in-app headline, format: "Mission: <short label>" (under ~40 characters after "Mission: ").
- **body** = full instructions in-app (2–4 short sentences). Clear imperative. End with permission to stop small ("That's enough", "Stop after that", etc.).

## Categories (generate ONLY for: {{CATEGORY}})

Allowed values exactly: social | nature | curiosity | adventure | creativity | calm | learning

Category intent:
- **social**: genuine human connection (message, call, in-person micro-moment), not networking or dating apps.
- **nature**: notice outdoors, weather, plants, sky, body in space — window, garden, street, field, or neighborhood; city and countryside both count.
- **curiosity**: questions, observation, learning from humans or environment without opening feeds.
- **adventure**: small route/place/context change, mild novelty, low risk.
- **creativity**: make something by hand/voice, private, no audience required.
- **calm**: stillness, breath, sensory grounding — not therapy language.
- **learning**: one tiny practice step of a skill — not a full course.

## Volume & variety

Generate exactly **{{COUNT}}** unique missions for category **{{CATEGORY}}**.

Variety requirements:
- No duplicate ideas (rephrase counts as duplicate if same action).
- Mix: alone vs with someone, indoor vs outdoor, urban vs rural contexts, morning/evening neutral wording.
- Age-neutral wording: no generation-specific slang; actions should feel natural at 25, 45, or 70.
- Avoid missions that assume dense urban amenities only (e.g. specialty cafés, metro, coworking) unless optional ("if you have one nearby").
- Mix durations: 30 seconds, 2 min, 5 min, 10 min.
- Vary sentence openings; don't start every body with "Pick" or "Take".
- At least 30% should NOT use the word "mission" in the body.

## Output format (strict JSON only, no markdown fence)

Return a single JSON object:

{
  "missions": [
    {
      "id": "xxxxxxxx-xxxx-4789-a012-34567890{{CAT_CODE}}{{NNN}}",
      "category": "{{CATEGORY}}",
      "teaser": "...",
      "title": "Mission: ...",
      "body": "...",
      "locale": "en"
    }
  ]
}

UUID rules:
- Use valid UUID v4-style strings (8-4-4-4-**12** hex chars — the last segment must be **exactly 12** characters).
- Fixed prefix: `a1f2e3d4-c5b6-4789-a012-`
- Last segment pattern: `345678` + `{CAT}{NNN}` (12 chars total):
  - social → `345678010001` … `345678010099`
  - nature → `345678020001` … `345678020099`
  - curiosity → `345678030001` …
  - adventure → `345678040001` …
  - creativity → `345678050001` …
  - calm → `345678060001` …
  - learning → `345678070001` …
- Example valid id: `a1f2e3d4-c5b6-4789-a012-345678010001`
- **Invalid** (13 chars in last segment): `…-3456789001001`

## Quality bar (reject yourself before output)

Reject any mission that:
- Requires travel > 15 min dedicated to the task
- Requires another app open (feeds, maps ok only if optional)
- Is vague ("be mindful today")
- Sounds like a corporate wellness email
- Assumes a young urban professional only, or excludes rural / low-density settings
- Could feel creepy (stalking, pressuring someone)
- Mentions IRL app, notifications, or phones except rarely and neutrally

## Reference examples (match this quality, do NOT copy text)

Example A (social):
- teaser: "Someone might love hearing from you today."
- title: "Mission: reach out"
- body: "Think of one person you genuinely miss. Send them a short message — not a meme, not a link. Just you, checking in."

Example B (nature):
- teaser: "30 seconds. No goal. Just look."
- title: "Mission: notice the outside"
- body: "Go to a window or step outside for 30 seconds. Name one thing you never really noticed before — a sound, a shape, a color."

Example C (calm):
- teaser: "Silence is not empty."
- title: "Mission: give your brain quiet"
- body: "Sit or stand still for two minutes without a podcast, video, or feed. Hear the room. Let your mind drift without grabbing new input."

Now generate {{COUNT}} missions for category **{{CATEGORY}}** only. JSON only.
```

---

## Remplacements avant envoi

| Placeholder | Exemple |
|-------------|---------|
| `{{CATEGORY}}` | `social` |
| `{{COUNT}}` | `50` |
| `{{CAT_CODE}}` | `010` pour social, `020` nature, etc. |

### Ordre suggéré des 7 chats

1. `social` — 50 missions — `...01001+`
2. `nature` — 50
3. `curiosity` — 50
4. `adventure` — 50
5. `creativity` — 50
6. `calm` — 50
7. `learning` — 50

---

## PROMPT DE REVISION (2ᵉ passe, optionnel)

```
You are an editor for the IRL mission library. Here is a JSON array of missions for category {{CATEGORY}}.

Tasks:
1. Remove near-duplicates (same action, different words).
2. Shorten any teaser over 90 characters without losing curiosity.
3. Ensure every title starts with "Mission: ".
4. Flag missions that feel preachy, clinical, or screen-shaming — rewrite or drop.
5. Return the cleaned JSON only, same schema, same ids.

[Paste JSON here]
```

---

## PROMPT DÉDUPLICATION GLOBALE (après fusion des 7 fichiers)

```
I have merged mission JSON from 7 categories (~350 items). Find:
- duplicate or near-duplicate actions across categories
- teasers over 90 chars
- bodies over 500 chars

Return a list of ids to remove or rewrite, then output the final merged JSON object { "missions": [...] }.
```

---

## Cible de volume (pourquoi plus que 20/catégorie)

| Métrique | Ordre de grandeur |
|----------|-------------------|
| Cooldown même mission | 30 jours par utilisateur |
| Cap hebdo (low) | ~2 missions / semaine |
| 7 catégories × 20 missions | 140 total → épuisement rapide si prefs multi-catégories |
| **Recommandé beta** | **40–60 / catégorie** (~280–420 total) |
| **Confort long terme** | 80–100 / catégorie (MASTER mentionne 100+ missions produit) |

Générer en plusieurs sessions ChatGPT ; revue humaine obligatoire avant merge.

---

## Intégration technique (après génération)

1. Fusionner dans `docs/missions.seed.json` (garder les 10 missions existantes ou les remplacer).
2. `npm run db:seed` → régénère `supabase/migrations/00000002_seed_missions.sql`
3. `supabase db push` sur le projet cloud
4. Vérifier : `select category, count(*) from missions where is_active group by category;`
