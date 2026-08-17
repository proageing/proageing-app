# 21-Day Challenge — video plan and production hand-off

**Purpose.** Everything a fresh session needs to write production plans and
video-generation prompts for the 21-Day Challenge, without first having to
reverse-engineer the app. Read this, then `lib/program21.ts` for verbatim copy.

**Status.** Nothing in this document has been produced yet. Two exercise
demonstration clips exist already (below) and set the house style; the daily
videos do not exist and neither does the player that would show them.

---

## 0. Decided

**Presenter on the milestone days, AI-generated photoreal everywhere else.**
Settled by the user, 2026-08-10. It resolves §2's central question and fixes
the shape of everything downstream.

| | Days | Treatment |
|---|---|---|
| **Presenter** | intro, 1, 7, 14, 21 | A real person to camera. Trust, welcome, milestone, close. |
| **Generated** | 2–6, 8–13, 15–20 | Photoreal from the Higa Soul. Language-free visuals + voice-over. 17 videos. |

Assumption to correct if wrong: "milestone" is read as the pre-programme
intro plus days 1, 7, 14 and 21 — the welcome, the week-1 close that doubles
as the Longevity Profile reveal, the two-week mark, and graduation. If that is
one too many, the intro and day 1 are the pair to merge; they cover
overlapping ground.

**What this decision buys.** The 17 generated videos carry no language in the
picture, so Chinese costs a second voice track and nothing else. The bilingual
exposure is now confined to five presenter pieces — see §2.

**What it now demands.** Seventeen separately generated videos have to look like
one series, which makes character consistency the main production risk rather
than a detail. §3a is the cast bible that exists to prevent that.

**The full count, all decisions settled:**

| | Count |
|---|---|
| Presenter pieces — intro, 1, 7, 14, 21 | 5 |
| Generated daily videos — 2–6, 8–13, 15–20 | 17 |
| **Total programme videos** | **22** |
| Exercise demonstrations still missing (§6) | up to 6 |

All seventeen are wanted — confirmed 2026-08-10. No tighter
set; every day gets its own.

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
prose and a tickbox.

**Decided 2026-08-10: the video leads, and the Learn text stays underneath,
collapsed.** So the Learn card becomes a video with a disclosure beneath it —
open the disclosure and you get today's idea in prose. That serves people on a
poor connection, people who cannot play sound where they are, and people who
would simply rather read.

**There is already a component that does exactly this**: `HowToPanel` is a
collapsed disclosure with a 96px worded toggle — "How to do it" / "Hide" —
built to the age-friendly rules after a 12px chevron was rejected. Copy that
pattern rather than inventing a second one, and the label wants to be about
reading, not about the video: something like *"Read it instead"* / *"Hide"*,
in both dictionaries.

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

**That is settled for the 17 generated videos** (§0): no words in frame, so
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

## 3. House style

**Photorealistic, using the Higa Soul. Decided 2026-08-10** — see §3b for the
reasoning. This replaces the flat vector illustration the first four assets
were made in; those are now legacy and are being migrated.

What carries over from those four unchanged, because it was never about the
rendering style:

- **An anchor plus a cast.** Higa appears often enough to be recognised by day
  3 and holds the days where progression depends on it being the same person;
  other characters hold the days where their presence is the point. The registry
  in §3a says who is on which day, and is the source of truth for casting.
- **One room, always.** Wood-panelled wall with the dado rail, plain light wood
  floor, nothing else. An earlier take with a sofa, side table and window was
  replaced because the furniture competed with the body at the size these
  render — and the set matters more than that now: with several characters, the
  room is what makes different people read as one series. Wardrobe may vary per
  character; the room may not.
- **No text in frame, ever.** One supplied diagram had "Size of the palm"
  baked in and the caption band was cropped off for the reason in §2.
- **Full body in frame, head not clipped**, including at the tallest point of
  a movement.
- **Props only where the exercise needs one** — armchair, wall, bath towel.

And the one rule that keeps the migration small:

> **People are photoreal. Diagrams stay diagrams.**
>
> The palm portion and the Longevity Plate are not competing registers — a
> diagram is a different kind of object, not a worse-looking person. They need
> no work, now or later.

