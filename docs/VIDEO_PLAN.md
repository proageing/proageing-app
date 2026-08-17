# 21-Day Challenge — video plan and production hand-off

**Purpose.** Everything a fresh session needs to write production plans and
video-generation prompts for the 21-Day Challenge, without first having to
reverse-engineer the app. Read this, then `lib/program21.ts` for verbatim copy.

**Status.** Nothing in this document has been produced yet. Two exercise
demonstration clips exist already (below) and set the house style; the daily
videos do not exist and neither does the player that would show them.

---

## 0. Decided

**Presenter on the milestone days, AI-generated illustration everywhere else.**
Settled by the user, 2026-08-10. It resolves §2's central question and fixes
the shape of everything downstream.

| | Days | Treatment |
|---|---|---|
| **Presenter** | intro, 1, 7, 14, 21 | A real person to camera. Trust, welcome, milestone, close. |
| **Illustration** | 2–6, 8–13, 15–20 | AI-generated, language-free visuals + voice-over. 17 videos. |

Assumption to correct if wrong: "milestone" is read as the pre-programme
intro plus days 1, 7, 14 and 21 — the welcome, the week-1 close that doubles
as the Longevity Profile reveal, the two-week mark, and graduation. If that is
one too many, the intro and day 1 are the pair to merge; they cover
overlapping ground.

**What this decision buys.** The 17 illustrated videos carry no language in the
picture, so Chinese costs a second voice track and nothing else. The bilingual
exposure is now confined to five presenter pieces — see §2.

**What it now demands.** Seventeen separately generated videos have to look like
one series, which makes character consistency the main production risk rather
than a detail. §3a is the cast bible that exists to prevent that.

**Source of truth.** Day copy is `lib/program21.ts` (English) and
`lib/program21Zh.ts` (Chinese). If this document and those files disagree,
the files win — quote from them, don't retype from here.

---

## 1. The slot already exists

`day_progress.video_watched` has been in `supabase/schema.sql` since the
schema was written. Today it is satisfied by a checkbox under a paragraph of
text in the Learn card (`app/program/page.tsx`, around the
`t.programme.day.learn` block): *"I've read this today."*

That is the dryness. Each day currently opens with a research statistic as
prose and a tickbox. The video does not need a new place in the product — it
needs to replace the paragraph as the primary way the day's idea arrives, with
the text staying underneath as the readable fallback.

Two consequences for whoever builds this:

- **The progress field needs no migration.** `video_watched` already means
  what it will mean. The checkbox becomes "watched" rather than "read", or
  gets set on playback completion.
- **The onboarding promise changes.** `t.programme.notStarted.items` currently
  says *"Learn — one idea a day, in a minute of reading."* If a video leads,
  that string and its Chinese twin need rewording. It is build-enforced, so
  changing one without the other fails the build rather than shipping half.

There is no video player for the programme day. `components/howto/Illustration.tsx`
plays silent looping clips inside how-to panels; a narrated daily video is a
different component — it needs real controls, and those controls are subject to
`docs/AGE_FRIENDLY_UI.md` (≥56px, labelled, never icon-only).

---

## 2. Two languages, and the rule that lets English go first

The app ships English and Simplified Chinese, and the Chinese dictionary is
typed against the English one, so a missing translation is a **build error**,
not a silent English leak. Video is the one place that safety net does not
reach: a `.mp4` with a spoken English voice-over will play happily to a
Chinese user and nothing will fail.

This session has already fixed three instances of exactly that bug — English
alt text on all eight figures, and English words baked into two illustrations.
Do not reintroduce it at 21× the scale.

**Recommendation: separate the picture from the language.**

Design every daily video so that the visuals carry no language at all — no
on-screen text, no lip-synced presenter, no captions burned into the frame.
Then the same visual master serves both locales and only the audio track is
produced twice. That turns "make 21 videos twice" into "make 21 videos, write
42 scripts, record 42 voice tracks", which is a materially smaller job.

