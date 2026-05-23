# MASTER DOCUMENT — IRL Reconnection App

## Working Title

Temporary names:

* IRL
* Unplug
* Reconnect
* LifePing
* Human Mode
* Outside
* TouchGrass

---

# 1. PRODUCT VISION

## Core Mission

Help people discover and do new things in real life through intelligent, emotionally-aware nudges — not by reducing screen time or fighting technology.

The app should not feel like:

* a productivity tool
* a parental control app
* a guilt machine
* a screen-time punishment system
* a digital detox restriction app

The app should feel like:

* a calm companion
* a real-life catalyst
* a source of curiosity
* a positive interruption system
* a guide toward new experiences

---

## Core Philosophy

Current digital wellness apps mostly rely on restriction:

* blocking apps
* timers
* punishments
* screen-time statistics
* shame metrics

This product will instead focus on:

* emotional redirection toward action
* curiosity
* exploration
* human connection
* micro-adventures
* psychological nudges
* spontaneity off-screen

**The goal is not to fight screens or minimize screen time.**

**The goal is to replace passive inertia with meaningful real-world actions — to help users do things they would not have done otherwise.**

Technology is useful and part of modern life. The mission is helping users build a healthier balance between digital life and real life. The app is a bridge back to reality, not a wall against screens.

---

## What Success Looks Like

If the app succeeds, users:

* try new things off-screen
* reconnect with people
* regain curiosity
* experience more real moments
* feel more alive and present
* take more spontaneous action in their lives

The app becomes a small but meaningful trigger for positive momentum in real life.

---

# 2. TARGET USERS

## Primary Audience (initial hypothesis)

People aged 16–35 who:

* feel stuck in passive routines
* want more presence and spontaneity in daily life
* feel mentally overloaded but not necessarily looking for "less phone"
* seek more real-world experiences without toxic productivity framing
* are open to gentle surprises that pull them toward action

**MVP persona focus:** urban adults 22–28, solo or socially drifting, curious but inactive — not the entire 16–35 range at launch.

---

# 3. CORE EXPERIENCE

## Main Loop

1. User receives an unexpected mission nudge (often while **not** actively on their phone)
2. Curiosity from the notification draws them to read the mission
3. User accepts, postpones, or skips
4. User performs a small real-world action **off-screen**
5. User gives lightweight feedback (1 tap)
6. The system learns what resonates and when — over time

**Important:** the loop does **not** start from detecting scroll or excessive screen use. It starts from **surprise and curiosity**.

---

## Ideal Notification Flow

```
Lock screen notification → curiosity → open app (briefly) → read mission → put phone down → act IRL
```

The app should not try to capture attention during scrolling. It should **redirect** attention toward something real. The notification is the hook; real life is the destination.

---

## Examples of Nudges

### Social

* "Message someone you genuinely miss."
* "Call someone instead of texting them tonight."

### Nature

* "Look outside for 30 seconds and notice something you never noticed before."
* "Go touch something alive."

### Curiosity

* "Learn one random thing today — offline if you can."
* "Ask someone a question you never asked before."

### Adventure

* "Take a different route today."
* "Walk without headphones for 5 minutes."

### Mindset

* "Your brain deserves silence too."
* "You don't need more content right now — you need one small experience."

---

# 4. PRODUCT DIFFERENTIATION

## Existing Products

Closest existing categories:

* digital detox apps
* mindfulness apps
* habit trackers
* self-care reminder apps

However, most existing apps:

* focus on restriction and screen-time reduction
* create guilt
* measure screen time obsessively
* feel clinical or productivity-focused
* compete for attention **on** the screen

This product instead focuses on:

* real-world activation
* emotional intelligence
* behavioral psychology
* lightness and warmth
* surprise-based missions
* anti-passivity lifestyle design

## Positioning

> "An intelligent companion that helps you reconnect with real life through missions, movement, and meaningful interruptions."

OR

> "A real-life activation system for people who want to do more — not scroll less."

---

# 5. MVP FEATURES

## Version 1 Goals

Launch quickly.
Validate emotional resonance.
Do NOT overbuild.
Do NOT promise context-aware scroll detection.

---

## MVP Features

### Onboarding (minimal)

User selects:

* preferred categories (Social, Nature, Curiosity, etc.)
* active hours / quiet hours (e.g. no nudges before 9h, after 22h)
* notification consent (explicit, GDPR-friendly)