**Photoreal costs more care than illustration, in two specific ways.** Flat
vector hides a multitude of sins; photorealism does not. Expect hands, feet and
joint articulation to need more attempts, and expect **loop seams to be harder
to hit** — the mean-absolute-difference threshold in §4 is stricter in practice
on photoreal footage than on flat colour, because there is far more
high-frequency detail for the eye to catch at the cut.

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

**The references already exist in Higgsfield.** Recorded 2026-08-10 by querying
the account rather than by being told, so these IDs are copied from the API and
not retyped from memory. Every prompt must be driven from one of these rather
than from a written description — text alone will not hold a character across
seventeen generations, and that is the failure this section exists to avoid.

### Where they live

Two mechanisms, and they are **not interchangeable** — which one you pick
dictates which models you can generate with.

**Trained Soul characters** (identity-faithful, one person per generation):

| Name | `soul_id` | Status |
|---|---|---|
| Higa | `7dcf177e-4f4b-4d68-9751-3cfe6282b786` | ready |
| Isaiah | `c6b276ad-f699-4317-a95f-758bf09ab536` | ready |

**Reference Elements** (single image, instant, several subjects allowed in one
shot):

| Name | `element_id` | Created |
|---|---|---|
| Higa-1 | `e6711f2f-9b56-4c48-81d4-07c88f6b6ffc` | 2026-08-10, newest |
| Higa | `2570b873-518c-49f9-8262-41b96c5aa9fc` | 2026-08-08 |
| Isaiah | `b373d660-93a7-4c68-8c14-51fb589169d5` | 2026-08-08 |
| Zoid | `84cd1c46-52b8-4e78-9d44-7b03102d9bf6` | 2026-08-03 |

### Which is which

Read from the names, and the mapping onto §0 is almost too neat:

- **Higa → the seventeen daily videos.** The woman described below.
  Both a Soul and two Elements exist for her; `Higa-1` is the newest Element.
- **Isaiah → the five presenter pieces.** The account holder, i.e. the
  presenter. Also has both a Soul and an Element.
- **Zoid** — unidentified, oldest, and probably unrelated to this programme.

**Confirmed by the user, 2026-08-10.** Higa is the programme's woman, and of
the two Elements the newest — **`Higa-1`** — is canonical. Use that one; the
older `Higa` element is superseded and should not be picked up mid-batch.

More characters are coming: the user is generating additional ones, which the
supporting cast below needs anyway (the friend for days 7 and 18). Add them to
these tables as they appear, with IDs read from the API rather than retyped.

### The Soul is photoreal — confirmed 2026-08-10

Job `a1ee7c2a-4cb5-4787-b3c3-872ee107fedd` was run to answer this, and the
answer is unambiguous: the trained Soul returns **photorealism**, not flat
vector illustration. The prompt was otherwise followed closely — wardrobe, set,
lighting, full body with headroom, no props, no text all came back as asked.

**As the Soul actually renders her**, which differs from the illustrated
character the attributes below were originally derived from:

| | Soul (photoreal, canonical) | Retired illustration (legacy assets) |
|---|---|---|
| Ethnicity | Reads East Asian | Ambiguous, reads Western |
| Age | Mid 50s to 60s | 60–75 |
| Hair | Silver-grey, cropped, side-parted | Fully white pixie |
| Glasses | Round tortoiseshell | Round tortoiseshell — matches |
| Wardrobe | Sage tee, navy cropped leggings, white trainers | Same — matches |
| Set | Honey wood panelling with a **darker dado rail at waist height**, light wood floor | Honey panelling, darker skirting only |

Two things worth noting from that. The wardrobe and set transfer cleanly, so
the bible was doing its job. And the dado rail is a distinctive set feature the
earlier assets do not have — lock it or drop it, but do not let it appear in
half the series.

**This is a real fork and it is the user's call.** See §3b.

### The constraint that changes the plan

A trained Soul takes **one person per generation**. Multi-subject shots cannot
use it and must use Elements instead.

That lands on two specific days: **day 7** (reach out to one person) and
**day 18** (the Okinawan *moai*, a group of about five friends) both need more
than one person in frame. Plan those two for the Element path from the start
rather than discovering it mid-batch. The same applies to any shot pairing her
with a friend.

