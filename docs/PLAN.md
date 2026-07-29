# ProAgeing App — Working Reference Plan

Status: **planning, pre-build**. This is a living document, not a spec frozen
in stone — update it as decisions change instead of letting them live only
in chat history.

This describes a **separate product** from *Celebrate You!* (the app this
repo currently contains): a paid, subscription-monetised 90-day healthy
longevity transformation programme, to be hosted at `app.proageing.org`.
The relationship between the two apps (shared login, shared content, or
fully independent) is an **open decision**, deferred — see
[Open decisions](#open-decisions) below. Nothing here assumes integration;
build this app's data model self-contained.

---

## 1. Positioning

Not a generic wellness app. A guided transformation programme for adults
45–70 to improve strength, energy, sleep, nutrition, and future healthspan —
evidence-based, Singapore-relevant, measurable.

Tagline direction: **"Add life to your years."** Avoid "anti-ageing" framing.

## 2. Product structure

- **90-Day Transformation** is the flagship paid product, in three phases:
  - Days 1–30 — Foundation (protein, walking, sleep)
  - Days 31–60 — Strength & Metabolism (resistance training, waist reduction)
  - Days 61–90 — Future Health (stress, purpose, social connection, maintenance)
- A shorter entry tier ("21-Day Essentials") was proposed in early planning,
  but overlaps conceptually with *Celebrate You!*'s existing 8-week free
  programme. **Decision deferred** — do not build a 21-day tier into this
  app yet; design the data model so programme length is a variable
  (`program_length_days` on the enrollment/programme record), not hardcoded,
  so this can be resolved later without a schema rewrite.
- Re-test on a recurring cadence (proposed: every 30 days) against the
  baseline assessment to show measurable movement.

## 3. Assessment framework

**Decision: no invented "Longevity Age" score.** Earlier drafts proposed a
single predictive "Healthy Longevity Age" number with quantified claims
("reduce your longevity age by 2–5 years") — dropped due to health-claims/
regulatory exposure (Singapore ASAS advertising standards, MOH wellness-app
guidance) and because it wasn't grounded in an existing, vetted instrument.

Instead, integrate the **existing, live ProAgeing Steps framework** from
[`proageing/proageing-site`](https://github.com/proageing/proageing-site)
(proageing.org), confirmed as the authoritative source — this is real,
shipped, already-collecting-data infrastructure, not a doc reference.

### The 7 ProAgeing Steps → 9 assessment types

| Step | Title | Assessment(s) | `assessment_type` value(s) |
|---|---|---|---|
| 1 | Clarify Your Preferred Future | Sense of Purpose (Ikigai) | `purpose` |
| 2 | Understand Your Personal Healthspan Risks | Family History, Cognitive Decline | `family-history`, `cognitive-decline` |
| 3 | Invest in Daily Movement | VO2 Max & Resting HR | `vo2max` |
| 4 | Build Strength and Balance Capacity | Sit-to-Stand, Balance | `sit-to-stand`, `balance` |
| 5 | Fuel Your Body Healthily | Nutrition & Protein | `nutrition-protein` |
| 6 | Restore Sleep and Stress Rhythm | Sleep Quality (PSQI-based) | `sleep-quality` |
| 7 | Strengthen Social and Emotional Connections | Connection (loneliness score) | `connection` |

(`training-zone.html` also exists on proageing.org but is a standalone
calculator — it does not persist a result, so it's not part of this table.)

### Existing schema (as implemented today)

Single table, `proageing_results`, in the Supabase project
`xdmamjeqqqsglqiltzvn` — **this is the same project CelebrateYouHub uses**
(confirmed against `js/config.js` in this repo), not a separate one.
CelebrateYouHub's 8-week programme, proageing.org's public assessments, and
this table all currently live in one shared project. The isolation
decision below (new, dedicated project for the 90-day premium app) applies
against *this* shared project as the source, not a third proageing-site-only
one.

```
proageing_results
  user_id         uuid        -- Supabase auth user (magic-link/OTP)
  assessment_type text        -- one of the 9 values above
  entry_data      jsonb       -- shape varies by assessment, see below
  created_at      timestamptz -- default now(); multiple rows per user+type
                                  over time = the trend history
```

`entry_data` shape by type:
- Most types: `{ score: number }` (units vary — e.g. stands/30s for
  sit-to-stand, seconds for balance, ml/kg/min for vo2max, PSQI score for
  sleep-quality, loneliness score for connection)
- `family-history` is structured differently:
  `{ elevated_count, early_onset_count, answers }` — a flag count, not a
  score, surfaced on the dashboard as "N areas flagged" rather than a trend

No schema.sql / migration file exists in proageing-site for this table
(it was created directly via the Supabase dashboard) — **the RLS policy on
`proageing_results` has not been inspected and should be pulled/documented
before the new app is granted any access to this project.**

### How proageing.org currently reads this data

`dashboard.html` queries all rows ordered by `created_at`, groups by
`assessment_type` client-side, and for each type shows the latest value,
a trend arrow vs. the previous entry (direction-aware: some metrics improve
by going up, others by going down), and a "N of 9 checks completed"
progress bar. This read pattern (latest + delta vs. previous, grouped by
step) is a reasonable template for how the new app's dashboard should
present the same data, rather than inventing a new visualization model.

Track movement per-assessment-type (the existing 9 values), not a single
composite "age" number — matches the "show only 5 metrics" dashboard
principle below and avoids the health-claims issue entirely.

## 4. Core features

1. **Longevity dashboard** — 5 metrics max (e.g. Energy, Sleep, Strength,
   Balance, Protein target). Avoid 20+ metrics.
2. **Protein-first nutrition module** — Singapore hawker food guide,
   "what to order" recommendations, protein calculator, visual portion
   guide, 7-day protein challenge. Differentiator vs. generic wellness apps.
3. **Strength & mobility micro-sessions** — under 2 minutes, e.g. chair
   squats, wall push-ups, band rows, calf raises, one-leg stand. Not full
   workouts.
4. **Sleep reset** — wind-down audio, caffeine cutoff reminder, light
   exposure habit, consistency tracker. No sleep-stage analysis needed at
   MVP.
5. **AI longevity coach — rules-first, not medical.** `IF protein < 60g AND
   age >= 50 THEN suggest local breakfast options` style rules for v1;
   LLM used only for natural-language phrasing in v2, never for medical
   decisions.
6. **Gamification** — streaks, points per pillar, weekly badges, team/
   department challenges for corporate cohorts (pattern borrowed from
   Flourish).
7. **Community cohorts** — small groups of 20–30 (e.g. "Men 50–60",
   "Pre-retirement"). Flagged as the primary retention driver, not content —
   worth treating as Phase 1-adjacent rather than deferring, if retention is
   what the 90-day pricing depends on.
8. **Corporate/HR dashboard** (`app.proageing.org/hr`) — participation,
   sleep score, protein adequacy, activity compliance, strength
   improvement, **aggregate-only** high-risk flag count. The aggregate-only
   constraint must be enforced at the database/API level, not just the UI,
   since it's what the B2B2C pricing tier depends on.

## 5. Pricing

### Consumer
| Plan | Price |
|---|---|
| Assessment | Free |
| 90-Day Transformation | S$129 |
| 90-Day + Coaching (2 group sessions/month) | S$249 |
| Ongoing membership | S$12/month |

(21-Day Essentials tier omitted per the deferred decision in §2.)

### Corporate (B2B2C)
| Employees | Price per employee |
|---|---|
| 50–199 | S$18 |
| 200–999 | S$12 |
| 1000+ | S$8 |

Includes: assessment, team leaderboard, HR dashboard, aggregate risk
insights.

### Funnel economics — unvalidated, treat as illustrative only
Rough model: per 1,000 free-assessment leads, ~120 buy the paid programme,
~45 of those upgrade to the higher tier, ~25 convert to ongoing membership.
**This has not been tested with this audience.** Recommended before
committing further build time: a landing page + the free assessment alone +
a small paid traffic run, to get real conversion and CAC numbers.

## 6. Technical architecture

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 + TypeScript + Tailwind, as an installable PWA |
| Backend | Express or NestJS (pick based on team familiarity) on Cloud Run — for Stripe/business logic needing a service key, same pattern as CelebrateYouHub's Vercel function |
| Database | **Supabase (new, dedicated project)** — not Cloud SQL. Supabase is already hosted Postgres + Auth + RLS, satisfies the "relational, not Firestore" goal, and the team already runs it successfully for both CelebrateYouHub and proageing-site. **Isolated from those two existing projects** (confirmed decision) — not shared, to keep subscription/payment/corporate data separate from the free-hub and public-assessment data. See §3 for the read-path needed back into proageing-site's project. |
| Cache | Redis (Memorystore) — **defer until load requires it**, not needed at MVP scale |
| Auth | **Supabase Auth**, magic-link/OTP first — matches the pattern already proven in both CelebrateYouHub and proageing-site rather than introducing a fourth auth system (Firebase). Social/corporate SSO later, same as originally planned. |
| Video | Vimeo Business (embed, privacy, analytics, captions — avoid self-hosting) |
| Payments | Stripe Singapore |
| Analytics | PostHog (product) + GA4 (marketing) |
| Notifications | Firebase Cloud Messaging (push) |
| CMS | **Deferred** — Sanity CMS later, not at MVP |
| WhatsApp nudges | **Deferred** — Twilio/WhatsApp later, not at MVP |
| Hosting | Google Cloud Platform (same environment as existing Flourish) |
| CI/CD | GitHub Actions |

Rationale for Postgres-over-Firestore, Cloud Run, and the deferred items is
unchanged from the original architecture reference — see chat history for
the full "why" per component if needed.

## 7. Data model (initial outline)

`AssessmentResult` should mirror proageing-site's existing shape
(`assessment_type` text + `entry_data` jsonb, see §3) rather than a rigid
per-pillar column schema — this keeps whatever read-path/import mechanism
eventually pulls a user's proageing.org history into this project a
straight copy, not a transform.

```
User
├── ConsentRecord (many)         — timestamped, versioned consent text; see §8
├── Assessment (many)
│   └── AssessmentResult          — { assessment_type, entry_data jsonb, created_at }, one of the 9 types in §3
├── ProgramEnrollment
│   ├── program_length_days       — variable, not hardcoded (see §2)
│   ├── DayProgress
│   ├── HabitCheckin
│   └── VideoProgress
├── NutritionLog
├── ExerciseLog
├── SleepLog
├── Subscription
└── CorporateAccount (optional)   — links User to an aggregate-only reporting scope
```

## 8. PDPA / consent

Approach: consent-at-collection, not a blocking compliance program. But
implement it as a real, queryable record from day one — a `consent_records`
table (user id, consent text version, timestamp, scope of data covered) —
not just a checkbox rendered in the UI and forgotten. This is a small
data-model addition now vs. a retrofit later if ever reviewed.

## 9. Build phases

**Phase 0 — Foundations (1–2 weeks)**

Manual (needs your account/billing access — not something I can do from here):
- [ ] Create the new, isolated Supabase project; run `supabase/schema.sql`
      in its SQL Editor once created
- [ ] Create/confirm the GCP project for this app (alongside Flourish)
- [ ] Create the Stripe Singapore account, add the products/prices from
      PLAN.md §5
- [ ] Point `app.proageing.org` DNS at wherever the frontend ends up hosted

Prepared and ready:
- [x] `proageing_results` RLS policy pulled and documented — PLAN.md §Open
      decisions, item 6
- [x] Draft schema for the new project — `supabase/schema.sql`, mirrors
      `proageing_results`' shape for the assessment_results table so the
      read-path import is a straight copy
- [x] Repo location — `proageing/proageing-app`, a separate repo from
      CelebrateYouHub, matching `proageing-site`'s pattern. Next.js 15 +
      TypeScript + Tailwind scaffold committed.

Still open, blocks starting the actual codebase:
- [ ] Read-path/import mechanism itself — RLS now confirms it can be done
      client-side with the user's own session (no service-role key needed),
      but the actual implementation isn't built yet

**Phase 1 — MVP (6–8 weeks)**
- Free assessment (the 9 ProAgeing Steps checks) → per-step dashboard
- 90-day programme structure live (content can stage in — first weeks
  produced, rest scheduled)
- Daily check-ins, habit streaks, push notifications (FCM)
- Video via Vimeo Business
- Stripe subscription paywall
- Explicitly OUT of scope for MVP: wearable integration, AI meal
  recognition, social feed, telemedicine, complex analytics, Sanity CMS,
  WhatsApp/Twilio, Redis

**Phase 2 — months 2–4**
- Corporate/HR dashboard, WhatsApp nudges, PostHog wired to real
  retention/conversion metrics, Sanity CMS, community cohorts if not
  already in Phase 1

**Phase 3 — months 4–12**
- Rules-first AI coach, wearable integration (Apple Health / Health
  Connect), multi-language, partner referrals

## 10. Cost estimate (first ~5,000 users)

~S$125–275/month equivalent range (Cloud Run, Cloud SQL, Redis once added,
Vimeo Business, PostHog, Sanity once added, Twilio once added) — low
relative to a native-app-first approach.

---

## Open decisions

Track here until resolved — do not let these get silently assumed away in
code:

1. ~~ProAgeing Steps source~~ — **resolved**: `proageing/proageing-site`
   (proageing.org) is the authoritative source, see §3.
2. **21-day vs. 8-week relationship** — whether/how this app's programme
   relates to *Celebrate You!*'s existing free 8-week programme (shared
   entry point? fully separate funnels?). Deferred; both apps being built
   independently in the meantime.
3. **Funnel economics validation** — the pricing/conversion model in §5 is
   illustrative only; recommend a cheap pre-build test (landing page + paid
   traffic) before treating those numbers as load-bearing for the business
   case.
4. **Shared identity between apps** — not yet decided whether a user in
   both *Celebrate You!* and ProAgeing should have any linked account. Not
   assumed in the data model above.
5. **Results read-path from the shared project** — a user's existing
   assessment history (in the CelebrateYouHub/proageing.org shared Supabase
   project, `xdmamjeqqqsglqiltzvn`) needs to reach the new app's own,
   isolated Supabase project somehow. User indicated a workaround is
   planned; mechanism not yet specified here. Candidates once defined: pull
   via that project's API at signup (matched by email/user id) vs. a
   scheduled sync job. Update this doc once decided — don't let the
   mechanism live only in someone's head.
6. ~~`proageing_results` RLS policy~~ — **resolved**:
   ```
   DELETE  "Users can delete their own proageing results"  USING (auth.uid() = user_id)
   INSERT  "Users can insert their own proageing results"  WITH CHECK (auth.uid() = user_id)
   SELECT  "Users can view their own proageing results"    USING (auth.uid() = user_id)
   ```
   No UPDATE policy exists — rows are insert-only (a new row per check-in,
   never overwritten), consistent with the trend-history design in §3. No
   public/anon-wide read; access is scoped entirely to the authenticated
   user's own rows via `auth.uid()`.

   **Implication for the read-path (item 5):** because access is already
   scoped to the authenticated user, the new app doesn't need service-role
   access to the shared project to pull someone's history — have the user
   authenticate against the shared project client-side (their own JWT) and
   fetch their own rows under this same policy, then copy into the new
   project. Keeps the shared project's secret/service-role key out of the
   new app's day-to-day code path entirely.

> **Security note:** a Supabase secret key for this project was shared in
> chat during planning (2026-07-29). It was not used (this environment
> cannot reach `supabase.co`), not written to any file, and not committed.
> **Rotated the same day** — old key revoked after dependent environments
> (Vercel, and whatever hosts proageing.org's automation) were confirmed
> on the new key.