Keep onboarding under 60 seconds. Avoid over-configuration — learn from behavior, not aspirational goals.

Explain clearly: **"We won't spam you. Sometimes you may not hear from us for a day or two — that's intentional."**

---

### Nudge System (random-first)

**Phase 1 strategy: randomized, sparse, surprising.**

* Nudges are sent at random times within user-defined active windows
* Frequency is intentionally low — e.g. 2–4 nudges per week, with possible gaps of 48h or more
* No scroll detection, no screen-time triggers in MVP
* Quality and rarity over quantity

**Why sparse random works:**

* Rare notifications are read; daily notifications are ignored
* No surveillance feeling — user is not being watched
* Surprise creates curiosity, not defensiveness
* Users may be **more receptive when not on their phone** — the notification pulls them out of passive mode

**Phase 2 (post-MVP):** algorithm learns optimal timing based on:

* which missions are accepted / completed / rated helpful
* preferred time windows (day, hour)
* category preferences
* postpone / skip patterns

No heavy AI required for Phase 2 — simple rules + feedback data suffice initially.

---

### Categories

Initial categories:

* Social
* Nature
* Curiosity
* Adventure
* Creativity
* Calm
* Learning

Minimum content bar: 15–20 unique missions per category to avoid repetition in the first weeks.

---

### Feedback Loop (lightweight)

After each mission:

* Helpful? (👍 / 👎)
* Optional: mood improved? (single tap)

Avoid 3-question forms — friction kills completion. One tap minimum.

This data trains future personalization of **content and timing**, not screen behavior.

---

### Positive Statistics

Avoid shame metrics. Avoid "time reclaimed" estimates (unmeasurable and potentially dishonest).

Instead show:

* real-life moments completed
* missions accepted
* adventures taken
* social reconnects
* types of experiences explored

Frame progress as **becoming more alive**, not becoming more efficient.

---

# 6. UX PRINCIPLES

## Design Language

The app should feel:

* energetic but not overstimulating
* breathable
* calm in layout, alive in tone
* minimal
* emotionally warm
* action-oriented

Avoid:

* gamification overload
* dopamine-heavy animations
* productivity dashboard aesthetics
* aggressive streak systems
* clinical wellness aesthetics

---

## UX Philosophy

The app should reduce cognitive load.
Every interaction should feel effortless.

Ideal rules:

* 1–2 taps maximum for most actions
* Mission screen readable in 5 seconds
* After reading a mission, the user should **leave the app** and act IRL

---

## Notification Interaction

Users should be able to:

* accept mission
* postpone mission
* skip mission
* request another mission (limited to 1 per session — avoid "nudge shopping")

Priority in MVP: **Accept** + **Later**. Skip feeds personalization; "another" is secondary.

---

# 7. TECHNICAL STACK

## Frontend

* React Native
* Expo
* TypeScript

## Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Edge Functions

## Notifications

Initial:

* Expo Notifications

Future:

* OneSignal
* Firebase Cloud Messaging

## AI Layer (future, not MVP)

Potential use cases:

* personalized mission wording
* emotional tone adaptation
* content variety at scale

Potential provider:

* OpenAI API

AI is not required for MVP. High-quality human-written missions are the core asset.

---

# 8. APP ARCHITECTURE

## MVP Modules (strict minimum)

* Anonymous session (auto) + optional account linking (Apple/Google)
* User Preferences (categories, active hours, notification consent)
* Notification Scheduler (random within windows + timezone)
* Mission Library
* Feedback Events
* Basic Analytics

## Post-MVP Modules

* Adaptive timing engine
* AI Recommendation Layer
* Reward / Progression System
* Subscription System

---

# 9. NOTIFICATION ENGINE

## Core Idea

Notifications must feel:

* unexpected
* gentle
* emotionally intelligent
* non-intrusive
* worth opening

The app should never feel spammy. **Silence is a feature.**

---

## Notification Principles

* Avoid repetitive wording — large mission pool + variants
* Vary timing randomly within user preferences
* Start sparse (48h+ gaps are acceptable)
* Learn user patterns over time from feedback, not from surveillance
* Favor quality over quantity
* The notification text must be **intriguing** — enough to create curiosity, not enough to skip opening the app

---

## What We Do NOT Do in MVP

