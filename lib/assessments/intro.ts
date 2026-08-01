import type { AssessmentType } from "@/lib/importHistory";

export interface AssessmentIntro {
  eyebrow: string;
  paragraphs: string[];
}

// Same copy as each assessment's own welcome screen — surfaced again here
// so the trend page also explains what the check measures and why it
// matters for longevity, not just the raw numbers.
export const ASSESSMENT_INTROS: Record<AssessmentType, AssessmentIntro> = {
  purpose: {
    eyebrow: "Purpose Check · ~3 minutes",
    paragraphs: [
      `This check is based on the Ikigai-9 (Imai, Osada & Nishi, 2012), a validated Japanese scale measuring ikigai — roughly, "a reason for being" — across three themes: how you feel about your life, your attitude towards the future, and the sense that your existence matters.`,
      "The concept of ikigai has been linked in Japanese cohort research (e.g. the Ohsaki study, Sone et al., 2008) to a lower risk of death over time — one of several strands of evidence connecting a sense of purpose to healthy ageing.",
    ],
  },
  "family-history": {
    eyebrow: "Family History · ~2 minutes",
    paragraphs: [
      "Knowing your family's medical history tells you which risks to watch most closely. Answer a few short questions to map your inherited risk across the main categories that run in families — then share the answers with your doctor to guide earlier, smarter screening.",
      "Wherever Singapore-specific guidance exists (MOH Clinical Practice Guidelines), we use it — it's often stricter or differently calibrated than international guidelines. Where it doesn't, we fall back to international standards, and say so.",
    ],
  },
  "cognitive-decline": {
    eyebrow: "Cognitive Health Check · ~3 minutes",
    paragraphs: [
      "This check uses the SLAS Risk Index, developed and validated by the Singapore Longitudinal Ageing Study (Ng et al., 2021). It's a short, self-reported checklist of 10 personal, lifestyle and health factors shown to predict a person's 3–5 year risk of mild cognitive impairment (MCI) or dementia.",
      "It was field-tested with over 400 community-living older adults in Singapore to identify who would benefit most from early lifestyle support — the same approach we're using here.",
    ],
  },
  vo2max: {
    eyebrow: "Cardiorespiratory Fitness · ~3 minutes",
    paragraphs: [
      "VO2 max measures how efficiently your heart, lungs, and muscles use oxygen during exercise. It's one of the strongest predictors of healthy longevity found in ageing research — in one study of over 122,000 adults, the fittest group had an 80% lower risk of death than the least fit (Mandsager et al., JAMA Network Open, 2018).",
      "We'll estimate yours from your resting heart rate using the Heart Rate Ratio Method (Uth et al., 2004) — no treadmill needed.",
    ],
  },
  "sit-to-stand": {
    eyebrow: "Physical Function Check · ~4 minutes",
    paragraphs: [
      "This test measures the strength in your legs and hips — the muscles you use every day to get up from a chair, climb stairs, or catch your balance.",
      "You'll stand up and sit down from a chair as many times as you can in 30 seconds. No equipment needed beyond a sturdy chair.",
    ],
  },
  balance: {
    eyebrow: "Balance Check · ~2 minutes",
    paragraphs: [
      "This check uses the One-Leg Standing Test (eyes open) — how long you can balance on one leg with your eyes open — one of the most studied, self-testable markers of fall risk, with reference values from a pooled study of 4,683 older Japanese adults (Seino et al., 2014).",
      "Balance naturally changes with age, and this simple test tracks it well: one large study found impaired one-leg balance was the strongest independent predictor of injurious falls in older adults (Vellas et al., 1997).",
    ],
  },
  "nutrition-protein": {
    eyebrow: "Nutrition & Protein · ~3 minutes",
    paragraphs: [
      "Older adults need more protein per kg of body weight than younger adults do, just to maintain the same muscle — but intake often quietly falls short. This check screens how often you're eating protein-rich foods across a typical week.",
      "Adapted from the Protein Screener 55+ (a validated Dutch tool) using food items confirmed relevant to Singapore's multi-ethnic diet. It's a directional guide, not a lab-grade measurement.",
    ],
  },
  "sleep-quality": {
    eyebrow: "Sleep Check · ~5 minutes",
    paragraphs: [
      "This check is based on the Pittsburgh Sleep Quality Index (PSQI), one of the most widely used sleep questionnaires in research and clinical care.",
      "You'll answer a few questions about your sleep over the past month — when you go to bed, how long you sleep, and how often certain things disturb your rest.",
    ],
  },
  connection: {
    eyebrow: "Connection Check · ~3 minutes",
    paragraphs: [
      "This check combines two validated instruments: the Lubben Social Network Scale (LSNS-6), which maps the size of your family and friend networks, and the UCLA-3 Loneliness Scale, which asks how connected you actually feel.",
      "In a 2022 Singapore study of 606 older adults, feeling lonely — not network size alone — was the one linked to higher frailty risk (Ge, Yap & Heng, BMC Geriatrics). So this check tracks both, but pays closest attention to how you feel.",
    ],
  },
};
