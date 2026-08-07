# Age-friendly UI rules

The people using this app are mostly 50+, many 65+. Design for a person
holding a phone at arm's length, in bright light, possibly with reading
glasses somewhere else in the house, and with less steady hands than the
designer has. These are not accessibility extras — for this audience they
are the baseline.

Anything below that says **must** is a review-blocking rule.

## Tap targets

- Interactive controls **must** be at least **56px tall**. WCAG 2.2 asks for
  24px and Apple/Material for 44–48px; those are floors for the general
  population, not for a 70-year-old with a tremor.
- Interactive controls **must not** rely on the user hitting an icon. If a
  row is tappable, the whole row is the button and it **must look like a
  button** — background, border, or a clearly labelled control. A bare
  chevron is decoration, not an affordance.
- Leave at least **8px** between adjacent tap targets so a slightly-off tap
  doesn't trigger the wrong one.

## Text

- Body text **must** be at least **16px** (`text-base`). Never set
  instructions, results, or anything a person has to act on in `text-xs`
  (12px).
- `text-xs` is for legal disclaimers and source citations only — content
  where not reading it has no consequence.
- Avoid font weights below 400, and avoid grey-on-grey. Body text wants
  **7:1** contrast where it can get it, and **must** clear 4.5:1.
- Keep lines under about 65 characters. Long measures are harder to track
  back from at any age and much harder with reduced central vision.

## Labels and icons

- Every control **must** carry a text label. Icon-only buttons are a
  guessing game — the icon can accompany the words, not replace them.
- Say what will happen in the user's words: "Show me how", not "Details".
- Never signal state with colour alone. Pair it with a word or a shape.

## Motion

- Respect `prefers-reduced-motion` — and make the reduced state still carry
  the information, rather than removing it. A two-pose exercise animation
  should show both poses when motion is off, not freeze on one.
- Nothing important may depend on noticing an animation.

## Instructions

- Name a technique and define it in the same breath. If a term appears
  without an explanation, a beginner has nowhere to go.
- Prefer a picture for anything physical. A wall push-up is far clearer
  seen than described.
- Give an easier variation, and frame it as progress rather than
  compromise — people abandon things they believe they are failing at.
- For anything physical, say plainly when to stop.

## Checklist before shipping a screen

1. Is every tap target at least 56px tall, and does it look tappable?
2. Is anything a user must read set below 16px?
3. Does every control have words, not just an icon?
4. With motion disabled, is any instruction lost?
5. Could someone who has never heard the terms follow it?