Model compatibility follows from the choice: a Soul only generates on Soul V2
and Soul Cinema, while Elements work across the Nano Banana, GPT Image,
Seedream, Cinema Studio, Seedance and Kling families and **not** on the Soul
models. So the reference decides the model, not the other way round.

### What the written attributes are now for

Since prompts are reference-led, the attribute tables are no longer the primary
input. They are the **acceptance checklist** — what to hold a returned
generation against to see whether it came back on-model — and the fallback
description if a reference is ever unavailable.

### Why the cast is more than one person

An earlier draft of this document said "the same woman throughout", and that
was doing real work: a viewer should recognise the demonstrator by day 3, and
recognition is what makes a series feel like a series rather than a folder of
clips.

But one woman cannot carry twenty-two videos for **this** audience. The app
serves adults 45–70 in Singapore. That is Chinese, Malay and Indian, and it is
both sexes. A programme where every single demonstration is one East Asian
woman quietly tells a 62-year-old Malay man that it was not built for him — and
he is exactly who the strength and balance days most need to reach.

So the cast grows, but not into a random rotation. The structure that keeps
both properties:

- **One anchor.** Higa appears often enough to be recognised, and holds the
  days that build across the programme — the strength snack and the walking
  streak, where "harder than day 4" only means something if it is the same
  person.
- **A supporting cast with reasons**, each appearing on days where their
  presence is the point rather than decoration. Connection days genuinely need
  more than one person. Hawker and nutrition days are where Singapore's
  diversity is most visible in real life.
- **Nobody appears once.** A face seen a single time reads as stock footage. If
  a character is worth adding, they are worth two or three days.

### Cast registry

The live record. Add rows as characters are trained, with IDs read from the API
rather than retyped, and fill the Days column at the same time — a character
with no days is a character nobody has decided how to use.

| Character | Role | Soul ID | Element ID | Days |
|---|---|---|---|---|
| **Higa** | Anchor demonstrator | `7dcf177e-4f4b-4d68-9751-3cfe6282b786` | `Higa-1` `e6711f2f-9b56-4c48-81d4-07c88f6b6ffc` | 3, 4, 8, 9, 10, 11, 14, 16, 17 |
| **Isaiah** | Presenter | `c6b276ad-f699-4317-a95f-758bf09ab536` | `b373d660-93a7-4c68-8c14-51fb589169d5` | intro, 1, 7, 14, 21 |
| **Rahimah** | Nutrition & breathing | *not yet trained* | *not yet created* | 5, 12, 15, 20 |
| **Wei Ming** | Everyday activity & the reflective days | *not yet trained* | *not yet created* | 2, 6, 13, 19 |
| **The moai** | Group, days about other people | **n/a — Element only** | *not yet created* | 7, 18 |

Names are working labels so prompts and file names have something unambiguous to
say — "the woman" stopped being unambiguous the moment the cast grew past one.
Change them freely; what must not change once a Soul is trained is the
attribute block it was trained against.

**Confirmed 2026-08-17: Higa, plus one Malay woman and one Chinese man.**
Days were settled first and hold whoever fills the role.

| Role to add | Why | Days | Count |
|---|---|---|---|
| **Wei Ming — a Chinese man, 55–70** | No man appears anywhere in a programme sold to both sexes. Day 13 is the strongest fit in the whole calendar — lifestyle activity is stairs, housework and the commute, the most ordinary physical day there is. Day 2 matters more than it looks: it ends on *ask your doctor about one biomarker*, and men are the least likely to. Days 6 and 19 are reflective, where a second recognisable face stops the series being single-voiced. | 2, 6, 13, 19 | 4 |
| **Rahimah — a Malay woman, 50–65** | Nutrition days are where Singapore's diversity is most visible in real life, and 5/12/20 are exactly the three days the `hawker-protein` demonstration serves — one character covers that whole slug. **Day 15 is deliberate:** confining the only Malay character to the three food days would typecast her as "the food one", which is a worse outcome than not adding her. 15 is breathing, done in real time, and belongs to nobody in particular. | 5, 12, 15, 20 | 4 |
| **The moai — a small mixed group, 50–70** | Days 7 and 18 are *about* other people. One person cannot depict a *moai*. Element path, not Soul — see the checklist. | 7, 18 | 2 |

