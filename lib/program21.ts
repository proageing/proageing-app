// The 21-Day ProAgeing Challenge — daily content, built from the actual
// Celebrate You! curriculum (proageing/CelebrateYouCourse) and the 7
// ProAgeing Steps already implemented as assessments (lib/assessmentTypes.ts).
// Sequencing agreed with the user: Steps 1 & 2 first (checks + next step
// done in one sitting each), then Steps 3 & 4 (checks done, start the
// habit), reinforced with continued nudges through weeks 2-3 since those
// are the two hardest habits to establish; Step 5 next since nutrition
// fuels 3 & 4; then Step 6, then Step 7 last. Day 21 retakes only the
// assessments that can plausibly shift in 21 days.

export interface AssessmentLink {
  label: string;
  href: string;
}

export interface Program21Day {
  day: number;
  pillar: string;
  learn: string;
  assessments?: AssessmentLink[];
  action: string;
  reflect: string;
  isProfileReveal?: boolean;
  isClose?: boolean;
}

export const PROGRAM21_DAYS: Program21Day[] = [
  {
    day: 1,
    pillar: "Step 1 — Clarify Your Preferred Future",
    learn: "Adults with a strong sense of purpose have 20% lower all-cause mortality (Rush University, 6,985 participants) — purpose protects your heart, brain, and immune system.",
    assessments: [{ label: "Take your Sense of Purpose check", href: "/assess/purpose" }],
    action: "Take 3 minutes to name your Three Sources of Purpose: who gives your life meaning (Relational), what you can contribute or teach (Contribution), and what you enjoy that makes life meaningful (Experiential).",
    reflect: "Looking at what you wrote, which source would you like to give more attention to?",
  },
  {
    day: 2,
    pillar: "Step 2 — Understand Your Personal Healthspan Risks",
    learn: "Knowing your family's medical history tells you which risks to watch most closely — early onset (before 60) in a first-degree relative significantly multiplies your personal risk.",
    assessments: [
      { label: "Take your Family History check", href: "/assess/family-history" },
      { label: "Take your Cognitive Decline check", href: "/assess/cognitive-decline" },
    ],
    action: "Pick 1 biomarker to ask your doctor about at your next check-up — HbA1c, ApoB, hsCRP, Vitamin D, or Fasting Insulin.",
    reflect: "Which of your results surprised you most?",
  },
  {
    day: 3,
    pillar: "Step 3 — Invest in Daily Movement",
    learn: "In a study of over 122,000 adults, the fittest group had an 80% lower risk of death than the least fit — VO2 max is one of the strongest predictors of healthy longevity.",
    assessments: [{ label: "Take your VO2 Max & Resting HR check", href: "/assess/vo2max" }],
    action: "Start today: a 10-minute brisk walk. Aim for a pace where you can talk but not sing (Zone 2).",
    reflect: "How did the walk feel? Could you hold a conversation the whole way?",
  },
  {
    day: 4,
    pillar: "Step 4 — Build Strength and Balance Capacity",
    learn: "Lower-body strength and balance are two of the most trainable things at any age — meaningful improvement is possible within 8-12 weeks of consistent practice.",
    assessments: [
      { label: "Take your Sit-to-Stand check", href: "/assess/sit-to-stand" },
      { label: "Take your Balance check", href: "/assess/balance" },
    ],
    action: "Start today: a 5-minute strength snack — chair squats, band rows, or wall push-ups.",
    reflect: "Which exercise felt hardest? That's usually the most useful one to keep doing.",
  },
  {
    day: 5,
    pillar: "Step 5 — Fuel Your Body Healthily",
    learn: "From age 50, muscles respond less to protein, so you need more, not less — aim for 25-40g per sitting, spread across the day, with protein at breakfast especially.",
    assessments: [{ label: "Take your Nutrition & Protein check", href: "/assess/nutrition-protein" }],
    action: "Add 25-40g of protein at breakfast today — eggs, tofu, Greek yogurt, or fish.",
    reflect: "What did you add, and how did it change how you felt through the morning?",
  },
  {
    day: 6,
    pillar: "Step 6 — Restore Sleep and Stress Rhythm",
    learn: "Your body recovers and your brain \"calibrates\" itself during sleep — both quantity (7-9 hours) and quality matter equally.",
    assessments: [{ label: "Take your Sleep Quality check", href: "/assess/sleep-quality" }],
    action: "Set a consistent bed and wake time tonight, and put screens away 30 minutes before bed.",
    reflect: "How did tonight's wind-down feel different from your usual routine?",
  },
  {
    day: 7,
    pillar: "Step 7 — Strengthen Social and Emotional Connections",
    learn: "Social isolation is as harmful to longevity as smoking 15 cigarettes a day (Holt-Lunstad, 3.4 million people) — more harmful than obesity or inactivity.",
    assessments: [{ label: "Take your Connection check", href: "/assess/connection" }],
    action: "Reach out to one person today — a call, not just a text.",
    reflect: "Your Healthy Longevity Profile is complete — all 7 ProAgeing Steps checked. Which one do you want to focus on most this week?",
    isProfileReveal: true,
  },
  {
    day: 8,
    pillar: "Movement",
    learn: "Zone 2 training — a pace where you can hold a full conversation but feel challenged — is the foundation for improving VO2 max.",
    action: "Try the Talk Test on your walk today: can you speak in full sentences, breathing noticeably heavier but sustainable? That's your Zone 2.",
    reflect: "What pace got you into that zone?",
  },
  {
    day: 9,
    pillar: "Strength & Balance",
    learn: "Balance is one of the most trainable physical abilities at any age — simple daily practice can meaningfully improve it within weeks.",
    action: "Practise standing on one leg near a counter for 10-20 seconds, a few times today.",
    reflect: "Which leg felt more stable?",
  },
  {
    day: 10,
    pillar: "Movement",
    learn: "Reducing sitting time and adding incidental movement throughout the day matters as much as structured exercise.",
    action: "Extend today's walk by 5 minutes, or add a second short walk.",
    reflect: "Where did you find the extra 5 minutes?",
  },
  {
    day: 11,
    pillar: "Strength & Balance",
    learn: "Strength training 2x/week, 2 sets of 10 reps per major muscle group, is enough to start seeing real change.",
    action: "Add a rep or try a resistance band during today's strength snack.",
    reflect: "Did it feel harder or easier than Day 4?",
  },
  {
    day: 12,
    pillar: "Nutrition",
    learn: "The Singapore Longevity Plate: half vegetables & fruit, a quarter protein, a quarter whole grains — a simple template for every meal.",
    action: "Build a Singapore Longevity Plate at one meal today.",
    reflect: "What did your plate look like?",
  },
  {
    day: 13,
    pillar: "Movement",
    learn: "Lifestyle activity — stairs, commuting, housework — adds up alongside structured exercise, not instead of it.",
    action: "Take the stairs today, or add one more lifestyle movement habit.",
    reflect: "What's one movement habit you could keep permanently?",
  },
  {
    day: 14,
    pillar: "Strength & Balance",
    learn: "Consistency beats intensity — the goal is showing up for your strength snack regularly, not doing more than you can recover from.",
    action: "Progress your strength snack today — same exercises, a few more reps.",
    reflect: "Two weeks in — what's felt easiest to stick with so far?",
  },
  {
    day: 15,
    pillar: "Sleep & Stress",
    learn: "Different emotions are associated with different breathing patterns — changing how you breathe changes your stress level directly.",
    action: "Try Finger Breathing or Deep Breathing (4-second inhale, 6-second exhale) for 90 seconds today.",
    reflect: "Did you notice a change in how you felt afterward?",
  },
  {
    day: 16,
    pillar: "Movement",
    learn: "Adults 60-80 can improve VO2 max by 15-25% with 3-6 months of consistent training — the walking you're doing now is building toward that.",
    action: "Keep the walking streak going today.",
    reflect: "How many days in a row have you walked now?",
  },
  {
    day: 17,
    pillar: "Strength & Balance",
    learn: "Muscle tissue can still grow at 90+ — it's never too late to start, and consistency matters more than age.",
    action: "One more rep, one more set in today's strength snack.",
    reflect: "What's changed since Day 4?",
  },
  {
    day: 18,
    pillar: "Connection",
    learn: 'The Okinawan "moai" — a committed group of about 5 friends supporting each other for life — is a practical model for social connection.',
    action: "Join an activity, or deepen one relationship today — plan something with someone.",
    reflect: "Who did you connect with, and how did it go?",
  },
  {
    day: 19,
    pillar: "Purpose",
    learn: "How you feel on a Sunday afternoon with nothing scheduled reveals how strong your current sources of meaning are.",
    action: "Try the Sunday Afternoon Test — notice how you feel with unstructured time today.",
    reflect: "Calm and content, or empty and restless? What does that tell you?",
  },
  {
    day: 20,
    pillar: "Nutrition",
    learn: "Ultra-processed foods make up 40-50% of caloric intake in urban populations and are independently linked to accelerated biological ageing.",
    action: "Swap one processed meal today for a whole-food option.",
    reflect: "What did you swap, and was it harder or easier than expected?",
  },
  {
    day: 21,
    pillar: "Close — Become a ProAger",
    learn: "Identity-level commitments — habits tied to who you want to become, declared to someone else — are what persist after a programme ends.",
    assessments: [
      { label: "Retake: Sit-to-Stand", href: "/assess/sit-to-stand" },
      { label: "Retake: Balance", href: "/assess/balance" },
      { label: "Retake: Nutrition & Protein", href: "/assess/nutrition-protein" },
      { label: "Retake: Sleep Quality", href: "/assess/sleep-quality" },
      { label: "Retake: Connection", href: "/assess/connection" },
    ],
    action: "Retake the 5 checks above to see your movement over 21 days, then declare your Keystone Habit — the one habit from these 21 days you're committing to keep — to someone else.",
    reflect: 'Finish this sentence: "I am someone who..."',
    isClose: true,
  },
];

export function contentForDay(day: number): Program21Day {
  return PROGRAM21_DAYS.find((d) => d.day === day) ?? PROGRAM21_DAYS[PROGRAM21_DAYS.length - 1];
}
