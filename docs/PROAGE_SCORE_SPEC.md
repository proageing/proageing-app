# ProAge Functional Score — scoring specification v0.1

Built entirely from the cut-offs already implemented in `lib/assessments/*.ts`,
as documented in `PROAGE_NORMS.md`. No external norm set is introduced except
where explicitly marked `EXTRAPOLATED` or `NEW SOURCE REQUIRED`.

---

## 1. Which checks can carry a score

| # | Check | Range | Direction | Role | Rationale |
|---|---|---|---|---|---|
| 1 | Sit-to-Stand | reps/30s | Higher better | **Capacity — scored** | Responsive in 21 days; norms already coded |
| 2 | Balance | 0–60s | Higher better | **Capacity — scored** | Responsive; norms already coded |
| 3 | VO2max (HR ratio) | computed | Higher better | **Excluded — see §5** | Structurally invalid as coded |
| 4 | Nutrition/Protein | 0–32 | Higher better | Momentum (secondary) | Food-frequency, slow-moving |
| 5 | Sleep (PSQI) | 0–21 | **Lower better** | Baseline + 90d only | 1-month recall window — see §6 |
| 6 | Connection (LSNS-6 + UCLA-3) | see below | **Mixed** | Momentum (secondary) | Polarity trap — see §7 |
| 7 | Cognitive (SLAS) | 0–13 | **Lower better** | Baseline gate only | 6 of 13 pts immutable — see §8 |
| 8 | Family History | categorical | n/a | Baseline gate only | Immutable |
| 9 | Purpose (Ikigai-9) | 9–45 | Higher better | Identity metric | Trait-like; expect small 21d change |

### 1.1 Why this table isn't about which traits are modifiable

It's tempting to read "Capacity — scored" vs. everything else as a claim that
strength and balance respond to training and cardio fitness or sleep don't.
That's backwards — cardio fitness is arguably *more* trainable over 21 days
than balance is, and sleep quality clearly changes with behaviour. The line
being drawn is about **measurement validity for a 21-day retest**, not
modifiability of the underlying trait:

- **Sit-to-Stand and Balance are scored** because they're objective,
  in-the-moment physical performance tests. Retest them and the number you
  get is a clean, direct measurement of right now — nothing about the test
  itself confounds a Day 1 vs. Day 21 comparison.
- **VO2max is excluded, not because cardio fitness is hard to move, but
  because the current implementation can't validly show whether it moved**
  (§5): the estimate formula has no sex term while the classification table
  is sex-split, so identical inputs produce systematically different labels
  by sex — and separately, the whole estimate is driven by a single manual
  resting-heart-rate reading, where ordinary reading noise (±2bpm) shifts
  the result more than any real 21-day training effect would. Fix the
  measurement (§5.3) and this changes.
- **Sleep is excluded, not because sleep doesn't improve, but because PSQI
  asks about the past month** (§6). A Day 21 retest using PSQI necessarily
  asks about a window that mostly overlaps the pre-programme baseline, so a
  score change can't be cleanly attributed to 21 days of programme
  behaviour — that's a property of *this instrument's own recall window*,
  not evidence sleep is static.

If VO2max's formula/table mismatch gets fixed (or it's replaced by the step
test in §5.3) and Sleep's 21-day tracking moves to a nightly log instead of
PSQI, there's a legitimate case for a three- or four-domain score. That's an
open product decision this spec deliberately doesn't make.

---

## 2. ProAge Capacity Score (0–100)

Measured function only. Retest Day 1 / Day 21 / 90 days.

| Domain | Test | Weight |
|---|---|---|
| Strength | 30s Sit-to-Stand | 60 |
| Balance | One-leg stand, eyes open | 40 |

Two domains, not three, because VO2 is excluded (§5). Name it honestly in the
UI — **"Strength & Balance Score"** — until a third domain is restored (§5.3).

### 2.1 Strength anchors