**Two corrections made 2026-08-17, both to this table rather than to reality.**
An earlier version put the man on days 11, 13 and 17. Days 11 and 17 are Higa's,
and they are precisely the progression days the anchor rule exists to protect —
the proposal contradicted the rule three paragraphs above it. Separately, the
earlier assignment left **days 2, 6, 15 and 19 with no character at all**. Both
are fixed above.

**Coverage, now complete.** Every day 1–21 has someone, and nobody appears once:

| Character | Days | Count |
|---|---|---|
| Higa (anchor) | 3, 4, 8, 9, 10, 11, 14, 16, 17 | 9 |
| Isaiah (presenter) | intro, 1, 7, 14, 21 | 5 |
| Wei Ming — Chinese man, 55–70 | 2, 6, 13, 19 | 4 |
| Rahimah — Malay woman, 50–65 | 5, 12, 15, 20 | 4 |
| The moai — mixed group | 7, 18 | 2 |

Days 7 and 14 carry two entries each on purpose: 7 is the presenter plus the
group, 14 is the presenter plus Higa demonstrating. Both need the Element path.

### Adding a character — the checklist

Each new character costs more than one generation, and skipping any of these is
how a cast drifts:

1. **Train a Soul** for solo shots, so the identity holds across days.
2. **Create an Element** as well. Souls take **one person per generation**, so
   any shot with two or more people needs Elements — and a character who will
   ever appear beside another needs both.
3. **Record both IDs in the registry above**, read from the API.
4. **Assign days**, and check the character appears on at least two.
5. **Write an attribute block** below, in the same shape as Higa's, so there is
   an acceptance checklist for them too.
6. **Keep the set identical.** Wardrobe may differ per character; the room must
   not. The wood panelling, dado rail, floor and flat lighting are what make
   different people read as one series.
7. **Generate one still and check it** before any video.

### Higa — the anchor demonstrator

Appears on the movement and strength days that build across the programme,
where progression only means something if it is visibly the same person.

**Canonical values are what the Soul actually produces**, verified against job
`a1ee7c2a` on 2026-08-10 — not what the retired illustration looked like. Where
the two differed, the Soul wins, because it is what will be generating.

| Attribute | Locked value |
|---|---|
| Ethnicity | Reads East Asian. Part of the point — see §3b. |
| Age read | Mid 50s to 60s |
| Hair | Silver-grey, cropped short, side-parted |
| Glasses | Round, thin tortoiseshell frames — always on |
| Build | Average, not athletic. Not a fitness model. |
| Top | Sage-green short-sleeve crew-neck t-shirt |
| Bottom | Navy cropped leggings, mid-calf |
| Feet | **White low-profile trainers with grey accents. Locked 2026-08-10.** Always, including floor exercises. |
| Expression | Calm, warm, faint smile. Capable and unhurried — never strained, never grinning. |

Superseded, for reference only: the retired illustration was a fully white
pixie cut on an ethnically ambiguous figure reading 60–75, and its towel-row
still was barefoot. Do not generate against any of that.

### Rahimah — nutrition and breathing

Malay woman. Holds the three nutrition days plus day 15, so she is the face of
the food content without being *only* the food content.

**Not yet trained.** These values are the specification to train and generate
*against*, and unlike Higa's they have not been confirmed by a returned
generation — so treat any disagreement as the generation being wrong until a
still has been inspected and this table updated to what the Soul actually does.
Higa's block was rewritten once for exactly this reason.

| Attribute | Target value |
|---|---|
| Ethnicity | Reads Malay Singaporean |
| Age read | Early 50s to low 60s |
| Hair | Dark brown, covered by a plain fitted headscarf in a muted colour — **decide once and lock it**, since it is the most recognisable thing about her silhouette |
| Glasses | None |
| Build | Average. Not athletic — the same rule as Higa, for the same reason. |
| Top | Long-sleeve tunic top, dusty rose, loose enough to move in |
| Bottom | Loose navy trousers, full length |
| Feet | White low-profile trainers, matching the cast standard |
| Expression | Warm, direct, unhurried. She is often talking about food, which should read as pleasure rather than instruction. |
| Hands | Hers are the hands in the day 15 breathing shots and should match the palm-portion diagram's skin tone |