**That is settled for the 17 illustrated videos** (§0): no words in frame, so
one visual master serves both languages and only the voice-over is produced
twice.

**English is the production language; Mandarin is generated on demand.**
Settled by the user, 2026-08-10. English leads, and a Mandarin cut of any piece
can be produced whenever it is wanted rather than being a gate on shipping.

That removes the schedule problem but **not** the product problem, and the
difference matters:

> Producing Mandarin on demand means the Mandarin video may not exist *yet* on
> the day English ships. What must never happen is a Chinese session playing the
> English one.

So this is an engineering requirement, not just a production note:

- **Resolve the video per locale**, e.g. `/program/day-03.en.mp4` and
  `-zh.mp4`, exactly as every other string in the app resolves.
- **When a locale's video is missing, fall back to the translated Learn text** —
  which already exists in `lib/program21Zh.ts` and is already correct. Never
  fall back to the other language's audio.
- That fallback is what lets English ship the day it is ready without shipping
  a bug, and it means each Mandarin video can be dropped in later with no code
  change.

Ship English first. Backfill Mandarin at whatever pace suits.

---

## 3. House style, already established

Two clips exist and everything new should look like their family:

- **Illustrated, not filmed.** Flat vector style, confident outlines, muted
  palette.
- **The same woman throughout.** White cropped hair, round tortoiseshell
  glasses, sage-green t-shirt, navy cropped leggings, white trainers. Roughly
  60–75. She is the programme's face.
- **Plain rooms.** Wood-panelled wall, wood floor. An earlier take with a sofa,
  side table and window was replaced precisely because the furniture competed
  with the body at the size these render.
- **No text in frame, ever.** One supplied diagram had "Size of the palm"
  baked in and the caption band was cropped off for the reason in §2.
- **Full body in frame, head not clipped**, including at the tallest point of
  a movement.

Existing assets, in `public/howto/`:

| Slug | Asset | Notes |
|---|---|---|
| `sit-to-stand-exercise` | video | front view, one full rep in 8.0s, loops on its own |
| `wall-push-up` | video | side view, 3.3s, built as a reversed-then-forward half rep |
| `band-row` | still image | seated towel row, isometric hold, so one frame says it all |
| `protein-breakfast` | still image | hand with shaded palm, caption cropped off |

The other six how-to slugs are hand-drawn animated SVGs in
`components/howto/Illustration.tsx`, which are cheap and translate-free but
plainly weaker than the illustrated clips. Two slugs —
**`sunday-afternoon-test`** and **`hawker-protein`** — have no figure at all
and render nothing.

---

## 3a. The cast bible

Seventeen videos generated separately will drift unless the cast and set are
pinned in writing and re-stated in every prompt. This section is that pin.
It is derived from the four assets already approved, not invented — so
anything generated against it matches what is live today.

**A reference character already exists** — held by the user in the generation
tool, 2026-08-10. Every one of the seventeen prompts must be driven from that
reference rather than from a written description. Text alone will not hold a
character across seventeen generations; that is the failure this avoids.

> **Next session: record where the reference lives, here, before generating.**
> A hand-off that says "a reference exists" without saying where is a hand-off
> that gets ignored.

The written attributes below therefore serve two purposes rather than one:
they are the **acceptance checklist** for judging whether a generation came
back on-model, and the fallback description if the reference is ever
unavailable. They are not the primary input any more.

### Margaret — the primary subject

Appears in every movement, strength, nutrition and sleep video. She is the
programme's face; a viewer should recognise her by day 3.

| Attribute | Locked value |
|---|---|
| Age read | 60–75 |
| Hair | Short cropped pixie, fully white/silver, soft texture |
| Glasses | Round, thin tortoiseshell/brown frames — always on |
| Build | Average, soft, not athletic. Not a fitness model. |
| Top | Sage-green short-sleeve crew-neck t-shirt |
| Bottom | Navy cropped leggings, mid-calf |
| Feet | **White low-profile trainers with grey accents. Locked 2026-08-10.** Always, including floor exercises. The towel row still is barefoot and is the odd one out — regenerate it with trainers when convenient, or accept it as the single exception and never repeat it. |
| Expression | Calm, warm, faint smile. Capable and unhurried — never strained, never grinning. |
| Skin | Light-medium |

