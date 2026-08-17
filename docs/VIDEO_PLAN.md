# 21-Day Challenge — video plan and production hand-off

**Purpose.** Everything a fresh session needs to write production plans and
video-generation prompts for the 21-Day Challenge, without first having to
reverse-engineer the app. Read this, then `lib/program21.ts` for verbatim copy.

**Status.** Nothing in this document has been produced yet. Two exercise
demonstration clips exist already (below) and set the house style; the daily
videos do not exist and neither does the player that would show them.

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

## 2. The decision that shapes every other decision: two languages

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

If a talking-head presenter is wanted instead — and there is a real argument
for it, since a face builds trust that an illustration cannot — then accept
one of these and say which:

| Option | Cost | Honest downside |
|---|---|---|
| Shoot once, dub audio only | 1 shoot, 2 audio | Lip sync visibly wrong in the second language |
| Shoot twice, once per language | 2 shoots | Doubles the most expensive part |
| Shoot English, subtitle Chinese | 1 shoot, 1 subtitle pass | Subtitles are small text, which this audience reads worst |
| Presenter for weekly framing only, illustrated for daily | 3–4 shoots | Two visual registers in one product |

The last row is the pragmatic middle and is what I would plan for unless told
otherwise: a human face at the three or four moments that carry emotional
weight, language-free illustration for the twenty-one daily explainers.

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
| 1 | Purpose | Purpose lowers all-cause mortality 20% | Opener. Also carries "what these 21 days are". Longest allowance, ~90s. |
| 2 | Healthspan risks | Early-onset family history multiplies your risk | Sensitive: family illness. Warm, non-alarming. Ends on the one biomarker to ask about. |
| 3 | Movement | Zone 2 is easier than people expect | First physical day. Must show the walking pace, not describe it. Pairs with `brisk-walk`. |
| 4 | Strength | Strength and balance are trainable at any age | Introduces the strength snack. Three exercises exist as panels; the video sells the habit, the panels teach form. |
| 5 | Nutrition | After 50 you need more protein, not less | The 25–40g target. Pairs with the palm diagram. |
| 6 | Sleep | Quantity and quality matter equally | Calm register. Bedtime, screens away. |
| 7 | Connection + **reveal** | Isolation is as harmful as 15 cigarettes a day | **Week 1 close.** Doubles as the Longevity Profile reveal. Emotional peak — presenter candidate. |
| 8 | Movement | Zone 2 is the base for VO2 max | The Talk Test, demonstrated out loud. |
| 9 | Balance | Balance improves within weeks | Pairs with `one-leg-stand`. Show the counter for safety. |
| 10 | Movement | Sitting less matters as much as exercising | Extending the walk by 5 minutes. |
| 11 | Strength | 2×/week, 2 sets of 10 is enough | Progression, not novelty. |
| 12 | Nutrition | The Singapore Longevity Plate | Half veg, quarter protein, quarter grain. Strongly visual. |
| 13 | Movement | Lifestyle activity counts alongside exercise | Stairs, housework, commuting. |
| 14 | Strength | Consistency beats intensity | **Two-week mark** — acknowledge it. |
| 15 | Sleep & stress | Breathing pattern changes stress directly | Pairs with `finger-breathing`. Do the 90 seconds with them, in real time. |
| 16 | Movement | 60–80 year olds gain 15–25% VO2 max | Baseline VO2 max is taken today. |
| 17 | Strength | Muscle grows at 90+ | The most quietly encouraging fact in the programme. |
| 18 | Connection | The Okinawan *moai* | Five friends for life. Cultural, warm. |
| 19 | Purpose | The Sunday Afternoon Test | No figure exists for this — needs one. Reflective. |
| 20 | Nutrition | Ultra-processed food and biological ageing | One swap. Avoid moralising about food. |
| 21 | **Close** | Identity-level commitments persist | **Graduation.** Retake five checks, declare a Keystone Habit to someone. Presenter candidate. |

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

For the user, not the next session:

1. **Presenter or illustration for the daily videos?** §2 lays out the cost of
   each. This determines almost everything downstream.
2. **Does Chinese launch with the videos, or later?** Shipping English-only
   video to a bilingual product is a visible gap, but a deliberate one is
   better than an accidental one.
3. **Does the video replace the Learn text or sit above it?** Replacing is
   cleaner; keeping the text serves people on poor connections, in quiet
   places, and anyone who would rather read. Recommend keeping it, collapsed.
4. **21 videos or fewer?** Days 8–20 are reinforcement, and several are near
   neighbours. A tighter set — 7 pillar videos plus short weekly check-ins —
   would cost a third as much and might not feel thinner.
