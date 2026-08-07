"use client";

import type { HowToSlug } from "@/lib/howTo";

// Animated figures for the how-to panels. Drawn rather than photographed or
// filmed: an SVG is a couple of kB, stays crisp on any screen, needs no
// download before it is useful, carries no text to translate, and takes the
// app's own colours in both themes.
//
// Each movement is shown as two poses cross-fading on a loop — the start and
// end of the movement — rather than an interpolated animation. Two clear
// poses read more legibly at thumbnail size than a smooth tween, and there is
// no rigging to get subtly wrong. Under prefers-reduced-motion the crossfade
// stops and both poses show at once, which still communicates the movement.

const STROKE = "stroke-ink-soft dark:stroke-ink-dark-soft";
const ACCENT = "stroke-movement dark:stroke-movement";

function Figure({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="mb-3 flex justify-center rounded-lg bg-paper py-3 dark:bg-black/20">
      <svg viewBox="0 0 160 120" role="img" aria-label={label} className="h-[120px] w-[160px]">
        {children}
      </svg>
    </div>
  );
}

// Two poses alternating. `poseA`/`poseB` are plain SVG groups.
function Alternate({ a, b }: { a: React.ReactNode; b: React.ReactNode }) {
  return (
    <>
      <g className="howto-pose-a">{a}</g>
      <g className="howto-pose-b">{b}</g>
    </>
  );
}