A note that will matter on days 5, 12 and 20: the food in frame must be food she
would plausibly eat. Nutrition content that puts a Malay character in front of a
plate of char siew is worse than having no character at all.

### Wei Ming — everyday activity and the reflective days

Chinese man. Holds day 13 (stairs, housework, the commute — the most ordinary
physical day in the calendar), day 2 (family history, which ends on *ask your
doctor about one biomarker*), and days 6 and 19, where a second recognisable
face keeps the series from being single-voiced.

**Not yet trained** — same caveat as Rahimah's block above.

| Attribute | Target value |
|---|---|
| Ethnicity | Reads Chinese Singaporean |
| Age read | Late 50s to high 60s. Deliberately reads slightly older than Higa. |
| Hair | Black going grey at the temples, short, neatly combed |
| Glasses | None — keeps him distinct from Higa at a glance, which matters more than either choice on its own |
| Build | Average, slight softness at the middle. He is a man who walks, not a man who trains. |
| Top | Pale blue short-sleeve collared polo, tucked loosely |
| Bottom | Stone-grey chinos |
| Feet | White low-profile trainers, matching the cast standard |
| Expression | Steady, a little dry. Days 2 and 19 are the two most serious days in the programme; he should look like someone you would take a straight answer from. |

Day 13 is the one day that legitimately leaves the room — stairs and a commute
cannot be shot against wood panelling. It is the documented exception to the
set rule below, and the only one.

### The moai — days 7 and 18

Not a Soul. **Element only**, because a Soul takes one person per generation and
these two days exist to show more than one person.

| Attribute | Target value |
|---|---|
| Size | Four to five people. Enough to read as a group, few enough that faces stay legible at phone size. |
| Mix | Mixed sexes, and **this is where an Indian face belongs** — the confirmed solo cast is East Asian, Malay and Chinese, so without it the programme has no Indian representation at all. |
| Age read | 50 to 70, varied within it |
| Wardrobe | The cast palette — sage, dusty rose, pale blue, stone, navy — so the group reads as the same world as the solo days |
| Arrangement | Seated or standing in conversation, turned toward each other rather than at camera. Day 18 is about five friends for life, not a group photo. |
| Feet | Trainers, but do not fight for uniformity here — a group in identical shoes reads as a uniform |

**Whether the group can be built from the individual characters' Elements —
so the *moai* is faces the viewer already knows from earlier days — is
technically unverified.** It would be the stronger version by a wide margin. Do
not plan on it until someone has confirmed that multi-Element generation
actually holds several identities in one frame; the fallback is a single group
Element generated from one image.

### The set

| Attribute | Locked value |
|---|---|
| Wall | Vertical wood panelling, warm honey/amber tone, with a **darker wood dado rail at waist height** — present in the Soul's output, absent from the legacy assets, so lock it everywhere rather than in half the series |
| Floor | Plain light wood |
| Skirting | Darker wood band where wall meets floor |
| Lighting | Flat, even, no dramatic shadow. A soft contact shadow under the subject only. |
| Props | Only what the exercise needs — armchair, wall, bath towel. Nothing decorative. |
| Rejected | A furnished living room with brown sofa, side table, window and cushions. It was generated, shipped, and replaced: at the size these render, furniture competes with the body, and the body is the instruction. |
| **Documented exception** | **Day 13 only.** Lifestyle activity is stairs, housework and the commute, and none of those can be shot against wood panelling without lying about what the day is. Keep the wardrobe, lighting and palette identical so it still reads as the same series; the room is what gives. No other day may leave the set. |

### Style

Photorealistic. Solo days generate from **that day's own Soul** on
`text2image_soul_v2` / `soul_cinema_studio` — Higa's is the only one trained so
far, and the register it returned (verified, job `a1ee7c2a`) is the target the
others should match. Multi-person days (7, 14, 18) take the Element path on a
non-Soul model instead, which is a hard constraint, not a stylistic choice.

Flat even lighting, no dramatic shadow, one soft contact shadow under the
subject. Muted palette. No text anywhere in frame. The cast palette is sage
(Higa), dusty rose (Rahimah), pale blue and stone (Wei Ming) — different enough
to tell people apart in a thumbnail, close enough to read as one series.

