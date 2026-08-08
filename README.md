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

The schema lives in [`supabase/schema.sql`](supabase/schema.sql) — paste it
into the SQL Editor of this app's own isolated Supabase project. Note that
Supabase is unreachable from the Claude Code sandbox (network policy blocks
`*.supabase.co`), so nothing in this repo can confirm what is currently
deployed there; treat the file as the intended shape, not a live mirror.

## Deploying

**There is no deploy command and no GitHub Actions workflow in this repo.
Hosting is Vercel, and `git push` to `main` is the deploy.**

- **Host:** Vercel. Confirmed 2026-08-08 by DNS — `app.proageing.org`
  resolves via `vercel-dns-017.com` (`64.29.17.65`, `216.198.79.65`).
  Contrast `proageing.org`, the static marketing site, which is Firebase
  Hosting (`199.36.158.100`) and *does* have a workflow of its own in the
  `proageing-site` repo. The two deploy by completely different routes.
- **Trigger:** Vercel's native git integration — auto-deploy on push to
  `main`, preview deploys per PR. See `docs/PLAN.md` §6 (CI/CD row) for why
  this rather than GitHub Actions, and §6 (Hosting row, changed 2026-07-29)
  for why Vercel rather than the originally planned GCP.
- **Env vars live in the Vercel project, not here.** `.env.example` lists
  what is needed and documents each one; `.env.local` is git-ignored. Adding
  a new variable means adding it in the Vercel dashboard too, or it will be
  undefined in production while working fine locally.
- **Before pushing**, run `npx tsc --noEmit && npm run build`. Vercel builds
  on its own after the push, so a type error becomes a failed *deployment*
  rather than a failed check — nothing in the repo gates the push.

Verifying a deploy landed cannot be done from the Claude Code sandbox: the
egress proxy 403s `app.proageing.org` (as it does `proageing.org`). DNS
resolution works, so hosting can be established from here, but fetching a
page cannot. Check the Vercel dashboard, or load the URL yourself.

## Status

Well past the Phase 0 scaffold that `docs/PLAN.md` §9 describes. In the repo
today: 9 assessment checks, 2 calculators (see `lib/tools.ts`), the 21-day
programme with how-to content and video (`lib/program21.ts`,
`components/howto/`), the Longevity Profile and trends, Stripe checkout
routes, and a bilingual EN/ZH dictionary.

`docs/PLAN.md` §9's manual checklist is only partly reliable — some boxes
were completed outside any Claude session and never ticked. Where a box can
be settled from evidence it now says so inline. Anything requiring account
access (Stripe keys, Supabase provisioning) cannot be checked from here at
all, because that network access is blocked.