const common = { fill: "none", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function ChairSquat() {
  // Side view, facing right, chair behind. Seat height and the hip position
  // are what carry the movement, so the seated pose puts the hips exactly on
  // the seat line and the standing pose lifts them clear of it.
  const chair = (
    <g className={STROKE} {...common} strokeWidth={2.5} opacity={0.5}>
      <path d="M84 74 L120 74 M120 74 L120 40 M88 74 L88 104 M116 74 L116 104" />
    </g>
  );
  const seated = (
    <g className={ACCENT} {...common}>
      <circle cx="88" cy="36" r="7" />
      <path d="M88 43 L94 70" />
      <path d="M94 70 L66 74" />
      <path d="M66 74 L64 104" />
      <path d="M88 50 L76 58" />
    </g>
  );
  const standing = (
    <g className={ACCENT} {...common}>
      <circle cx="66" cy="24" r="7" />
      <path d="M66 31 L66 66" />
      <path d="M66 66 L64 104" />
      <path d="M66 40 L54 48" />
    </g>
  );
  return (
    <>
      {chair}
      <Alternate a={seated} b={standing} />
      <g className={STROKE} {...common} strokeWidth={2} opacity={0.45}>
        <path d="M34 88 L34 46 M34 46 L30 52 M34 46 L38 52" />
      </g>
    </>
  );
}

function WallPushUp() {
  // Feet stay put; the whole body tips toward the wall and the elbows fold.
  // Drawing the body as one straight line from heel to shoulder is what makes
  // "keep a straight line from head to heels" legible.
  const wall = (
    <g className={STROKE} {...common} strokeWidth={3} opacity={0.5}>
      <path d="M134 16 L134 106" />
    </g>
  );
  const far = (
    <g className={ACCENT} {...common}>
      <path d="M52 104 L96 44" />
      <circle cx="102" cy="36" r="7" />
      <path d="M96 48 L130 56" />
    </g>
  );
  const near = (
    <g className={ACCENT} {...common}>
      <path d="M52 104 L104 40" />
      <circle cx="111" cy="33" r="7" />
      <path d="M104 44 L118 60 L130 56" />
    </g>
  );
  return (
    <>
      {wall}
      <Alternate a={far} b={near} />
    </>
  );
}

function BandRow() {
  // Seated with the legs out and the band round the feet — the version the
  // instructions lead with, since it needs no anchor point and no standing
  // balance. The band is dashed so it reads as elastic, not as a limb.
  const body = (
    <g className={ACCENT} {...common}>
      <circle cx="44" cy="46" r="7" />
      <path d="M44 53 L44 82" />
      <path d="M44 82 L108 86" />
      <path d="M108 86 L108 76" />
    </g>
  );
  const extended = (
    <g className={ACCENT} {...common}>
      <path d="M44 58 L92 72" />
      <path className={STROKE} strokeDasharray="5 4" d="M92 72 L106 82" />
    </g>
  );
  const pulled = (
    <g className={ACCENT} {...common}>
      <path d="M44 58 L26 66 M26 66 L56 72" />
      <path className={STROKE} strokeDasharray="5 4" d="M56 72 L106 82" />
    </g>
  );
  return (
    <>
      <g className={STROKE} {...common} strokeWidth={2} opacity={0.3}>
        <path d="M20 92 L140 92" />
      </g>
      {body}
      <Alternate a={extended} b={pulled} />
    </>
  );
}

function OneLegStand() {
  const counter = (
    <g className={STROKE} {...common} strokeWidth={2.5} opacity={0.5}>
      <path d="M118 60 L150 60 M124 60 L124 104" />
    </g>
  );
  const lifted = (
    <g className={ACCENT} {...common}>
      <circle cx="72" cy="26" r="8" />
      <path d="M72 34 L72 70" />
      <path d="M72 70 L72 104" />
      <path d="M72 70 L88 86 L84 94" />
      <path d="M72 44 L58 52 M72 44 L86 52" />
    </g>
  );
  const swap = (
    <g className={ACCENT} {...common}>
      <circle cx="72" cy="26" r="8" />
      <path d="M72 34 L72 70" />
      <path d="M72 70 L74 104" />
      <path d="M72 70 L56 86 L60 94" />
      <path d="M72 44 L58 52 M72 44 L86 52" />
    </g>
  );
  return (
    <>
      {counter}
      <Alternate a={lifted} b={swap} />
    </>
  );
}

function BriskWalk() {
  const strideA = (
    <g className={ACCENT} {...common}>
      <circle cx="78" cy="26" r="8" />
      <path d="M78 34 L74 68" />
      <path d="M74 68 L60 100" />
      <path d="M74 68 L92 98" />
      <path d="M78 42 L94 54" />
      <path d="M78 42 L62 52" />
    </g>
  );
  const strideB = (
    <g className={ACCENT} {...common}>
      <circle cx="78" cy="26" r="8" />
      <path d="M78 34 L76 68" />
      <path d="M76 68 L88 100" />
      <path d="M76 68 L64 98" />
      <path d="M78 42 L62 54" />
      <path d="M78 42 L94 52" />
    </g>
  );
  return (
    <>
      <g className={STROKE} {...common} strokeWidth={2} opacity={0.35}>
        <path d="M18 104 L142 104" />
      </g>
      <Alternate a={strideA} b={strideB} />
    </>
  );
}

function LongevityPlate() {
  // A plate read as proportions, so the halves and quarters are the picture.
  return (
    <g>
      <circle cx="80" cy="60" r="44" className="fill-transparent stroke-ink-soft dark:stroke-ink-dark-soft" strokeWidth={2.5} />
      <path d="M80 16 A44 44 0 0 0 80 104 Z" className="fill-nutrition/25 stroke-nutrition" strokeWidth={2} />
      <path d="M80 60 L80 16 A44 44 0 0 1 124 60 Z" className="fill-connection/25 stroke-connection" strokeWidth={2} />
      <path d="M80 60 L124 60 A44 44 0 0 1 80 104 Z" className="fill-healthrisk/25 stroke-healthrisk" strokeWidth={2} />
      <circle cx="140" cy="30" r="9" className="fill-movement/25 stroke-movement" strokeWidth={2} />
    </g>
  );
}

function PalmPortion() {
  // The hand as a ruler: a palm-sized piece of fish or meat is roughly 25g of
  // protein, and everyone carries the measuring device with them. Far more
  // use standing at a stall than a number in grams.
  const palm =
    "M52 106 L52 66 Q52 54 62 54 Q72 54 72 66 L72 40 Q72 28 82 28 Q92 28 92 40 L92 36 Q92 24 102 24 Q112 24 112 36 L112 48 Q112 36 122 36 Q132 36 132 48 L132 96 Q132 106 122 106 Z";
  return (
    <g>
      <path d={palm} className={`${STROKE} fill-none`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <rect x="62" y="66" width="58" height="30" rx="9" className="fill-nutrition/40 stroke-nutrition" strokeWidth={2.5} />
    </g>
  );
}

function FingerBreathing() {
  // A hand with a dot travelling up and down the thumb and fingers — the
  // movement is the instruction, so this one is genuinely animated rather
  // than a two-pose crossfade.
  const hand =
    "M44 108 L44 74 Q44 62 54 62 Q64 62 64 74 L64 46 Q64 34 74 34 Q84 34 84 46 L84 42 Q84 30 94 30 Q104 30 104 42 L104 52 Q104 40 114 40 Q124 40 124 52 L124 96";
  return (
    <>
      <path d={hand} className={`${STROKE} fill-none`} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle r="5" className="fill-movement howto-tracer">
        <animateMotion dur="8s" repeatCount="indefinite" path={hand} />
      </circle>
    </>
  );
}

const FIGURES: Partial<Record<HowToSlug, { node: React.ReactNode; label: string }>> = {
  "brisk-walk": { node: <BriskWalk />, label: "A figure walking briskly" },
  "chair-squat": { node: <ChairSquat />, label: "A figure standing up from a chair and sitting back down" },
  "wall-push-up": { node: <WallPushUp />, label: "A figure doing a push-up against a wall" },
  "band-row": { node: <BandRow />, label: "A figure pulling a resistance band towards the ribs" },
  "one-leg-stand": { node: <OneLegStand />, label: "A figure standing on one leg beside a counter" },
  "longevity-plate": { node: <LongevityPlate />, label: "A plate half vegetables, a quarter protein, a quarter wholegrain" },
  "finger-breathing": { node: <FingerBreathing />, label: "A hand with a fingertip tracing up and down each finger" },
  "protein-breakfast": { node: <PalmPortion />, label: "A palm with a palm-sized portion marked on it" },
};

export function Illustration({ slug }: { slug: HowToSlug }) {
  const figure = FIGURES[slug];
  if (!figure) return null;
  return <Figure label={figure.label}>{figure.node}</Figure>;
}