### Objects, which need pinning too

Not every day is a person exercising:

- **A plate** — day 12, the Singapore Longevity Plate. Half vegetables, a
  quarter protein, a quarter wholegrains, read from directly above. Stays a
  diagram.
- **Hawker dishes** — days 5, 12 and 20, and the missing `hawker-protein`
  figure. Fish soup, chicken rice, yong tau foo, economy rice, thosai.
  Recognisably Singaporean, plainly lit, no branding, no text.
- **A hand** — day 15 finger breathing, and the palm-portion diagram. Match it
  to whichever character holds that day.

### Prompt hygiene

- Drive **every** prompt from that day's reference character. Do not rely on a
  previous generation carrying it forward, and do not fall back to describing
  them in words unless the reference is unavailable.
- **Check the registry for who is on this day** before writing the prompt. With
  more than one character in the cast, "the woman" is no longer unambiguous.
- Generate a still frame first and check it against that character's attribute
  block before committing to video — video generations are slower and more
  expensive to redo.
- **Multi-character shots must use Elements, never a Soul.** One person per Soul
  generation is a hard limit, not a preference.
- Check the trainers and the set specifically. Trainers are the attribute the
  legacy assets already disagree about; the set is what holds a multi-character
  cast together, so a wrong room is worse than a wrong shirt.
- Every clip needs its first and last half-second inspected for drifting text
  or signage before it is accepted (§4).
- Ask for the full body in frame with headroom at the tallest point of the
  movement.

---

## 3b. Why photoreal — decided

Settled by the user 2026-08-10, after job `a1ee7c2a` showed the Soul renders
photorealism. The seventeen daily videos are photoreal, and the human
demonstrations migrate to match.

The reasoning, worth keeping because it will be questioned later:

- **Trust.** This is health instruction for people in their sixties and
  seventies. A real-looking person carries authority a cartoon does not.
- **Representation.** She reads East Asian. The retired illustration read as
  nothing in particular, and for a Singaporean audience a Singaporean-looking
  woman is worth more than a stylistic preference.
- **It costs nothing linguistically.** She demonstrates rather than talks to
  camera, so photoreal is exactly as language-free as illustration and §2's
  whole argument survives untouched.
- **It unifies rather than splits.** The five presenter days are a real human
  being. Photoreal daily videos sit beside them naturally; illustrated ones
  would have been a second register inside one product.

### The migration

Three human demonstrations to regenerate with the Soul. Everything else stays.

| Asset | Action |
|---|---|
| `sit-to-stand` video + poster + two-pose still | Regenerate photoreal |
| `wall-push-up` video + poster + two-pose still | Regenerate photoreal |
| `towel-row` still | Regenerate photoreal — also fixes the barefoot exception |
| `palm-portion`, `longevity-plate` | **No change.** Diagrams stay diagrams. |
| `brisk-walk`, `one-leg-stand`, `finger-breathing` | Currently SVG. Produce photoreal rather than migrating anything. |

Not urgent, and explicitly **not a blocker on the seventeen**. The legacy
illustrated clips are correct instruction and can keep working while the daily
videos ship. But note the one place the mismatch is visible within a single
screen: **days 4 and 11** show a daily video and the `sit-to-stand` panel
inches apart. If the migration slips, those two days are where someone notices,
so do them first.

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

**Who is in each day is in §3a's cast registry, not this table** — one place, so
the two cannot drift. Days 7 and 18 need more than one person in frame and
therefore the Element path rather than a Soul.

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
| `sit-to-stand-exercise` | **video**, legacy illustrated | 4, 11, 14, 17 | migrate first — shares a screen with the day 4 and 11 videos |
| `wall-push-up` | **video**, legacy illustrated | 4 | migrate |
| `band-row` (towel row) | still image, legacy illustrated | 4, 11 | migrate; a still is still the right form, it is an isometric hold |
| `protein-breakfast` | still image, diagram | 5 | **no change** — diagrams stay diagrams |
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

## 8. Decision log

Every decision is settled — the next session can execute without asking
anything. What is *not* done is asset creation; see the note under the table.

