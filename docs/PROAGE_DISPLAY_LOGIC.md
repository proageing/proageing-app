# ProAge Score — participant-facing display logic v0.1

Companion to `PROAGE_SCORE_SPEC.md`. That document defines how the numbers are
computed. This one defines what the participant actually sees, when, and why.

---

## 0. The governing rule

**The hero number changes by phase.** A single fixed headline metric fails at
one of the two jobs: an unchanging Capacity Score is demotivating mid-programme,
and a behaviour score alone has nothing to show at the end.

| Phase | Days | Hero metric | Capacity Score state |
|---|---|---|---|
| 1 — Baseline | Day 1 | Capacity Score, framed as a starting point | Revealed |
| 2 — Build | Days 2–20 | Weekly Momentum Score | Locked, shown greyed with "Retest Day 21" |
| 3 — Reveal | Day 21+ | Capacity **change** (Δ), not the absolute | Revealed |

Locking Capacity during Phase 2 is deliberate. It cannot move without a retest,
so displaying it live invites participants to check a number that never changes.

---

## 1. Render order (fixed, top to bottom)

```
1. SAFETY FLAGS        (if any — always above the score)
2. HERO METRIC         (per phase, §0)
3. DOMAIN BREAKDOWN
4. FOCUS AREA          (exactly one)
5. NEXT ACTION         (exactly one)
6. CONTEXT PANELS      (non-scored checks)
```

**A rising score must never visually outrank a safety flag.** If a participant
gains 20 points and also holds a one-leg stance under 5 seconds, the flag
renders first.

### 1.1 Safety flag conditions

| Condition | Source | Copy |
|---|---|---|
| Balance < 5s | `page.tsx:373` (Vellas) | "⚠️ Worth mentioning to your doctor" |
| Cognitive band = `elevated` | SLAS ≥ 8 | Existing disclaimer copy |
| Family history = `elevated` | Any early-onset category | Existing next-step copy |

These are gates, not scores. They persist regardless of Capacity or Momentum.

---

## 2. Focus area selection — uses band status, not points

This is the one place where the continuous score must **not** drive the logic.

```
focus = the domain whose coded band status is worst, ranked:
          below typical  >  within typical  >  above typical
        ties broken by the lower position within the band
```

**Why not use the lowest normalised score.** Worked example — Female, 62,
12 reps, 5.8s:

| Domain | Points | Normalised | Coded band status |
|---|---|---|---|
| Strength | 21.8 / 60 | 0.36 | **within** typical (12–17) |
| Balance | 17.6 / 40 | 0.44 | **below** typical (39.4–60.0) |

By normalised points, strength looks like the priority. By clinical position,
balance is — she is near the fall-risk threshold while her strength is inside
the normal range. The square-root curve that makes balance motivating to
improve also makes it *look* healthier than it is.

Scoring and coaching are two different jobs. Continuous curve for the score,
published band status for the recommendation.

---

## 3. What the score is called and how it's framed

| Element | Copy |
|---|---|
| Score name | **Strength & Balance Score** |
| Not | "Functional Score", "ProAge Score", "Health Score" |
| Subtitle | "What this measures: two tested abilities — how easily you rise from a chair, and how steadily you balance." |
| Disclaimer | "A coaching score, not a medical assessment. It doesn't predict health or lifespan." |

Naming it for what it measures rather than for the whole person is the honest
option and prevents a low score reading as a verdict on the participant.

### 3.1 Bands

| Score | Label |
|---|---|
| 85–100 | Thriving |
| 70–84 | Strong & growing |
| 55–69 | Building capacity |
| 40–54 | Early progress |
| <40 | Starting out |

No "poor", "low", "at risk", or "failing" anywhere in the band set.

### 3.2 Do not show three scores

The Protect / Build / Live grouping implies three comparable numbers. Only one
of the three is measured. Show **one score plus two context panels**:

- **Your score** — strength and balance (tested)
- **Good to know** — family history, cognitive, sleep *(context, not scored)*
- **Your foundations** — purpose, connection, nutrition *(context, not scored)*

Manufacturing a number for the unscored groups would mean inventing precision
you don't have.

---

## 4. Day 1 logic

```
IF no prior result:
    headline   = score
    label      = "Your starting point"
    band       = §3.1 band label
    SUPPRESS   comparative language, percentiles, "below average"
    SHOW       one strength ("Your strongest area: …")
    SHOW       focus area (§2)
    SHOW       next action (§5)
```