* Detect which app the user is scrolling
* Trigger nudges based on screen time thresholds
* Monitor foreground app usage
* Create urgency through fake scarcity or guilt

These may be explored later as **opt-in enhancements**, never as the core product promise.

---

# 10. PRIVACY & REGULATIONS

## GDPR / EU Compliance

Requirements:

* explicit consent for notifications
* clear privacy policy
* account deletion
* export user data
* transparent analytics
* granular consent (notifications ≠ analytics)

Implement export/deletion early — not deferred to pre-launch.

## App Store Safety

Avoid medical claims.

The app is:

* wellness-oriented
* lifestyle-oriented
* not a mental health treatment app

Avoid marketing language around "addiction", "anxiety treatment", or clinical outcomes.

---

# 11. BUSINESS MODEL

## Initial Strategy

Freemium — but delay paywall until retention is proven (D30).

### Free

* core missions
* random nudge delivery
* basic categories
* simple stats

### Premium (future)

* themed mission packs ("Social Reconnect", "Urban Explorer")
* deeper personalization
* AI-generated mission variants
* advanced progression / adventure modes

Avoid selling "AI personalization" before users have felt value for 2–4 weeks.

---

# 12. VIRALITY POTENTIAL

Potential content angles:

* anti-passivity
* "touch grass" culture
* real-life micro-adventures
* intentional living
* Gen Z burnout recovery (action, not restriction)

Potential social mechanics (post-MVP):

* share a completed mission (visual card)
* anonymous collective challenges
* "offline moments" highlights

MVP virality: **shareable mission completion cards** > complex social features.

---

# 13. PRODUCT IDENTITY

## Emotional Direction

The product should feel:

* energetic
* alive
* action-oriented
* human
* adventurous
* spontaneous

The app pushes users toward movement and real-world action.

Philosophy:

* action breaks passive consumption
* movement interrupts inertia
* real-world experiences restore emotional energy

---

## Notification Tone

Preferred tone:

* direct but warm
* action-first
* lightly playful
* emotionally intelligent
* non-judgmental

Example style:

* "Mini aventure : sors 2 minutes maintenant."
* "Va vivre quelque chose pendant 5 minutes."
* "Ton cerveau mérite autre chose qu'un autre scroll."

Avoid:

* therapy language
* productivity language
* guilt
* corporate wellness tone
* screen-time shaming

---

## Mission-Based Design

The word "mission" is psychologically stronger than "advice" or "reminder."

Frame nudges as:

* micro-missions
* real-life quests
* small adventures
* human activation prompts

Examples:

* "Mission: walk without headphones for 5 minutes."
* "Mission: message someone you genuinely appreciate."
* "Mission: discover something new on your street today."

Immersive missions beat generic prompts:

* Instead of "Go outside."
* Prefer "Mission: go outside for 3 minutes and notice something you never noticed before."

---

## Progression Philosophy

The user does not progress toward productivity, efficiency, or optimization.

The user progresses toward:

* becoming more alive
* more spontaneity
* more presence
* more courage to act
* more human connection

Potential future framing:

* "Awakening"
* "Presence"
* "Exploration level"
* "Human mode activation"

Avoid streak anxiety. Milestones based on **types of experiences lived**, not consecutive days.

---

## Branding Direction

Users instinctively check message notifications.

Potential branding direction:

* messaging-inspired UI language
* subtle conversational interaction design
* notification styles that feel personal and urgent without manipulation

The app should feel personal, human, and alive — not clinical, corporate, or self-help guru style.

**Tension to manage:** messaging UI is attention-grabbing by design. Keep the in-app experience minimal so the app releases the user quickly back to real life.

---

## Core Human Problem

Underlying emotional problem:

* loss of desire to experience new things
* emotional distancing from close people
* feeling less present in the real world
* passive existence replacing active life

The true enemy is not technology — it is **passivity, numbness, inertia, and disconnection from reality.** Technology is one amplifier, not the enemy itself.

---

## North Star Metric

**Missions completed per weekly active user** — not screen time reduced.

Secondary metrics:

* notification open rate
* accept rate (vs skip/postpone)
* helpful rating %
* D7 / D30 retention

---

# 14. NEXT STEPS

## Immediate

