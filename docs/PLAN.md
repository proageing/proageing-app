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

- **21-Day ProAgeing Challenge** — **resolved and built, 2026-07-29**,
  superseding the "deferred" note below. Built as the active on-ramp:
  Days 1–7 introduce all 7 ProAgeing Steps (one check + its first action
  per day, no gap between assessment and action), Days 8–20 continue
  nudges weighted toward Movement and Strength (the two habits meant to
  be reinforced across the full 3 weeks), Day 21 retakes the assessments
  that can plausibly shift in 21 days and closes with a Keystone Habit
  declaration. Content grounded in the real Celebrate You! curriculum
  (`proageing/CelebrateYouCourse`), not invented. See `lib/program21.ts`.
  **Pricing changed 2026-07-29** (§5): no longer the free on-ramp — it's
  now a S$39 one-time purchase, gated behind the Stripe paywall
  (`app/program`'s `no-access` state). The 9 free assessment checks stay
  free; only the guided day-by-day programme itself is paid.
- **90-Day Transformation** — the original flagship paid product design,
  in three phases (Days 1–30 Foundation; 31–60 Strength & Metabolism;
  61–90 Future Health). **Paused, not abandoned** — `lib/program.ts`
  still has the phase logic; `app/program` currently runs the 21-day
  content instead. Revisit once the 21-day challenge has real usage data.
- ~~A shorter entry tier ("21-Day Essentials") was proposed in early
  planning... Decision deferred~~ — **resolved above**: built, and it
  turned out to be the higher-priority track, not the 90-day one.
  `program_length_days` being a variable field (not hardcoded) is exactly
  what made this pivot a same-day change rather than a schema rewrite.
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

**Revised 2026-07-29**, superseding the table below: the 21-Day Challenge
(§2) is a paid one-time purchase, not free — reversing its earlier framing
as the free on-ramp. Coaching add-on dropped for now. Ongoing membership
is free, not S$12/month — it's continued access to your account plus a
free trend history across every assessment you've taken over time, not a
separate paid tier. "for now" per the decision that set this — expect
these to keep moving as real conversion data comes in (§Funnel economics
below is still unvalidated).

### Consumer
| Plan | Price |
|---|---|
| Assessment (9 checks) | Free |
| Ongoing membership (account + trend history) | Free |
| 21-Day ProAgeing Challenge | S$39 |
| 90-Day Transformation | S$129 |

90-Day Transformation is priced and purchasable (lib/plans.ts,
app/upgrade) but has no built programme content yet — buying it today
just unlocks the same 21-day content as the 21-Day Challenge, since
that's all that exists (app/program). Build the actual 90-day content
before promoting this tier, or mark it "coming soon" until then.

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
| Backend | **Next.js API routes** (serverless functions on Vercel) — for Stripe/business logic needing a service key, same pattern as CelebrateYouHub's existing Vercel function. **Changed 2026-07-29**: originally a separate Express/NestJS service on Cloud Run; dropped once Hosting (below) moved to Vercel, since API routes cover the same need without a second service to deploy and operate. |
| Database | **Supabase (new, dedicated project)** — not Cloud SQL. Supabase is already hosted Postgres + Auth + RLS, satisfies the "relational, not Firestore" goal, and the team already runs it successfully for both CelebrateYouHub and proageing-site. **Isolated from those two existing projects** (confirmed decision) — not shared, to keep subscription/payment/corporate data separate from the free-hub and public-assessment data. See §3 for the read-path needed back into proageing-site's project. |
| Cache | Redis — **defer until load requires it**, not needed at MVP scale. Provider TBD at that point (e.g. Upstash, which fits a Vercel deployment more directly than GCP Memorystore did under the old hosting choice). |
| Auth | **Supabase Auth**, magic-link/OTP first — matches the pattern already proven in both CelebrateYouHub and proageing-site rather than introducing a fourth auth system (Firebase). Social/corporate SSO later, same as originally planned. |
| Video | Vimeo Business (embed, privacy, analytics, captions — avoid self-hosting) |
| Payments | Stripe Singapore |
| Analytics | PostHog (product) + GA4 (marketing) |
| Notifications | Firebase Cloud Messaging (push) — a lightweight Firebase project for this alone, not the GCP hosting environment below |
| CMS | **Deferred** — Sanity CMS later, not at MVP |
| WhatsApp nudges | **Deferred** — Twilio/WhatsApp later, not at MVP |
| Hosting | **Vercel.** **Changed 2026-07-29** — originally Google Cloud Platform, "same environment as existing Flourish". Reversed once we noticed the plan was internally inconsistent: the Backend row above already modeled itself on "CelebrateYouHub's Vercel function," but CelebrateYouHub itself runs on Vercel, not GCP — so "alongside Flourish" and "same pattern as CelebrateYouHub" pointed two different ways. Vercel wins: it's the reference deployment target for Next.js (zero-config, no Dockerfile/Cloud Run service to maintain), and it matches the real precedent already running in this product family. Tradeoff: this app no longer shares infrastructure with Flourish's GCP environment — revisit if that turns out to matter (e.g. a future need to share GCP-side services or billing). |
| CI/CD | Vercel's native git integration (auto-deploy on push to `main`, preview deploys per PR) — GitHub Actions still optional for running tests/lint before merge, not for deployment itself |

Rationale for Postgres-over-Firestore and the deferred items is unchanged
from the original architecture reference — see chat history for the full
"why" per component if needed. Hosting/Backend rationale is above, dated,
since it reverses the original reference on those two rows specifically.

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

Manual (needs your account/billing access — not something I can do from here).
**These boxes lag reality**: they get done outside Claude sessions and nobody
comes back to tick them, so an unticked box here is not evidence that
something is outstanding. Tick with the evidence, as below, or leave a note
saying it cannot be checked from this environment.
- [x] Create the Vercel project — import `proageing/proageing-app`, add the
      env vars from `.env.example` (Supabase + shared-project values),
      deploy. Replaces the old "create/confirm the GCP project" step now
      that Hosting is Vercel (§6, changed 2026-07-29).
      **Ticked 2026-08-08 from evidence, not from doing it:**
      `app.proageing.org` resolves through `vercel-dns-017.com`, so a Vercel
      project is serving the domain. That says nothing about whether every
      env var is set there — unverifiable from a sandbox that blocks
      `api.stripe.com` and `*.supabase.co`.
- [x] Stripe Singapore account created. 21-Day Challenge product/price
      done, set locally as `STRIPE_PRICE_21DAY` in `.env.local` (not
      committed — see `.env.example`) — checkout for that plan is
      code-complete pending a real deploy. 90-Day Transformation price
      still needed.
- [ ] Add the Stripe secret key + webhook signing secret, and the
      Supabase service_role key, to `.env.local`/Vercel once ready —
      not done yet, and can't be verified from this environment either
      way: outbound access to api.stripe.com is blocked here (same
      network policy that blocks supabase.co), so an actual Checkout
      Session can only be tested from a real deploy or a local run
      outside this sandbox.
- [x] Point `app.proageing.org` DNS at the Vercel deployment once live —
      **ticked 2026-08-08 from the same DNS evidence as the box above.**
      `app.proageing.org` → `vercel-dns-017.com` → `64.29.17.65`,
      `216.198.79.65`. (For contrast, `proageing.org` → `199.36.158.100`,
      Firebase Hosting.)

Prepared and ready:
- [x] `proageing_results` RLS policy pulled and documented — PLAN.md §Open
      decisions, item 6
- [x] Draft schema for the new project — `supabase/schema.sql`, mirrors
      `proageing_results`' shape for the assessment_results table so the
      read-path import is a straight copy
- [x] Repo location — `proageing/proageing-app`, a separate repo from
      CelebrateYouHub, matching `proageing-site`'s pattern. Next.js 15 +
      TypeScript + Tailwind scaffold committed.
- [x] Read-path/import mechanism — built client-side, no service-role key
      needed; see §Open decisions item 5.
- [x] The new, isolated Supabase project — created (`bzsvsowgronuelzpnlrt`),
      `supabase/schema.sql` run against it. Verified indirectly (a real
      `npm run build` against its live URL/anon key succeeds); this
      environment's network policy blocks reaching `supabase.co` directly,
      so full end-to-end verification (sign-in, saving a result) is still
      pending a real deploy or a local run outside this environment.

Everything else in this phase needs your account/billing access — see the
manual list above. Nothing else is blocking the codebase from here.

**Phase 1 — MVP (6–8 weeks)**
- [x] Free assessment (the 9 ProAgeing Steps checks) → per-step dashboard.
      All 9 assessment types now have a real in-app form
      (app/assess/<type>), each ported faithfully from proageing-site's
      actual scoring logic and citations, not reinvented — see the
      commit history for the specific validated instrument behind each
      one (Ikigai-9, SLAS Risk Index, Heart Rate Ratio Method, PSQI,
      LSNS-6/UCLA-3, Rikli & Jones chair-stand test, One-Leg Standing
      Test). sit-to-stand and balance intentionally drop the source's
      live camera mirror and demo video — AV aids around the test, not
      the measurement itself.
- [x] 90-day programme mechanism — enrollment, day-number tracking
      against a real start date, phase lookup (Foundation / Strength &
      Metabolism / Future Health), and a daily checklist (video watched
      / habit completed / note) that upserts into day_progress
      (app/program, lib/program.ts). Actual day-by-day video/habit
      content is still a placeholder — that's real editorial content
      that needs producing, not something to fabricate. "Content can
      stage in" still applies once that content exists.
- [x] Habit streaks — consecutive completed-day count, shown on
      app/program. Push notifications (FCM) not started.
- [ ] Video via Vimeo Business
- [x] Stripe paywall — checkout + webhook (app/api/stripe/checkout,
      app/api/stripe/webhook, lib/stripe.ts, lib/plans.ts,
      lib/supabaseAdmin.ts, app/upgrade). **Updated 2026-07-29** to match
      the revised pricing in §5: both the 21-Day Challenge (S$39) and
      90-Day Transformation (S$129) are paid, one-time purchases and
      `app/program` now gates on an active subscription for either
      (`no-access` state) rather than letting anyone start free. Ongoing
      membership (account + trend history) needs no Stripe product — it's
      free by default for any signed-in user. Not live yet: needs the
      Stripe Singapore account + real price IDs (Phase 0 manual step) and
      the Supabase service_role key before `subscriptions` rows will
      actually get written.
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
5. ~~Results read-path from the shared project~~ — **resolved and
   implemented**: `lib/sharedSupabase.ts`, `lib/importHistory.ts`, and
   `app/import/page.tsx`. A user enters their email, gets a one-time code
   against the shared project (`xdmamjeqqqsglqiltzvn`), and on verification
   their `proageing_results` rows (scoped to their own `auth.uid()` there
   by the RLS policy in item 6) are copied into this app's own
   `assessment_results` table under the signed-in user here, tagged
   `source='proageing_site_import'`. Idempotent — re-running skips rows
   already imported (deduped on `assessment_type` + `created_at`). No
   service-role key involved on either side. Untested end-to-end since
   this app's own Supabase project doesn't exist yet (Phase 0 manual step);
   ready to verify once it does.
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
