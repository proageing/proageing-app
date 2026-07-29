# ProAgeing App

**"Add life to your years."**

The ProAgeing 90-Day Transformation programme — a paid, subscription
healthy longevity programme for adults 45–70, hosted at
`app.proageing.org`. A separate product from *Celebrate You!*
(`proageing/celebrateyouhub`), with its own isolated Supabase project.

See [`docs/PLAN.md`](docs/PLAN.md) for the full product/technical plan —
positioning, assessment framework, pricing, architecture, build phases, and
open decisions. Treat it as living documentation, not a frozen spec.

## Stack

- Next.js 15 + TypeScript + Tailwind, installable PWA
- Supabase (new, dedicated project — Postgres + Auth + RLS)
- Stripe Singapore for billing

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase project's URL/anon key
npm run dev
```

## Database

The schema lives in [`supabase/schema.sql`](supabase/schema.sql). Paste it
into the SQL Editor of the new, isolated Supabase project once that project
exists (see `docs/PLAN.md` §9, Phase 0) — it hasn't been run anywhere yet.

## Status

Phase 0 (foundations) — repo and app scaffold in place. Manual account
setup (Supabase project, GCP, Stripe, DNS) and Phase 1 MVP build are still
ahead; see `docs/PLAN.md` §9 for the full checklist.