Your code stores Rikli & Jones *normal ranges*, which are the 25th–75th
percentiles. Floor and ceiling below are the 5th and 90th percentiles derived
from those by normal approximation (SD = IQR / 1.349).

| Sex | Age band | Typical (coded) | **Floor** | **Ceiling** |
|---|---|---|---|---|
| Female | 50–59 `EXTRAPOLATED` | 14–19 | 10 | 21 |
| Female | 60–64 | 12–17 | 8 | 19 |
| Female | 70–74 | 10–15 | 6 | 17 |
| Female | 80–84 | 9–14 | 5 | 16 |
| Male | 50–59 `EXTRAPOLATED` | 16–21 | 12 | 23 |
| Male | 60–64 | 14–19 | 10 | 21 |
| Male | 70–74 | 12–17 | 8 | 19 |
| Male | 80–84 | 10–15 | 6 | 17 |

```
strength = 60 × clamp((reps − floor) / (ceiling − floor), 0, 1)
```

Worked: Female 62, 12 reps → 60 × (12−8)/(19−8) = **21.8**
Day 21, 15 reps → 60 × (15−8)/(19−8) = **38.2**  (+16.4; ≈5.5 pts per rep)

### 2.2 Balance scoring — do not use percentile anchors

The Seino mean±SD values produce negative 5th percentiles for the 80+ bands
and 90th percentiles above the 60s test cap for every band under 80. The
distribution is censored and right-skewed; a normal approximation is invalid
on it. Use a **sufficiency target** instead:

```
balance = 40 × sqrt( min(seconds, 30) / 30 )
```

| Seconds | Points |
|---|---|
| 0 | 0.0 |
| 3 | 12.6 |
| 5 | 16.3 |
| 8 | 20.7 |
| 12 | 25.3 |
| 20 | 32.7 |
| 30+ | 40.0 |

The square root front-loads early gains, which matches both the functional
reality (3s→8s matters far more than 45s→50s) and the motivation requirement.
The 30s target is a sufficiency threshold, not a percentile — beyond it,
balance is not the limiting factor and the app should say "maintain".

Keep the coded `<5s` Vellas fall-risk flag as a **separate visual flag**. It
must never be absorbed into the score.

### 2.3 Interpretation bands

| Score | Label |
|---|---|
| 85–100 | Thriving |
| 70–84 | Strong & growing |
| 55–69 | Building capacity |
| 40–54 | Early progress |
| <40 | Starting out |

---

## 3. ProAge Momentum (weekly completion count, resets each week)

Self-reported behaviour only. Never blended into Capacity.

**Scoped to whatever guided programme the user is enrolled in — the 21-Day
Challenge today, and designed to generalize to future programmes (a 90-Day
Transformation, or whatever comes next), not to the account as a whole.**
Someone with no active programme enrollment has no Momentum to show,
because these daily actions were never asked of them. The Longevity
Dashboard (`PROAGE_DISPLAY_LOGIC.md`) reflects this directly — Momentum,
and all Day 1/Days 2–20/Day 21 phase language, live only in the programme
experience, not on the dashboard.

### 3.1 What it measures, and why it's this simple

Two earlier designs were tried and rejected before this one:

1. A 5-category weighted score (Movement/Strength/Protein/Sleep/Connection,
   each with its own weekly target and point value) — rejected because the
   programme doesn't offer those categories evenly across weeks (Week 1 has
   exactly one Movement day; Week 2 has three), so a fixed weekly target
   like "6 of 7" didn't correspond to anything the programme actually asks
   for that week.
2. A separate daily 5-checkbox self-report, independent of that day's own
   themed action — rejected because it duplicated the Act card's existing
   "Done for today" checkbox and asked the same question twice in different
   words, which is exactly the kind of friction that loses engagement in an
   older audience.

**What shipped instead: Momentum is the existing daily "Done for today"
completion, tallied across the programme's own 7-day weeks — nothing else.**
No new checkbox, no category breakdown, no points to explain. If the day's
action is done, it counts; if it isn't, it doesn't. The target is always
"7 for a full week" — simple and constant, not something that changes
depending on which theme a given week happens to cover.

