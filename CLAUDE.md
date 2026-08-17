# proageing-app — project instructions

Next.js 15 + TypeScript + Tailwind PWA at `app.proageing.org`. Paid 21-Day and
90-Day programmes, nine assessment checks, two calculators, bilingual EN/ZH.
Its own isolated Supabase project. Stripe Singapore for billing.

Read `README.md` for stack and setup, `docs/PLAN.md` for the product plan and
architecture rationale, `docs/AGE_FRIENDLY_UI.md` before touching any UI.

**Two repos, one product family, and they are easy to confuse:**

|  | this repo | `proageing/proageing-site` |
|---|---|---|
| Serves | `app.proageing.org` | `proageing.org` |
| Host | **Vercel** | **Firebase Hosting** |
| Deploy | push to `main`, no workflow in repo | GitHub Actions workflow, gated on tests |
| Stack | Next.js app | self-contained static `.html` files |
| Checks | require sign-in, save to this app's Supabase | anonymous, save to the *site's own* Supabase |

A change to the checks or tools usually needs porting to the other repo. The
site is `../proageing-site` when both are checked out.

## Hard rules — don't violate these

- **`git push` to `main` is the deploy.** Vercel's git integration builds on
  push (`docs/PLAN.md` §6, CI/CD row — the trigger itself is a dashboard
  setting, not visible in this repo). Nothing here gates it, so a type error
  becomes a failed *deployment*, not a failed check. Always run
  `npx tsc --noEmit && npm run build` before pushing. See README §Deploying.
- **New env vars must be added in the Vercel dashboard too.** `.env.local` is
  git-ignored, so a variable that works locally is simply `undefined` in
  production until someone sets it there.
- **Never add an English string without its Chinese.** `lib/i18n/en.ts`
  exports `Dictionary = typeof en`, and `lib/i18n/zh.ts` is
  `export const zh: Dictionary`, so a missing key is a **build error**, not a
  silent English leak in a Chinese session. This is deliberate — don't loosen
  the typing to get a build through. Write Chinese as Chinese (Simplified,
  Singapore/Mainland register), not sentence-by-sentence translation.
- **Checks and tools are different things and the split is load-bearing.**
  `ASSESSMENT_TYPES` (lib/assessmentTypes.ts) holds exactly **9** checks: they
  measure the person, save to Supabase, and appear in the Longevity Profile.
  `lib/tools.ts` holds calculators: they work a number out, store nothing in
  the database, and sit outside the profile's "9 of 9 checks" count. Adding a
  calculator to `ASSESSMENT_TYPES` breaks that count and contradicts
  `proageing.org/pricing.html`, which promises "All 9 assessment checks".
- **`docs/AGE_FRIENDLY_UI.md` is review-blocking, not advisory.** ≥56px tap
  targets, no icon-only controls, nothing readable below 16px (`text-xs` is
  for citations and legal only), and under `prefers-reduced-motion` the
  fallback must still carry the *information*, not just stop moving. A 12px
  chevron shipped once and the reaction was "ridiculous" — it was.
- **Admin-only features must be invisible to everyone else, including in
  layout.** The programme's `?preview=1` day unlock checks `profiles.is_admin`
  and nothing else. When adding to that path, keep spacing conditional
  (`previewAll ? ... : ...`) — a banner that shifts the page by 16px changes
  the experience for all users even though they never see the banner.
- **The protein food table's numbers are verified arithmetic, not editable
  copy.** `PROTEIN_FOODS` grams that have a mapping in
  `lib/assessments/proteinSources.ts` are re-derived from
  `data/hpb-food-insights.csv` by `npm run verify:protein`, which fails if the
  committed figure no longer equals `round(density × serving ÷ 100)`. Run it
  after touching any of the three. If HPB and our table disagree, **our table
  is what's wrong** — never edit a transcribed value to get a pass. Most rows
  (17 of 20) are still unmapped and the script reports that on every run; a
  green result means "nothing contradicts the source data", not "the table is
  sourced". Adding rows needs a human with a browser: `hpb.gov.sg` is blocked
  here, as are USDA FoodData Central and OpenFoodFacts.
- **Never interpolate a Tailwind class.** `bg-${tool.color}` passes `tsc`
  *and* `npm run build`, then renders nothing because the JIT scanner never
  saw a literal. Use the static maps in `lib/pillarStyles.ts`
  (`PILLAR_STYLES[color].dot`). This class of bug is invisible to every check
  except looking at the page.

## Checks you can run

Neither is wired into a hook or CI — they are manual, and worth running when
you touch what they cover. Both run on Node's own `--experimental-strip-types`,
so they import the real `.ts` modules with no dev dependency and work offline.

| Command | Covers |
|---|---|
| `npx tsc --noEmit && npm run build` | The deploy gate. Always, before pushing. |
| `npm run verify:protein` | The protein food table against vendored source data. |
| `npm run verify:translations` | Numbers, citations and structure surviving into `zh.ts`. Has known false positives where the Chinese legitimately localises a journal name; read the output, don't just check the exit code. |

## Things that will bite you

- **The day 7 profile reveal depends on which checks appear by that day.**
  `app/program/page.tsx`'s gate uses `assessmentTypesIntroducedBy(day)`, so
  moving a check to a later day in `lib/program21.ts` can silently mean the
  reveal never fires. Moving vo2max from day 3 to day 16 nearly did exactly
  that.
- **Programme content is in two files that must stay in step** —
  `lib/program21.ts` and `lib/program21Zh.ts`. Day counts, assessment hrefs
  and how-to slugs all have to match.
- **`_`-prefixed directories under `app/` are excluded from routing.** An
  `app/_devfigs/page.tsx` 404s; `app/devfigs/page.tsx` works. If you create a
  scratch route to preview a component, delete it before committing.

## What cannot be verified from the Claude Code sandbox

The network policy blocks more than is obvious, and mistaking a blocked
request for a broken feature wastes real time:

- **`*.supabase.co`** — so every signed-in page (`/dashboard`, `/program`,
  all nine checks) redirects to `/signin` and cannot be exercised. Verify
  such components by rendering them standalone in a scratch route, and say
  so honestly rather than claiming an in-situ check.
- **`api.stripe.com`** — checkout cannot be tested here at all.
- **`app.proageing.org` and `proageing.org`** — the egress proxy 403s both,
  so a deploy cannot be confirmed by fetching a page. DNS resolution *does*
  work, which is how the hosting question was settled (README §Deploying).
- **H.264** is absent from the sandbox's headless Chromium, so an `.mp4`
  reports `error.code 4` even when served correctly. The how-to videos ship
  WebM *and* MP4 partly so they remain testable here.

Playwright: use `executablePath: '/opt/pw-browsers/chromium'`.