### The set

| Attribute | Locked value |
|---|---|
| Wall | Vertical wood panelling, warm honey/amber tone |
| Floor | Warm wood or terracotta, plain |
| Skirting | Darker wood band where wall meets floor |
| Lighting | Flat, even, no dramatic shadow. A soft contact shadow under the subject only. |
| Props | Only what the exercise needs — armchair, wall, bath towel. Nothing decorative. |
| Rejected | A furnished living room with brown sofa, side table, window and cushions. It was generated, shipped, and replaced: at the size these render, furniture competes with the body, and the body is the instruction. |

### Style

Flat vector illustration with confident dark outlines, muted palette, no
gradients beyond simple shading, no photorealism, no text anywhere in frame.

### Supporting cast and objects

Not every day is Margaret exercising. These recur and should be as pinned as
she is:

- **A friend or small group** — days 7 and 18 (connection, the Okinawan
  *moai*). Same age range, same illustration style, same room or an equally
  plain exterior.
- **A plate** — day 12, the Singapore Longevity Plate. Half vegetables, a
  quarter protein, a quarter wholegrains, read from directly above.
- **Hawker dishes** — days 5, 12 and 20, and the missing `hawker-protein`
  figure. Fish soup, chicken rice, yong tau foo, economy rice. Recognisably
  Singaporean, plainly lit, no branding, no text.
- **A hand** — day 15 finger breathing, and the palm-portion diagram.
  Margaret's hand, same skin tone.

### Prompt hygiene

- Drive **every** prompt from the reference character. Do not rely on a previous
  generation carrying it forward, and do not fall back to describing her in
  words unless the reference is unavailable.
- Generate a still frame first and check it against the table above before
  committing to video — video generations are slower and more expensive to redo.
- Check the trainers specifically. They are the attribute the existing assets
  already disagree about, so they are the one most likely to drift.
- Every clip needs its first and last half-second inspected for drifting text
  or signage before it is accepted (§4).
- Ask for the full body in frame with headroom at the tallest point of the
  movement.

---

## 4. Technical specification

Match these exactly and new assets drop in with no code change beyond a map
entry.

**Video**
- Portrait, height **720px**, width whatever the source aspect gives (existing:
  538×720 and 526×720). Even numbers only.
- **24fps.**
- **H.264** (`-profile:v main -pix_fmt yuv420p -crf 30 -preset slow
  -movflags +faststart`) **and VP9 WebM** (`-b:v 0 -crf 36 -row-mt 1`). Both,
  always: WebM for size, MP4 because iOS Safari needs H.264.
- **No audio track** on how-to loops. Strip it (`-an`) — it is dead weight in a
  muted autoplaying loop. Daily narrated videos obviously keep audio, and will
  need a real player rather than the silent-loop component.
- Budget: how-to loops land at **76–140 kB** each. Keep them there.

**Stills, for every video**
- `<name>.jpg` — poster, a single frame in the video's own framing so nothing
  shifts when the loop starts.
- `<name>-still.jpg` — **two poses side by side**, shown under
  `prefers-reduced-motion`. A single frame shows a position but not a movement,
  and `docs/AGE_FRIENDLY_UI.md` treats that as review-blocking.

**Loops**
- Aim for a clip whose last frame matches its first. Measure it rather than
  eyeballing: decode to raw grayscale and compare frames by mean absolute
  difference. **Under ~3 is seamless; ~10 visibly pops.**
- If the camera drifts so that no two frames match, take a half-rep and play it
  **reversed then forwards**. That is seamless by construction whatever the
  camera does, and for a symmetrical exercise it is also the correct shape.