This is still tied to real behaviour-change mechanics, not just simplified
for its own sake: habit automaticity comes from *consistent repetition in a
stable context*, not from which specific action is repeated (Lally et al.,
2010, *Eur. J. Soc. Psychol.*) — a missed day doesn't reset the process, but
frequency of repetition is what drives it. A plain day-count is a more
faithful readout of that mechanism than a weighted, multi-category score
would be, and it's something a senior can read in the time it takes to
glance at a streak.

Weekly reset matters for the same reason as before: a cumulative 21-day
figure punishes a bad Week 1 permanently, which is exactly when dropout
happens.

---

## 4. Responder thresholds for public reporting

Use these — not the score delta — for any published percentage.

| Measure | Responder threshold |
|---|---|
| Sit-to-Stand | +2 reps or more |
| Balance | +5 seconds or more |
| Self-reported function | ≥1 daily activity meaningfully easier |

**Functional Independence Gain (FIG)** = % of completers meeting ≥1 threshold.

Add a familiarisation trial before the Day 1 recorded Sit-to-Stand, or record
best-of-two. Without it, part of every reported gain is test familiarity.

---

## 5. VO2max — why it is excluded

### 5.1 The estimate has no sex term; the norm table does

`vo2max = 15.3 × (208 − 0.7 × age) / rhr` contains no sex variable. The
`VO2_NORMS` table splits by sex with female thresholds ~30% lower. Identical
inputs therefore produce systematically better labels for women:

| Age 62, RHR | VO2 est. | Male label | Female label |
|---|---|---|---|
| 60 | 42.1 | Excellent | Superior |
| 70 | 36.1 | Good | Superior |
| 80 | 31.6 | Average | Superior |
| 85 | 29.7 | Average | Superior |
| 90 | 28.0 | Average | Excellent |

A woman aged 60–69 is rated **Superior for any resting heart rate below 90 bpm**
— effectively the entire female population of the programme.

### 5.2 Change over 21 days is pure measurement noise

Age is fixed, so the entire 21-day VO2 change is the RHR change re-expressed.
At age 62, a ±2 bpm difference in a manual pulse count moves the estimate by
2.8 mL/kg/min — larger than any true 21-day training effect.

### 5.3 Options

1. **Replace with the 2-minute step test** — same Rikli & Jones battery you
   already cite for Sit-to-Stand, published norms, no equipment, genuinely
   responsive over 21 days. Restores a third domain at weight 25/30/45
   (cardio/balance/strength). `NEW SOURCE REQUIRED` — norms need adding.
2. **Retain VO2 as display-only**, recalibrated, retested at 90 days, unscored.
3. Minimum fix if it stays: 3-morning median RHR, not a single count.

---

## 6. Sleep — PSQI cannot measure 21-day change

PSQI asks about the **past month**. A Day 21 retest therefore covers a window
that includes the pre-programme baseline. Any pre/post PSQI comparison across
a 21-day programme is confounded by construction.

- Keep PSQI at baseline and 90 days.
- For the 21-day window use a nightly sleep log feeding Momentum.
- Remember direction is inverted (0–21, lower better) — the one check in the
  set where the raw number runs opposite to every other.

---

## 7. Connection — the polarity trap

Two instruments, opposite directions, inside one check:

| Component | Range | Direction | Coded cutoff |
|---|---|---|---|
| LSNS-6 network | 0–15 per subscale | Higher better | `<6` = isolated |
| UCLA-3 loneliness | **3–9** (not 0-based) | **Lower better** | `≤3` good, 4–5 watch, `≥6` elevated |

Any composite must reverse UCLA-3 before combining, and must not treat 0 as
its floor. Singapore-specific thresholds (Ge, Yap & Heng 2022) are correct
to keep — they are better evidence for this population than the Western norms.