Always name a strength before naming the focus area, including for very low
scores. If both domains are below typical, the strength is the higher of the
two, phrased as "the closer of the two to your typical range".

---

## 5. Next action logic

Exactly one action. Derived from the focus domain, never a list.

| Focus | Action |
|---|---|
| Balance | "Hold a counter-supported single-leg stand, 3 × 20s each side, daily." |
| Strength | "Sit-to-stand from a dining chair, 3 sets of 8, three days this week." |
| Both at ceiling | "Maintain: keep two strength sessions and daily balance practice." |

If a safety flag is active, the action becomes "Book a conversation with your
doctor" and the exercise action moves below it.

---

## 6. Phase 2 (Days 2–20) — Momentum display

```
headline = weekly Momentum Score (0–100)
subtext  = "Week {n} of 3 · resets each Monday"
```

| Score | Label |
|---|---|
| 80–100 | Thriving |
| 60–79 | Building |
| 40–59 | Getting going |
| <40 | Let's restart this week |

Weekly reset is the point. A participant who loses Week 1 can still win Week 2,
and the copy for <40 must be a restart, not a deficit.

Capacity Score renders greyed with: "Unlocks at your Day 21 retest."

---

## 7. Phase 3 (Day 21) — change logic

Δ = Capacity(Day 21) − Capacity(Day 1)

```
IF Δ ≥ +15   → "Strong progress"
IF Δ +6..+14 → "Real progress"
IF |Δ| ≤ 5   → "Held steady"          ← measurement-error zone
IF Δ ≤ −6    → see §7.1
```

**The ±5 dead zone is not cosmetic.** One sit-to-stand rep is worth about 5.5
points. A ±5 swing is within test–retest error, so both celebrating +3 and
lamenting −3 would be reporting noise as signal.

### 7.1 When Δ is negative

Never lead with a decline.

```
IF Δ ≤ −6 AND mean Momentum ≥ 60:
    lead with Momentum and completed days
    Capacity shown below, framed as "retest variation"
IF Δ ≤ −6 AND mean Momentum < 60:
    lead with completion
    offer a re-retest within 7 days before recording the result
```

Rationale: a genuine 21-day decline in a training participant is uncommon; a
bad test day, illness, or a missing familiarisation trial is more likely. The
re-retest offer is the honest response to that.

### 7.2 Responder badges

Binary, earned, shown alongside Δ. Not scored, not weighted.

| Badge | Condition |
|---|---|
| Stronger | Sit-to-stand +2 reps or more |
| Steadier | Balance +5 seconds or more |
| Easier Days | ≥1 daily activity meaningfully easier |

A participant can miss the Δ threshold and still earn a badge. That is
intentional — the badge is the more robust claim, and it is what feeds the
Functional Independence Gain reporting figure.

---

## 8. What is never shown to participants

| Hidden | Reason |
|---|---|
| Domain weights (60/40) | Invites gaming and reads as arbitrary |
| Floor/ceiling values | Reads as a pass mark |
| Percentile language | "You are 5th percentile" is demotivating and overstates precision |
| Raw normalised fractions | Meaningless without the formula |
| Other participants' scores | Comparison is not the mechanism here |
| Cohort averages | Same |

Publish the method on a linked "How this score works" page. Available to anyone
who looks, absent from the result screen.

---

## 9. Cognitive result — modifiable vs fixed

Six of thirteen SLAS points are immutable (age, sex, education). A 75-year-old
woman with primary education scores 6 before any health input, landing on
"At the screening threshold".

Split the display:

```
Background factors:  {n} points   — not things you can change
Health factors:      {n} points   — several of these respond to action
```

Without this split the result reads as a verdict on who she is rather than a
prompt about what she can do.

---

## 10. Open decisions

1. **Is the Day 1 score shown at all, or only revealed at Day 21?** Withholding
   removes the "I'm broken" risk entirely but costs the starting-point anchor
   that makes Δ meaningful. Recommendation: show it, with Day 1 framing per §4.
2. **Does Momentum feed any published figure?** It is self-reported and should
   not sit in partner reporting next to measured results without being labelled
   as self-reported.
3. **Retest interval for non-completers.** Someone who stops at Day 10 has a
   baseline and no endpoint. Decide whether they are invited to retest.