| Decided | Answer |
|---|---|
| Presenter or generated | Presenter on intro, 1, 7, 14, 21. AI-generated for the other 17. |
| Character consistency | References drive every prompt; the attribute blocks are the acceptance checklist. §3a. |
| Footwear | White low-profile trainers, always, including floor exercises. |
| Language | English primary, Mandarin generated on demand. Ship English first, per-locale resolution with a fallback to the translated text. |
| Learn text | Video leads; text stays beneath, collapsed, behind a `HowToPanel`-style worded toggle. |
| How many | All seventeen. Every day gets its own video. |
| Visual register | **Photoreal**, via the Higa Soul. The three human demonstrations migrate; diagrams stay diagrams. |
| Cast | **Settled 2026-08-17: five entries.** Higa anchors (East Asian woman, 9 days). Isaiah presents (5). **Rahimah**, a Malay woman, takes 5, 12, 15, 20. **Wei Ming**, a Chinese man, takes 2, 6, 13, 19. **The moai**, a mixed group, takes 7 and 18. All 21 days covered; nobody appears once. §3a. |
| Where an Indian face goes | The *moai* on days 7 and 18. The solo cast is East Asian, Malay and Chinese, so this is the only place it appears — which makes it a requirement of that group's spec, not a nice-to-have. |
| Day 13 leaves the set | Yes, and it is the only day that may. Stairs and a commute cannot be shot against wood panelling. Wardrobe, lighting and palette stay identical. |

Reference character locations are recorded in §3a. Higa's are live — Soul
`7dcf177e`, Element `Higa-1` — as are Isaiah's.

**What is decided versus what still has to be made.** Every *decision* is
closed. Three assets are not: Rahimah's Soul and Element, Wei Ming's Soul and
Element, and the *moai* Element all have to be created, and their attribute
blocks in §3a are specifications rather than verified records. Higa's block had
to be rewritten once against what her Soul actually returned; expect the same
for these two, and update §3a to match reality rather than generating repeatedly
against a table that turned out to be wrong.

One open technical question, flagged rather than assumed: whether several
Elements can hold several identities in one frame, which would let the *moai* be
faces the viewer already knows. Worth ten minutes to establish before days 7 and
18 are planned either way.

---

## 9. Suggested running order

Not a decision, a de-risking sequence. The expensive mistake available here is
generating seventeen videos and then discovering the runtime, the voice or the
player is wrong.

1. **One pilot, end to end. Day 3.** It is the first physical day, its idea
   (Zone 2 is easier than you think) is representative, and `brisk-walk` is
   also the highest-value demonstration gap — so the work is not wasted
   whatever the pilot teaches. Take it all the way: script, generate, voice,
   encode, drop into the app, watch it on a phone.
2. **Approve the pilot against four things**: does it hold to 60–75 seconds,
   does the voice suit a 60–75 year old audience, does the character match the
   reference, and does it actually feel less dry than the paragraph it
   replaced. If the answer to the last one is no, the format is wrong and
   sixteen more will not fix it.
3. **Build the player against the pilot** — per-locale resolution, the
   collapsed text disclosure, `video_watched` set on playback, controls at
   ≥56px. One real asset makes this concrete in a way a placeholder does not.
4. **The demonstration work, in this order**: `hawker-protein` (three days,
   renders nothing at all today), then `sit-to-stand` — the one legacy asset
   that shares a screen with a daily video, on days 4 and 11 — then the rest of
   §3b's migration. All silent, language-free and reused across days.
5. **Train the rest of the cast before batching anything that needs them.**
   Each new character wants a Soul *and* an Element, IDs in the registry, and
   days assigned. A day whose character does not exist yet cannot be generated,
   so this gates part of step 6 rather than running alongside it.
6. **Batch the remaining sixteen videos.** By now the format, voice, player and
   cast are all fixed, so this is production rather than design.
7. **The five presenter pieces, in parallel from step 3 onwards.** They need a
   human and a diary, so they are the long-lead item — start scheduling early
   even though they ship last.

One more thing worth doing before step 5: watch the pilot with someone in the
actual audience. Everything in this document is reasoned from research and from
the product's own rules, and none of that is the same as a 68-year-old telling
you the video was too fast.