- Check the first and last half-second for generator artefacts. One supplied
  clip drifted garbled signage into frame after 6.3s and had to be cut short.

**Stills that carry line art**
- If a diagram sits on a white background, set `onWhite` on its `IMAGES` entry
  or it becomes a glaring white card on the dark theme.
- Crop dead margin before shipping. One diagram was 57% empty width; trimming
  to the ink bounding box nearly doubled the drawn subject at panel size.

---

## 5. The twenty-one days

Every day already has three fields: **Learn** (a research idea), **Act** (one
thing to do today), **Reflect** (a private prompt). The video replaces Learn as
the primary carrier and should hand off cleanly into Act.

**Proposed shape for every daily video — 60–75 seconds:**

1. **A recognisable moment, 0–10s.** Not a statistic. The feeling of standing
   up from a low sofa; the walk to the hawker centre. Earn the next 50 seconds.
2. **The idea, 10–35s.** The Learn line, said plainly. Numbers spoken as words.
3. **Today's action, 35–60s.** Exactly what to do, demonstrated where physical.
4. **What to notice, 60–75s.** Leads into the Reflect prompt.

Runtime matters: onboarding promises "one idea a day, in a minute". Going long
breaks a promise the product already made.

| Day | Pillar | The idea in one line | Video note |
|---|---|---|---|
| 1 | Purpose | Purpose lowers all-cause mortality 20% | **PRESENTER.** Opener. Also carries "what these 21 days are". Longest allowance, ~90s. |
| 2 | Healthspan risks | Early-onset family history multiplies your risk | Sensitive: family illness. Warm, non-alarming. Ends on the one biomarker to ask about. |
| 3 | Movement | Zone 2 is easier than people expect | First physical day. Must show the walking pace, not describe it. Pairs with `brisk-walk`. |
| 4 | Strength | Strength and balance are trainable at any age | Introduces the strength snack. Three exercises exist as panels; the video sells the habit, the panels teach form. |
| 5 | Nutrition | After 50 you need more protein, not less | The 25–40g target. Pairs with the palm diagram. |
| 6 | Sleep | Quantity and quality matter equally | Calm register. Bedtime, screens away. |
| 7 | Connection + **reveal** | Isolation is as harmful as 15 cigarettes a day | **PRESENTER.** **Week 1 close.** Doubles as the Longevity Profile reveal, and closes week one. |
| 8 | Movement | Zone 2 is the base for VO2 max | The Talk Test, demonstrated out loud. |
| 9 | Balance | Balance improves within weeks | Pairs with `one-leg-stand`. Show the counter for safety. |
| 10 | Movement | Sitting less matters as much as exercising | Extending the walk by 5 minutes. |
| 11 | Strength | 2×/week, 2 sets of 10 is enough | Progression, not novelty. |
| 12 | Nutrition | The Singapore Longevity Plate | Half veg, quarter protein, quarter grain. Strongly visual. |
| 13 | Movement | Lifestyle activity counts alongside exercise | Stairs, housework, commuting. |
| 14 | Strength | Consistency beats intensity | **PRESENTER.** **Two-week mark** — acknowledge it. |
| 15 | Sleep & stress | Breathing pattern changes stress directly | Pairs with `finger-breathing`. Do the 90 seconds with them, in real time. |
| 16 | Movement | 60–80 year olds gain 15–25% VO2 max | Baseline VO2 max is taken today. |
| 17 | Strength | Muscle grows at 90+ | The most quietly encouraging fact in the programme. |
| 18 | Connection | The Okinawan *moai* | Five friends for life. Cultural, warm. |
| 19 | Purpose | The Sunday Afternoon Test | No figure exists for this — needs one. Reflective. |
| 20 | Nutrition | Ultra-processed food and biological ageing | One swap. Avoid moralising about food. |
| 21 | **Close** | Identity-level commitments persist | **PRESENTER.** **Graduation.** Retake five checks, then declare a Keystone Habit to someone else. |