**Open question:** the code applies `<6` to "family/friends network score". If
that is the 0–30 LSNS-6 total, the threshold is far stricter than standard
(`<12`). If it is per-subscale (0–15 each), it is plausible. Confirm which
before scoring anything off it.

---

## 8. Cognitive check — a messaging risk, not a scoring one

Correctly excluded from the score. But note the composition:

| Component | Max pts | Modifiable in 21 days? |
|---|---|---|
| Age | 2 | No |
| Sex (female = 1) | 1 | No |
| Education (primary/none = 3) | 3 | No |
| Depression | 1 | Partially |
| Life satisfaction | 1 | Partially |
| Hearing | 2 | No (aidable) |
| Cardio-metabolic | 3 | Partially |

A woman aged 75+ with primary education scores **6 before any health input** —
which lands on "At the screening threshold" purely from immutable demographics.
In Singapore's senior cohort, and particularly in church and community
settings, that describes a large share of participants.

Recommend distinguishing modifiable from non-modifiable contributions in the
result copy, so the message is "this reflects background factors, several of
which you can't change — here is what you can" rather than an unexplained flag.

Keep the check as a **hard gate**: an elevated result routes to a
"discuss with your doctor" pathway regardless of how good the Capacity Score is.

---

## 9. Implementation defects to fix first

| # | Issue | Fix |
|---|---|---|
| 1 | `AgeBand` enum is `60 \| 70 \| 80` only — a 68-year-old is scored against 60–64 norms | **Fixed.** Expanded to all seven of R&J's published 5-year bands (60–64 … 90–94), raw-age input. Balance had the same defect (anyone under 70 silently mapped to 65-69) — also fixed |
| 2 | No 50–59 band at all, despite a 50+ target audience | **Fixed, without extrapolation.** No source publishes 50-59 data for Sit-to-Stand or Balance, so none was invented. Instead, ages 50-59 are scored against the youngest real band available (60-64 / 65-69) — conservative, since a 50-something scoring below an older cohort's typical range is a stronger signal, not a weaker one. Age input floored at 50 (not 18) on all three age-banded checks, including VO2max, which previously had no lower floor at all |
| 3 | STS norms flagged "illustrative" in the disclaimer | **Fixed 2026-08-08.** Full 7-band table confirmed against Rikli & Jones (1999) — see PROAGE_NORMS.md §1. Hedge removed from **four** site strings (`sit-to-stand.html` disclaimer + dynamic `rangeNote`, en+zh) and the app's `typicalRange` in `en.ts`/`zh.ts`; all now read "(Rikli & Jones, 1999)". **Balance keeps its hedge deliberately** — the Seino values still produce negative 5th percentiles for the 80+ bands (§ above), so that one is not merely a hedge over sound numbers |
| 4 | Balance 60s cap causes pile-up | Resolved by the 30s sufficiency target in §2.2 |
| 5 | Dead duplicate label strings in `sitToStand.ts` | Remove; single source of truth in `en.ts` |
| 6 | Citations in code comments but not UI (Tanaka, Wijnhoven/Whitton, Lubben) | Surface to UI — the marketing site already shows some of these, so the app currently looks *less* sourced than the brochure |
| 7 | Ikigai-9 licensing | Confirm commercial licensing status before further deployment |

---

## 10. Overlap to resolve

Celebrate You D4 (Sleep) and D9 (Physical Function) cover the same constructs
as checks 5 and 1–2, using different instruments and different norms. Decide
which instrument is authoritative for each construct before both feed one
profile — otherwise a participant can be told two different things about the
same aspect of their health.

---

## 11. Worked end-to-end example

Female, 62. Day 1: 12 reps, 5.8s balance. Day 21: 15 reps, 12.0s.

| | Day 1 | Day 21 |
|---|---|---|
| Strength | 21.8 | 38.2 |
| Balance | 17.6 | 25.3 |
| **Capacity Score** | **39** | **64** |
| Band | Starting out | Building capacity |

+25 points. Responder on both thresholds (+3 reps, +6.2s) → counts toward FIG.