* finalize brand identity
* write 30+ MVP missions and test via SMS/WhatsApp with 10–15 people before coding
* define sparse notification schedule (frequency, gaps, active windows)
* create nudge philosophy framework
* define minimal onboarding flow
* **Engineering PRD (Cursor-ready):** [docs/PRD.md](./PRD.md) — schéma Supabase, Edge Functions, écrans, phases ; seed missions [missions.seed.json](./missions.seed.json)
* define privacy-first architecture
* create wireframes for one vertical flow: receive mission → complete → feedback
* define launch strategy

## Pre-Code Validation Test

Send 10 missions over 2 weeks via SMS/WhatsApp to 15 people, with 48–72h between each.

Success criteria: >30% of missions acted upon without an app.

If this works without an app, the product is validated. The app is the delivery vehicle.

---

## Recommended Development Order

### Phase 1 — Product Definition

* finalize vision (this document)
* write mission library (100+ missions)
* define UX for notification → mission → feedback flow
* mood board: energetic action + calm layout

### Phase 2 — Technical Foundations

* setup React Native + Expo
* setup Supabase
* authentication
* notification infrastructure (test on real devices early)

### Phase 3 — Core MVP

* minimal onboarding
* categories
* random notification scheduler
* mission inbox / detail screen
* feedback (1 tap)
* basic positive stats

### Phase 4 — Intelligence Layer

* adaptive timing from feedback data
* category preference learning
* frequency tuning per user

### Phase 5 — Launch Preparation

* GDPR compliance (export, deletion, consent)
* App Store assets
* privacy policy
* beta testing (20 users minimum)

### Phase 6 — Growth

* shareable mission cards
* social mechanics
* AI mission generation (with human review)
* Apple Watch
* Android widgets
* opt-in context signals (location, weather) — transparent and permission-based

---

# 15. NUDGE EVOLUTION STRATEGY

## Phase 1 — Random & Sparse (MVP)

* semi-random timing within user active windows
* intentionally low frequency (2–4x/week, gaps of 48h+ OK)
* surprise-based interventions
* no behavioral surveillance

Trigger mix:

* **A:** random within active hours
* **B:** user-defined frequency preference (low / medium)
* **C:** category rotation

**Not in Phase 1:** screen time triggers, app usage detection, scroll awareness.

---

## Phase 2 — Adaptive (post-MVP)

The system learns:

* when nudges are most often accepted
* which missions users complete
* emotional response patterns (helpful ratings)
* ideal timing windows per user
* preferred challenge types

Long-term vision: each user experiences a different rhythm and mission mix. The system becomes increasingly personalized — but always opt-in and transparent.

---

## Phase 3 — Context-Enhanced (future, opt-in only)

Potential optional inputs (with explicit permission):

* location context (urban vs home)
* weather
* time-of-day patterns from feedback history
* routines self-reported by user

**Not planned as default:** screen time monitoring, foreground app detection.

Reason: transparency and trust are competitive advantages. Users must feel helped, not surveilled.

---

# 16. FUTURE EXPANSION IDEAS

* Apple Watch (1-tap mission accept)
* Android widgets / iOS Live Activities (passive reminder without push)
* shareable mission completion cards
* themed mission packs (premium)
* AI voice companion
* offline challenge collections
* local exploration maps
* opt-in context-aware missions (weather, location)
* wearable integrations

Deprioritized / high friction:

* lock-screen interventions (OS restrictions)
* scroll detection as core feature (philosophy misalignment)
* screen-time dashboards

---

# 17. KEY PRODUCT DECISIONS (LOG)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Core goal | Activate real-life action | Not screen time reduction |
| MVP nudge strategy | Random + sparse | Surprise > surveillance; validates without complex tech |
| 48h silence | Feature, not bug | Rarity creates value; set expectations in onboarding |
| Scroll detection | Not in MVP | Misaligned with vision; OS constraints; surveillance feeling |
| Feedback | 1 tap minimum | Reduce friction; still trains personalization |
| Stats | Missions completed | Honest, positive, aligned with mission |
| AI | Post-MVP | Human-written missions are the core asset first |
| Paywall | After D30 retention proof | Personalization is invisible early; don't sell air |
| Primary persona | 22–28 urban | Focus beats broad 16–35 at launch |
| Auth | Anonymous by default; optional Apple/Google link | Zero friction at launch; account for multi-device restore only |

---

# 18. POSITIONING STATEMENT (FINAL)

**"IRL helps you do new things in real life — one surprising mission at a time. Not less screen. More life."**