**Beyond the 21:** an intro that plays before day 1 (the "not started" screen
already has a `previewCaption` slot: *"What a day inside the Challenge looks
like"*), and optionally three weekly openers at days 1, 8 and 15.

**Total to plan for:** 21 daily + 1 intro = **22**, plus 3 weekly openers if
that structure is wanted, plus the how-to gaps in §6.

---

## 6. Second track: exercise demonstrations

Distinct from the daily videos. Silent, looping, no controls, no narration —
they answer "what does this movement look like" and are reused across days.
Cheaper per unit and reusable, so they are the better first spend.

| Slug | Today | Used on days | Priority |
|---|---|---|---|
| `sit-to-stand-exercise` | **video** | 4, 11, 14, 17 | done |
| `wall-push-up` | **video** | 4 | done |
| `band-row` (towel row) | still image | 4, 11 | fine as a still — it is an isometric hold |
| `protein-breakfast` | still image | 5 | done |
| `brisk-walk` | SVG | **3, 8, 10, 16** | **highest** — four days, and the hardest to convey as a drawing |
| `one-leg-stand` | SVG | 9 | high — safety matters, show the counter |
| `finger-breathing` | SVG | 15 | medium — the SVG animates the tracing and works better than most |
| `longevity-plate` | SVG | 12 | medium — a plate is easy to shoot well |
| `hawker-protein` | **nothing** | 5, 12, 20 | **high** — three days, renders nothing today |
| `sunday-afternoon-test` | **nothing** | 19 | low — abstract, may not want a figure at all |

---

## 7. Constraints that will bite

- **Both dictionaries or the build fails.** Any new user-facing string needs
  English and Chinese. This is deliberate; do not loosen the typing to get a
  build through.
- **`docs/AGE_FRIENDLY_UI.md` is review-blocking.** For a video player that
  means ≥56px controls, no icon-only buttons, nothing readable below 16px, and
  a reduced-motion path that still conveys the information. Note the existing
  Learn checkbox is `h-4 w-4` — 16px — and should be fixed when it is touched.
- **Autoplay with sound is blocked** by every mobile browser. A narrated daily
  video cannot autoplay; it needs a real, large play control.
- **The sandbox cannot reach** `*.supabase.co`, `api.stripe.com`,
  `app.proageing.org` or `proageing.org`. Signed-in pages redirect to
  `/signin`, so programme UI must be checked by rendering components in a
  scratch route (delete it before committing — `app/_name` is excluded from
  routing, so use `app/name`).
- **Headless Chromium here has no H.264.** An MP4 reports `error.code 4` even
  when served correctly. Ship WebM alongside and test against that.
- **Deploy is `git push` to `main`** — Vercel builds on push, nothing gates it.
  Run `npx tsc --noEmit && npm run build` first. See `README.md` §Deploying.

---

## 8. Decisions I did not make

For the user, not the next session. Three are answered; two remain.

1. ~~**Presenter or illustration?**~~ **Answered 2026-08-10** — presenter on
   the milestone days, AI-generated illustration for the other seventeen. See
   §0.
2. ~~**Trainers or barefoot?**~~ **Answered 2026-08-10** — trainers, always.
   A reference character now exists too, so §3a is reference-led rather than
   description-led.
3. ~~**Language approach, and does Chinese launch with the videos?**~~
   **Answered 2026-08-10** — English is primary, Mandarin generated on demand.
   Ship English first; see §2 for the per-locale fallback this requires.
4. **Does the video replace the Learn text or sit above it?** Replacing is
   cleaner; keeping the text serves people on poor connections, in quiet
   places, and anyone who would rather read. Recommend keeping it, collapsed.
5. **Seventeen illustrated videos, or fewer?** Days 8–20 are reinforcement, and
   several are near neighbours. A tighter set would cost proportionally less
   and might not feel thinner. Worth settling before generation starts, since
   this is the count that drives the bill.
