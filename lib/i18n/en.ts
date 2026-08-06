// The English dictionary is the source of truth for shape: zh.ts is typed
// against it, so adding a string here without translating it is a build
// error rather than a silent English leak in a Chinese session.
export const en = {
  common: {
    loading: "Loading…",
    back: "← Back",
    saving: "Saving…",
    saved: "Saved",
    save: "Save",
    signOut: "Sign out",
    signingOut: "Signing out…",
    couldntSave: (detail: string) => `Couldn't save: ${detail}`,
  },

  checks: {
    purpose: "Sense of Purpose",
    "family-history": "Family History",
    "cognitive-decline": "Cognitive Decline",
    vo2max: "VO2 Max & Resting HR",
    "sit-to-stand": "Sit-to-Stand",
    balance: "Balance",
    "nutrition-protein": "Nutrition & Protein",
    "sleep-quality": "Sleep Quality",
    connection: "Connection",
  },

  tabs: {
    home: "Home",
    readings: "Readings",
    programme: "Programme",
    plans: "Plans",
  },

  signIn: {
    title: "Sign in to ProAgeing",
    blurb: "We'll email you a sign-in link — no password needed.",
    emailPlaceholder: "you@example.com",
    send: "Send sign-in link",
    sending: "Sending…",
    sent: "Check your email for a sign-in link — tap it to continue. You can close this tab.",
    failed: (detail: string) => `Couldn't send the link: ${detail}`,
    signingYouIn: "Signing you in…",
    backToSignIn: "Back to sign in",
  },

  dashboard: {
    greeting: (name: string) => `Hello, ${name}!`,
    firstVisit: "Here's how ProAge works.",
    welcomeSteps: [
      {
        title: "Take your free checks",
        body: "9 quick, guided checks across the 7 ProAgeing Steps — no clinic, no needles.",
      },
      {
        title: "See your Healthy Longevity Profile",
        body: "Your results build into a profile below, always up to date as you retake checks.",
      },
      {
        title: "Build the habit",
        body: "Ready to act on what you find? The 21-Day ProAgeing Challenge turns it into a daily plan.",
      },
    ],
    affirmations: [
      "Healthy longevity starts today!",
      "ProAgeing, a step at a time.",
      "Small steps, longer years.",
      "Your decision today, shapes your tomorrow.",
      "Invest in your future self.",
    ],
    cards: {
      checks: "My Longevity Dashboard",
      checksProgress: (done: number, total: number) => `${done} of ${total} checks`,
      challenge: "21-Day Challenge",
      challengeBlurb: "Daily plan & streaks",
    },
    sevenSteps: {
      eyebrow: "The 7 ProAgeing Steps",
      blurb: "Seven simple steps toward a longer, fuller life.",
      stepLabel: (n: number, tagline: string) => `Step ${n} · ${tagline}`,
    },
  },

  readings: {
    title: "Your Longevity Profile",
    notStarted: "Not started",
    step: (n: number) => `Step ${n}`,
    areasFlagged: (n: number) => `${n} area${n === 1 ? "" : "s"} flagged`,
    rhrSuffix: "RHR",
    legend: {
      typical: "Typical",
      worthALook: "Worth a look",
      seeDoctor: "Discuss with your doctor",
    },
  },

  account: {
    title: "Account",
    displayName: "Display name",
    displayNameBlurb: "This is the name shown in the app",
    yourData: "Your data",
    findHistory: "Find history from another email",
    findHistoryBlurb: "Results saved on proageing.org under a different address",
    accountSection: "Account",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    language: "Language",
    languageBlurb: "Used across the app",
    couldntSave: (detail: string) => `Couldn't save: ${detail}`,
  },

  upgrade: {
    title: "Plans & pricing",
    free: {
      title: "Free",
      priceLabel: "Forever",
      included: "Included with every account",
      features: ["All 9 longevity checks", "Your results & trend history", "The 7 ProAgeing Steps library"],
    },
    currentlyOn: (plan: string) => `You're currently on ${plan}.`,
    notOpenYet: (plan: string) => `The ${plan} isn't open yet — here's what's available today.`,
    yourSelection: "Your selection",
    comingSoon: "Coming soon",
    currentPlan: "Current plan",
    choosePlan: "Choose this plan",
    redirecting: "Redirecting…",
    couldntStart: "Couldn't start checkout.",
  },

  importHistory: {
    title: "Find history from another email",
    blurb:
      "Anything you saved on proageing.org comes across automatically when you sign in, as long as you used the same email address. If you used a different one, enter it here and we'll send that address a link to confirm it's yours.",
    privacy: "We only ever read your own data — nothing is shared with anyone else.",
    send: "Send sign-in link",
    sending: "Sending…",
    sent: "Check your email — tap the link to import your history. You can close this tab.",
    failed: (detail: string) => `Couldn't send the link: ${detail}`,
    working: "Importing your history…",
    needsPrimary: "Sign in to your ProAgeing account first, then use the import link from your account page again.",
    done: (imported: number, skipped: number) =>
      `Imported ${imported} result${imported === 1 ? "" : "s"}, skipped ${skipped} already imported.`,
    backToDashboard: "Back to dashboard",
    tryAgain: "Try again",
  },

  programme: {
    notStarted: {
      eyebrow: "21-Day Challenge",
      title: "Start living the 7 ProAgeing Steps",
      blurb: "One small action a day, for twenty-one days. Day 1 begins today.",
      whatYoullDo: "What you'll do",
      items: [
        { label: "Learn", body: "one idea a day, in a minute of reading." },
        { label: "Act", body: "a single action you can finish the same day." },
        { label: "Reflect", body: "a line to yourself, kept private." },
      ],
      onDay21: "On day 21",
      onDay21Body:
        "You'll retake five of your checks and see exactly what moved — then name the one habit you're keeping.",
      begin: "Begin day 1",
      starting: "Starting…",
      couldntStart: (detail: string) => `Couldn't start your challenge: ${detail}`,
    },
    noAccess: {
      eyebrow: "21-Day ProAgeing Challenge",
      title: "Turn your checks into a daily plan",
      previewCaption: "What a day inside the Challenge looks like",
      features: [
        {
          strong: "Learn, act, reflect — every day.",
          rest: "A short research insight, one small action, and a moment to reflect — walking you through all 7 ProAgeing Steps over 21 days.",
        },
        {
          strong: "Real momentum, not a quick fix.",
          rest: "Small steps, repeated daily, build toward true transformation — one day at a time.",
        },
        {
          strong: "Paired with your own checks.",
          rest: "Every day connects back to your results, so you're acting on in-depth insights and trends from your own data — not generic advice.",
        },
        {
          strong: "Day 21: see what actually moved.",
          rest: "Retake your checks to see real, measured change, then choose one Keystone Habit to carry forward.",
        },
      ],
      cta: "Start the 21-Day Challenge",
      fine: "Your 9 free checks stay free, always — this unlocks the guided daily programme.",
    },
    day: {
      dayOf: (day: number, total: number) => `Day ${day} of ${total}`,
      backToToday: (day: number) => `Back to today (Day ${day})`,
      previousDay: "Previous day",
      nextDay: "Next day",
      streak: (days: number) => `🔥 ${days} day${days === 1 ? "" : "s"} streak`,
      learn: "Learn",
      act: "Act",
      reflect: "Reflect",
      readToday: "Read today's insight",
      readThisDay: "Read this day's insight",
      doneClose: "Done — retaken & Keystone Habit declared",
      doneToday: "Done for today",
      done: "Done",
      answerPlaceholder: "Your answer…",
      examples: (examples: string) => `e.g. ${examples}`,
      saveToday: "Save today's progress",
      saveDay: (day: number) => `Save Day ${day}'s progress`,
      profileReveal: "All 7 ProAgeing Steps checked — see your full Healthy Longevity Profile on your",
      profileRevealLink: "dashboard",
      backToSummary: "← Back to my summary",
    },
    momentum: {
      title: "This week's momentum",
      countSuffix: (total: number) => `of ${total} days`,
      footerInProgress: "Do today's action to keep your week going.",
      footerComplete: "Perfect week — every day counted.",
    },
    testimonial: {
      heading: "Share your story",
      improvedMost: "What has improved the most?",
      otherPlaceholder: "What improved?",
      consentQuestion: "Would you be willing to share this anonymously to encourage other adults?",
      yes: "Yes",
      no: "No",
      beforeConcern: "Before this programme, what was your biggest concern about ageing?",
      changeNoticed: "What is one change you've noticed?",
      recommendation: "What would you say to someone your age who is hesitant to start?",
    },
    complete: {
      eyebrow: (total: number) => `Challenge complete · ${total} of ${total}`,
      title: "You're a ProAger",
      finishedOn: (date: string) => `Finished ${date}. Here's what changed.`,
      keystone: "Your keystone habit",
      keystoneFooter: (day: number) => `Declared on day ${day} · yours to keep`,
      daysDone: "Days done",
      bestStreak: "Best streak",
      retaken: "Retaken",
      whatMoved: "What moved",
      whatMovedRange: "When you started → now",
      betterRange: "Better range",
      sameRange: "Same range",
      lowerRange: "Lower range",
      firstTime: "First time",
      notRetaken: "Not retaken",
      readingsSaved: "Every retake is saved to your profile — your readings are already up to date.",
      seeReadings: "See my Longevity Readings",
      revisitDays: "Revisit any day",
    },
  },

  stepDetail: {
    unknown: "Unknown step.",
    backToDashboard: "← Back to dashboard",
    whyItMatters: "Why it matters",
    scienceShows: "What the science shows",
    takeCheck: (label: string) => `Take the ${label} check →`,
    prevStep: (n: number) => `← Step ${n}`,
    nextStep: (n: number) => `Step ${n} →`,
  },

  assess: {
    common: {
      exit: "← Exit",
      audio: "Audio",
      continue: "Continue",
      saving: "Saving…",
      saveAndReturn: (target: string) => `Save & return to ${target}`,
      notNow: "Not now",
      yourResult: "Your result",
      getReady: "Get ready",
      setPhoneDown: "Set your phone down and get into position.",
      returnTo: {
        program: "the 21-Day Challenge",
        readings: "your readings",
        dashboard: "dashboard",
      },
    },
    balance: {
      eyebrow: "Balance Check · ~2 minutes",
      title: "Balance Check",
      intro1:
        "This check uses the One-Leg Standing Test (eyes open) — how long you can balance on one leg with your eyes open — one of the most studied, self-testable markers of fall risk, with reference values from a pooled study of 4,683 older Japanese adults (Seino et al., 2014).",
      intro2:
        "Balance naturally changes with age, and this simple test tracks it well: one large study found impaired one-leg balance was the strongest independent predictor of injurious falls in older adults (Vellas et al., 1997).",
      readFirst: "⚠️ Please read before starting",
      readFirstBody:
        "This involves real balancing — only attempt it if you feel steady today, right next to a wall, counter, or sturdy furniture you can grab.",
      begin: "Let's begin",
      safetyHeading: "Two quick safety questions",
      supportQuestion: "Do you have a wall, counter, or sturdy furniture within arm's reach right now?",
      yesReady: "Yes, ready",
      notYet: "Not yet",
      safeQuestion: "Right now, are you free of dizziness, a recent fall, or any injury that would make standing on one leg unsafe?",
      yesFine: "Yes, I'm fine",
      notToday: "Not today",
      compareNote: "Just so we can compare your result fairly",
      yourAge: "Your age",
      yearsUnit: "years",
      male: "Male",
      female: "Female",
      holdOff: "Let's hold off",
      skipToday: "We'll skip the test for today",
      skipBody:
        "Balancing on one leg isn't a good idea right now without a clear support surface nearby, or while dealing with dizziness, a recent fall, or an injury. Please set up somewhere safer, or check with your doctor first.",
      setupHeading: "Get ready to balance",
      setupBarefoot: "barefoot or in socks",
      setup1Rest: ", right next to your support.",
      setupHands: "Hands on hips",
      setupEyes: "eyes open",
      setup2Rest: ", looking at a fixed point ahead.",
      setup3Pre: "Lift either foot a few inches off the floor and tap ",
      setupStart: "Start",
      setup4Pre: "Tap ",
      setupStop: "Stop",
      setup4Rest: " the moment your foot touches down, you shift, or your hands leave your hips.",
      capNote: "We'll time up to 60 seconds — that's the cap used in the research, so there's no need to go on longer.",
      stopNote: "Stop the moment you touch down, shift, or your hands leave your hips — capped at 60s.",
      ready: "I'm ready",
      balancingNow: "Balancing now",
      tapStopWhen: "Balancing… tap Stop when you touch down",
      tapStartWhen: "Tap Start when your foot lifts off",
      start: "Start",
      stop: "Stop",
      secondsBalanced: "seconds balanced",
      typicalRange: (lo: string, hi: string) => `Typical range for your age & sex: ${lo}–${hi}s (illustrative reference).`,
      doctorFlag: "⚠️ Worth mentioning to your doctor",
      doctorFlagBody:
        "Holding a one-leg stance for less than 5 seconds has been linked to a significantly higher risk of injurious falls. This is a signal worth following up on, not a diagnosis.",
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is an educational screening check, not a diagnosis. If you felt very unsteady during this test, please mention it to your doctor and consider having someone nearby next time.",
      sources: "Sources: Seino et al., 2014 (typical range) · Vellas et al., 1997 (fall-risk threshold).",
      result: {
        below: {
          label: "Below typical range for your age group",
          title: "A good focus area",
          text: "Balance is one of the most trainable physical abilities at any age — small daily practice, like standing on one leg while brushing your teeth, makes a difference within weeks.",
          nextSteps: [
            "Practise standing on one leg near a counter for 10–20 seconds, a few times a day.",
            "Mention this result to your doctor, especially alongside any recent unsteadiness or falls.",
            "Retest in a few weeks to track your progress.",
          ],
        },
        typical: {
          label: "Typical for your age group",
          title: "A solid, typical result",
          text: "You're in the typical range for your age and sex. Balance declines naturally with age, so this is worth tracking over time, ideally alongside strength work.",
          nextSteps: [
            "Try adding balance practice a few times a week to stay ahead of the typical decline.",
            "Retest every few months to track your trend.",
          ],
        },
        above: {
          label: "Above typical range for your age group",
          title: "Strong, steady balance",
          text: "Your balance is above average for your age and sex — one of the most consistent protective factors against falls. Whatever you're doing, it's working.",
          nextSteps: [
            "Keep doing whatever activity is supporting this.",
            "Retest every few months to keep tracking your trend.",
          ],
        },
      },
    },
    vo2max: {
      eyebrow: "Cardiorespiratory Fitness · ~3 minutes",
      title: "VO2 Max & Resting Heart Rate",
      intro1:
        "VO2 max measures how efficiently your heart, lungs, and muscles use oxygen during exercise. It's one of the strongest predictors of healthy longevity found in ageing research — in one study of over 122,000 adults, the fittest group had an 80% lower risk of death than the least fit (Mandsager et al., JAMA Network Open, 2018).",
      intro2:
        "We'll estimate yours from your resting heart rate using the Heart Rate Ratio Method (Uth et al., 2004) — no treadmill needed.",
      beforeBegin: "📏 Before you begin",
      beforeBeginBody:
        "For the most accurate result, measure your resting heart rate first thing in the morning, before getting out of bed. Count your pulse for a full 60 seconds.",
      begin: "Let's begin",
      tellUs: "Tell us about yourself",
      tellUsBlurb: "Just three numbers — no equipment needed beyond a watch or phone timer.",
      aboutYou: "About you",
      yourAge: "Your age",
      yearsUnit: "years",
      yourSex: "Your sex",
      male: "Male",
      female: "Female",
      restingHr: "Your resting heart rate",
      pulseCount: "Pulse count (60 seconds, at rest)",
      pulseBlurb: "Count your pulse for a full minute while sitting calmly, ideally first thing in the morning.",
      bpm: "beats per minute",
      seeResults: "See my results",
      estimatedVo2: "estimated VO2 max (mL/kg/min)",
      maxHr: "Max HR (bpm)",
      restingHrShort: "Resting HR (bpm)",
      estimateFor: (age: number, sex: string) => `Estimate for age ${age}, ${sex}.`,
      sexMale: "male",
      sexFemale: "female",
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is a formula-based estimate, not a lab measurement — individual accuracy varies, and it tends to underestimate VO2 max in fitter people. It's a screening tool, not a diagnosis. Always check with your doctor before starting a new exercise programme.",
      sources: "Sources: Max HR formula — Tanaka, Monahan & Seals, 2001. Fitness categories — Cooper Institute / ACSM norms.",
      category: {
        poor: "Poor for your age & sex",
        fair: "Fair for your age & sex",
        average: "Average for your age & sex",
        good: "Good for your age & sex",
        excellent: "Excellent for your age & sex",
        superior: "Superior for your age & sex",
      },
      result: {
        low: {
          title: "There is real room to improve",
          text: "Cardiorespiratory fitness responds well to regular moderate exercise at any age — even modest gains are linked to meaningfully lower long-term mortality risk in research. Zone 2 training (see the Training Zone Finder) is a good place to start.",
          nextSteps: [
            "Aim for 20–30 minutes of moderate activity most days — walking counts.",
            "Try a Training Zone Finder to find your ideal effort level.",
            "Recheck in a few months as your resting heart rate improves.",
          ],
        },
        average: {
          title: "A solid, typical fitness level",
          text: "You're in the typical range for your age and sex. Research shows that moving from average to good fitness is linked to a meaningful further drop in long-term health risk — worth the effort.",
          nextSteps: [
            "Add one more session of moderate cardio activity per week.",
            "Track your resting heart rate over time — a falling trend is a good sign of improving fitness.",
            "Recheck every few months.",
          ],
        },
        high: {
          title: "A strong protective factor",
          text: "Your estimated fitness is above typical for your age and sex — one of the most consistent markers linked to healthy, independent ageing in the research. Whatever you're doing, it's working.",
          nextSteps: [
            "Keep up your current activity routine.",
            "Recheck every few months to keep tracking your trend.",
            "Consider mixing in some higher-intensity intervals if your doctor is comfortable with that.",
          ],
        },
      },
    },
    nutritionProtein: {
      eyebrow: "Nutrition & Protein · ~3 minutes",
      title: "Nutrition & Protein Check",
      intro1:
        "Older adults need more protein per kg of body weight than younger adults do, just to maintain the same muscle — but intake often quietly falls short. This check screens how often you're eating protein-rich foods across a typical week.",
      intro2:
        "Adapted from the Protein Screener 55+ (Wijnhoven et al., PLOS ONE, 2018), a validated Dutch tool, using food items confirmed relevant to Singapore's multi-ethnic diet (Whitton, Ho, Rebello & van Dam, Public Health Nutrition, 2018). It's a directional guide, not a lab-grade measurement.",
      begin: "Let's begin",
      questionsHeading: "How often do you eat these?",
      questionsBlurb: "Think about a normal week for you — no right or wrong answers.",
      foods: [
        "Fish or seafood",
        "Chicken or other poultry",
        "Red meat (beef, pork, lamb)",
        "Eggs",
        "Tofu, tempeh, or other soy products",
        "Milk, soy milk, or yoghurt",
        "Beans, lentils, or other legumes",
        "Nuts or peanuts",
      ],
      frequency: ["Never", "1–2x/week", "3–4x/week", "5–6x/week", "Daily+"],
      portionQuestion: "At your main meal, how much meat, fish, tofu, or eggs do you usually have?",
      portions: ["A small amount", "About a palm-sized portion", "More than a palm-sized portion", "Not sure"],
      seeResults: "See my results",
      scoreCaption: "protein-source frequency score · out of 32",
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is an informational screening tool, not a diagnosis. For a precise measurement of your protein intake, ask your doctor for a referral to a dietitian.",
      result: {
        elevated: {
          label: "Low frequency",
          title: "Worth a closer look",
          text: "Protein-rich foods seem to be showing up infrequently across your week. Since older adults need more protein per kg of body weight than younger adults to maintain muscle, this is worth actively addressing.",
          nextSteps: [
            "Try adding a protein source to each meal, not just one meal a day.",
            "Tofu, eggs, and canned fish are inexpensive, low-effort ways to add protein at home.",
            "Consider asking your doctor for a referral to a dietitian for a precise assessment.",
          ],
        },
        watch: {
          label: "Moderate frequency",
          title: "A reasonable base, with room to build",
          text: "You're getting protein-rich foods regularly, but there may be room to spread them more evenly across meals, or increase portion size at meals where it's currently small.",
          nextSteps: [
            "Aim for a protein source at breakfast too, not just lunch and dinner.",
            "Frequency and portion size both matter — check your usual portion below.",
          ],
        },
        good: {
          label: "Good frequency",
          title: "A strong protein-source pattern",
          text: "Protein-rich foods are showing up often across your week — a good foundation for maintaining muscle as you age, especially alongside regular strength activity.",
          nextSteps: [
            "Keep this pattern going — it pairs well with the Build Strength & Balance checks.",
            "Recheck every few months to make sure this holds steady.",
          ],
        },
      },
    },
    sleepQuality: {
      eyebrow: "Sleep Check · ~5 minutes",
      title: "Sleep Quality Check",
      intro1:
        "This check is based on the Pittsburgh Sleep Quality Index (PSQI), one of the most widely used sleep questionnaires in research and clinical care.",
      intro2:
        "You'll answer a few questions about your sleep over the past month — when you go to bed, how long you sleep, and how often certain things disturb your rest.",
      begin: "Let's begin",
      seeResults: "See my results",
      timesHeading: "Thinking back over the past month…",
      timesBlurb: "Answer for a typical night — there's no need to be exact.",
      bedTime: "What time have you usually gone to bed?",
      wakeTime: "What time have you usually got up in the morning?",
      latencyQuestion: "How long has it usually taken you to fall asleep, in minutes?",
      latencyUnit: "minutes to fall asleep",
      hoursQuestion: "How many hours of actual sleep did you usually get at night? (this may be less than time in bed)",
      hoursUnit: "hours of actual sleep",
      disturbHeading: "How often has this kept you from sleeping well?",
      disturbBlurb: "For each one, choose how often it happened in the past month.",
      disturbances: [
        "Cannot get to sleep within 30 minutes",
        "Wake up in the middle of the night or early morning",
        "Have to get up to use the bathroom",
        "Cannot breathe comfortably",
        "Cough or snore loudly",
        "Feel too cold",
        "Feel too hot",
        "Had bad dreams",
        "Have pain",
      ],
      frequency: ["Never", "<1x/wk", "1–2x/wk", "3+/wk"],
      qualityHeading: "Overall, how would you rate your sleep quality?",
      qualityBlurb: "Thinking about the past month as a whole.",
      quality: ["Very good", "Fairly good", "Fairly bad", "Very bad"],
      medsHeading: "How often have you taken medicine to help you sleep?",
      medsBlurb: "Prescribed or over-the-counter — either counts.",
      meds: ["Not during the past month", "Less than once a week", "Once or twice a week", "Three or more times a week"],
      daytimeHeading: "Two last questions",
      daytimeBlurb: "How the past month felt during the day.",
      awakeQuestion: "How often have you had trouble staying awake while driving, eating meals, or being social?",
      enthusiasmQuestion: "How much of a problem has it been to keep up enough enthusiasm to get things done?",
      problem: ["No problem", "Slight", "Somewhat", "A big problem"],
      globalScore: "Global sleep score (0–21, lower is better)",
      cutoff: (efficiency: number) =>
        `A score of 5 or below is associated with good sleep quality; above 5 is associated with poor sleep quality. Your sleep efficiency: ${efficiency}%.`,
      behindScore: "What's behind your score",
      components: [
        "Sleep quality (your own rating)",
        "Sleep latency (time to fall asleep)",
        "Sleep duration",
        "Sleep efficiency",
        "Sleep disturbances",
        "Use of sleep medication",
        "Daytime dysfunction",
      ],
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is a wellness screening tool based on a published research questionnaire, not a medical diagnosis. If sleep problems are affecting your daily life, it's worth discussing with your doctor.",
      sources: "Sources: Pittsburgh Sleep Quality Index (PSQI); Buysse et al., 1989.",
      result: {
        good: {
          label: "Good sleep quality",
          title: "Your sleep looks solid overall",
          text: "A score of 5 or below is associated with good sleep quality in the research this check is based on. Keep doing what's working — consistent sleep habits are one of the most protective things for healthy ageing.",
          nextSteps: [
            "Keep a regular bed and wake time, even at weekends.",
            "Recheck in a few weeks if your routine changes.",
            "Mention any new sleep problems to your doctor at your next visit.",
          ],
        },
        poor: {
          label: "Poor sleep quality",
          title: "This is a signal worth acting on",
          text: "A score above 5 is associated with poor sleep quality in the research this check is based on. Sleep problems are common and very treatable — the breakdown below shows which parts of your sleep are affected most.",
          nextSteps: [
            "Look at your highest-scoring component below — that's the most useful place to start.",
            "Keep a regular bed and wake time, and reduce screens before bed.",
            "Mention this result to your doctor, especially if it has lasted more than a few weeks.",
          ],
        },
      },
    },
    connection: {
      eyebrow: "Connection Check · ~3 minutes",
      title: "Connection Check",
      intro1:
        "This check looks at two sides of connection: how big your family and friend network is, and how connected you actually feel day to day.",
      intro2:
        "Combines two validated instruments: the Lubben Social Network Scale (LSNS-6; Lubben et al., The Gerontologist, 2006) for network size, and the UCLA-3 Loneliness Scale (Hughes et al., Research on Aging, 2004) for how connected you feel. A 2022 Singapore study of 606 older adults found that feeling lonely — not network size alone — was the one linked to higher frailty risk (Ge, Yap & Heng, BMC Geriatrics).",
      begin: "Let's begin",
      questionsHeading: "Your family, friends, and feelings",
      questionsBlurb: "There are no right or wrong answers — just answer as accurately as you can.",
      sections: { family: "Your family", friends: "Your friends", feelings: "How you've been feeling" },
      questions: [
        "How many relatives do you see or hear from at least once a month?",
        "How many relatives do you feel at ease with that you can talk about private matters?",
        "How many relatives do you feel close to, such that you could call on them for help?",
        "How many friends do you see or hear from at least once a month?",
        "How many friends do you feel at ease with that you can talk about private matters?",
        "How many friends do you feel close to, such that you could call on them for help?",
        "How often do you feel that you lack companionship?",
        "How often do you feel left out?",
        "How often do you feel isolated from others?",
      ],
      frequency: ["None", "One", "Two", "Three or four", "Five to eight", "Nine or more"],
      loneliness: ["Hardly ever", "Some of the time", "Often"],
      seeResults: "See my results",
      scoreCaption: "loneliness score · lower means less lonely",
      bands: (total: number) =>
        `Score ${total} of 9 (range 3–9). In the Singapore sample this check is based on: 3 = not lonely, 4–5 = somewhat lonely, 6–9 = lonely.`,
      networkHeading: "Your social network",
      familyNetwork: (n: number) => `Family network (${n}/15)`,
      friendsNetwork: (n: number) => `Friend network (${n}/15)`,
      isolated: "Isolated",
      connected: "Connected",
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is a research-based screening tool, not a diagnosis. If persistent loneliness is affecting your wellbeing, please talk to your doctor or a counsellor.",
      sources: "Sources: Hughes et al., 2004 (UCLA-3) · Lubben et al., 2006 (LSNS-6).",
      result: {
        good: {
          label: "Not lonely",
          title: "A well-connected picture, going by how you feel",
          text: "In the Singapore study this check is based on, this is the range linked to lower frailty risk — feeling connected mattered more than network size alone.",
          nextSteps: [
            "Keep up the social activities behind this — in the same study they were linked to lower frailty on their own.",
            "Recheck every few months, since this shifts with life changes.",
          ],
        },
        watch: {
          label: "Somewhat lonely",
          title: "Worth paying attention to",
          text: "This is the middle band — not the highest-risk range, but the Singapore study found loneliness at this level is worth taking seriously rather than waiting for it to become more pronounced.",
          nextSteps: [
            "In the same study, regular social participation (classes, clubs, volunteering) was linked to lower frailty risk, independent of network size.",
            "Recheck in a few months to see which way this is heading.",
          ],
        },
        elevated: {
          label: "Lonely",
          title: "Please take this seriously",
          text: 'A score of 6 or higher is the range the Singapore study classified as "lonely" — the one factor, among those measured, that was directly linked to higher frailty risk.',
          nextSteps: [
            "Consider talking to your doctor or a counsellor if this feeling has been persistent.",
            "Regular social participation (classes, clubs, volunteering) was linked to lower frailty independent of network size — even small, regular activities can help.",
          ],
        },
      },
    },
    cognitiveDecline: {
      eyebrow: "Cognitive Health Check · ~3 minutes",
      title: "Cognitive Decline Risk Check",
      intro1:
        "This check uses the SLAS Risk Index, developed and validated by the Singapore Longitudinal Ageing Study (Ng et al., 2021). It's a short, self-reported checklist of 10 personal, lifestyle and health factors shown to predict a person's 3–5 year risk of mild cognitive impairment (MCI) or dementia.",
      intro2:
        "It was field-tested with over 400 community-living older adults in Singapore to identify who would benefit most from early lifestyle support — the same approach we're using here.",
      begin: "Let's begin",
      questionsHeading: "Tell us about yourself",
      questionsBlurb:
        "These are the same questions used in the original research checklist. There are no right or wrong answers — just answer as accurately as you can.",
      sections: {
        about: "About you",
        feelings: "How you've been feeling",
        senses: "Your senses",
        markers: "Health markers (ask your doctor if unsure)",
      },
      questions: [
        "What is your age?",
        "What is your sex?",
        "What is your highest level of education?",
        "Have you been treated for depression, or do you currently have 5 or more symptoms of depression (such as low mood, loss of interest, poor sleep, low energy, or poor concentration)?",
        "Overall, would you say you are not very satisfied with your life?",
        "Do you have problems hearing well?",
        "Is your waist circumference wide? (over 90cm / 35in for men, over 80cm / 31in for women)",
        "Do you have pre-diabetes or diabetes, or take medicine for high blood sugar?",
        "Do you have high blood pressure (130/85mmHg or more), or take medicine for it?",
        'Do you have high triglycerides or low HDL ("good") cholesterol, or take medicine for abnormal blood lipids?',
      ],
      options: {
        age: ["Under 65", "65–74", "75 or older"],
        sex: ["Male", "Female"],
        education: ["Secondary school or higher", "Primary school or no formal schooling"],
        lifeSat: ["No, I'm satisfied", "Yes, not very satisfied"],
        yesNo: ["No", "Yes"],
      },
      seeResults: "See my results",
      scoreCaption: "risk index score · higher means higher risk",
      bands: (total: number) =>
        `Score ${total} of 13. In the original research, scores under 6 were linked to under 10% predicted risk; 6–7 was the study's screening threshold; 8 and above showed a clinically meaningful drop in cognitive test scores.`,
      behindScore: "What's behind your score",
      components: {
        age: "Age",
        sex: "Sex",
        education: "Education",
        depression: "Mood / depression",
        lifeSat: "Life satisfaction",
        hearing: "Hearing",
        cardio: (n: number) => `Metabolic health (${n} of 4 factors)`,
      },
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is a research-based screening tool, not a diagnosis. Only a doctor can assess memory or thinking changes properly — please share this result with yours, especially if your score is 6 or higher.",
      result: {
        good: {
          label: "Below the screening threshold",
          title: "A lower-risk profile right now",
          text: 'In the original research, scores below 6 were associated with a predicted MCI/dementia risk of well under 10% over 3–5 years — the range the study used as its "below threshold" band. Many of these factors (mood, hearing, metabolic health) are also changeable, so this is a good score to protect.',
          nextSteps: [
            "Look at \"What's behind your score\" below — any flagged item is worth addressing even at a lower total score.",
            "Recheck every few months, since scores can shift with health changes.",
            "Keep up whatever is keeping your metabolic health, hearing, and mood in good shape.",
          ],
        },
        watch: {
          label: "At the screening threshold",
          title: "Worth a conversation with your doctor",
          text: "A score of 6 or 7 is the exact threshold the original study used to identify people for a 6-month lifestyle support programme — not because dementia is present, but because this range is where early support made a measurable difference to cognitive test scores in that trial.",
          nextSteps: [
            "Share this result with your doctor — ask specifically about the flagged items below.",
            "Multidomain lifestyle programmes (exercise, diet, cognitive and social activity) are what the original study used at this score range.",
            "Recheck in a few months to see whether your score is trending down.",
          ],
        },
        elevated: {
          label: "Above the screening threshold",
          title: "Please discuss this with your doctor soon",
          text: "In the original study, participants scoring 8 or higher had noticeably lower cognitive test scores than those at 6–7 — a large enough gap to matter clinically. This is a screening flag, not a diagnosis, but it's a strong enough signal to act on.",
          nextSteps: [
            "Book a check-up with your doctor and bring this result — ask about a proper cognitive assessment.",
            "Review the flagged items below together; several (blood pressure, hearing, mood) are treatable.",
            "Consider a structured lifestyle programme covering exercise, diet, and social and cognitive activity.",
          ],
        },
      },
    },
    familyHistory: {
      eyebrow: "Family History · ~2 minutes",
      title: "Family History: Know Your Risk",
      intro1:
        "Knowing your family's medical history tells you which risks to watch most closely. Answer a few short questions to map your inherited risk across the main categories that run in families — then share the answers with your doctor to guide earlier, smarter screening.",
      intro2:
        "Wherever Singapore-specific guidance exists (MOH Clinical Practice Guidelines), we use it — it's often stricter or differently calibrated than international guidelines. Where it doesn't, we fall back to international standards, and say so.",
      begin: "Let's begin",
      questionsHeading: "Has this run in your family?",
      questionsBlurb:
        "For each category, tell us if a first-degree relative (parent, sibling, or child) has been diagnosed — and at what age, if you know it.",
      yourSex: "Your sex",
      sexNote: "Used only to apply the right cardiovascular screening threshold (Singapore MOH: male <50, female <60).",
      male: "male",
      female: "female",
      yes: "Yes",
      no: "No",
      ageLabel: "Age of the youngest relative when diagnosed (your best estimate is fine)",
      cancerTypeLabel: "Which type, mainly? (pick the one you know best)",
      cancerTypes: { breast: "Breast", colorectal: "Colorectal", ovarian: "Ovarian", other: "Other" },
      relativeCountLabel: "How many relatives were diagnosed with this?",
      relativeCountOne: "One",
      relativeCountTwoPlus: "Two or more",
      sameSideLabel: "Are they on the same side of the family?",
      sameSideHelp:
        "Two relatives on the same side (both your mother's side, or both your father's) is a stronger signal than one on each side — these cancers are common enough that one on each side is usually just chance.",
      sameSideYes: "Same side",
      sameSideNo: "Different sides",
      seeResults: "See my results",
      flaggedCaption: (elevated: number) =>
        `of 4 categories show family history${elevated > 0 ? ` (${elevated} elevated)` : ""}`,
      // Not always early-onset any more — the cancer category can also
      // reach "elevated" via a same-side cluster at any age (see
      // cancer.clusterText), so this label can't claim age on its own.
      flags: { none: "No flag", present: "Family history", elevated: "Elevated" },
      disclaimer:
        "This is an informational screening tool, not a diagnosis. Only a doctor can properly assess your personal and family risk — please share these answers with them, especially for any category flagged above.",
      categories: {
        cvd: { title: "Cardiovascular Disease", sub: "Heart attack, stroke, or heart disease in a parent, sibling, or child." },
        cancer: { title: "Cancer", sub: "Breast, ovarian, colorectal, or other cancer in a parent, sibling, or child." },
        neuro: { title: "Alzheimer's / Neurological Disease", sub: "Dementia, Parkinson's, or another neurological condition in a parent, sibling, or child." },
        metabolic: { title: "Metabolic Disease", sub: "Diabetes, obesity, or metabolic syndrome in a parent, sibling, or child." },
      },
      noneText: "No reported family history in this category.",
      noneSteps: {
        cvd: ["Keep up with routine cardiovascular screening as your doctor recommends."],
        cancer: ["Keep up with routine age-appropriate cancer screening."],
        neuro: ["Our Cognitive Decline Risk check is still a good baseline to establish, regardless of family history."],
        metabolic: ["Keep up with routine metabolic screening (blood sugar, weight) as your doctor recommends."],
      },
      cvd: {
        femaleRelative: "female relative diagnosed before 60",
        maleRelative: "male relative diagnosed before 50",
        earlyText: (who: string) =>
          `Singapore's MOH Lipids guideline classifies a first-degree ${who} as "premature" family heart disease — a recognised risk-enhancing factor.`,
        earlySteps: [
          "Ask your doctor about earlier and more frequent blood pressure and cholesterol checks.",
          "Ask about the Singapore-modified Framingham Risk Score (SG-FRS) to put your own numbers in context.",
        ],
        presentText:
          "Family history of heart disease still matters, even without early onset — it's worth mentioning at your next check-up.",
        presentSteps: ["Bring this up at your next routine check-up.", "Keep your blood pressure and cholesterol checks on schedule."],
      },
      cancer: {
        colorectalEarly:
          "Singapore's MOH guideline classifies a first-degree relative with colorectal cancer at 60 or younger as needing earlier, more frequent screening.",
        colorectalLate:
          "Even with a later diagnosis in the family, MOH guidance still recommends starting colorectal screening earlier than the general population.",
        colorectalStep: (startAge: number, interval: number) =>
          `MOH guidance: start colonoscopy screening at age ${startAge}, repeated every ${interval} years.`,
        colorectalStep2: "Share this with your doctor to confirm the right starting point for you.",
        breastEarly:
          "A first-degree relative with breast cancer at 60 or younger is a recognised reason to consider starting mammography earlier than the general population.",
        breastLate: "Family history of breast cancer still raises your own risk, even with a later diagnosis.",
        breastEarlySteps: [
          "Guidelines commonly suggest starting roughly 10 years before your relative's age at diagnosis — though recent research (BCSC, 2022) questions applying this uniformly, especially for relatives diagnosed 35–45. Discuss the right starting point with your doctor.",
          "Share your relative's exact age and cancer subtype — these details change the recommendation.",
        ],
        breastLateSteps: ["Mention it at your next check-up.", "Keep up with age-appropriate mammography screening."],
        otherEarly:
          "Early-onset cancer in a first-degree relative — or certain cancers (breast, ovarian, colorectal) running in the family — can point to an inherited gene mutation such as BRCA1/2 or Lynch syndrome.",
        otherLate: "Family history of cancer is worth tracking even without early onset.",
        otherEarlySteps: [
          "Consider asking your doctor for a referral to genetic counselling.",
          "Share exactly which relative, which cancer, and their age at diagnosis — these details change the recommendation.",
        ],
        otherLateSteps: ["Mention it at your next check-up.", "Keep up with age-appropriate cancer screening."],
        clusterText:
          "Two or more relatives with the same cancer on one side of your family (both maternal or both paternal) is itself a recognised marker of inherited risk — independent of age at diagnosis.",
        clusterSteps: [
          "Consider asking your doctor for a referral to genetic counselling.",
          "Share exactly which relatives were affected and which side of the family they're on — this detail changes the recommendation.",
        ],
      },
      neuro: {
        earlyText:
          "A first-degree relative diagnosed before 65 is classed as early-onset — rarer, and in a small share of cases linked to an inherited form (genes such as PSEN1 or APP) rather than just raising general risk.",
        earlySteps: [
          "Discuss your family history with your doctor, especially the early age of onset.",
          "Ask about a referral to genetic counselling if you want to explore this further — this is where testing is most likely to be informative.",
          "Our Cognitive Decline Risk check is a good next step to establish your own baseline.",
        ],
        presentText:
          "Family history of dementia or Parkinson's after 65 is a well-documented risk factor, though routine genetic testing generally isn't recommended at this stage — it's a risk modifier, not a diagnosis.",
        presentSteps: ["Mention it at your next check-up.", "Our Cognitive Decline Risk check is a good next step to establish your own baseline."],
      },
      metabolic: {
        veryEarlyText:
          "A relative diagnosed with diabetes quite young (under 35) is worth specifically mentioning to your doctor — very early-onset diabetes in a family sometimes follows a stronger genetic pattern.",
        presentText:
          "Singapore's MOH guideline treats any first-degree relative with diabetes as a screening risk factor, regardless of the age they were diagnosed — this is also one of the most modifiable categories here.",
        steps: [
          "Ask about screening — MOH recommends it for adults with a family history of diabetes at any age.",
          "For Asians, the BMI threshold for increased risk is lower than Western guidelines (≥23, vs ≥25) — worth knowing your own number.",
          "Lifestyle changes meaningfully reduce this risk — see our Daily Movement and Nutrition checks.",
        ],
      },
    },
    purpose: {
      eyebrow: "Purpose Check · ~3 minutes",
      title: "Sense of Purpose Check",
      intro1Pre: "This check is based on the Ikigai-9 (Imai, Osada & Nishimura, 2012), a validated Japanese scale measuring ",
      intro1Em: "ikigai",
      intro1Post:
        " — roughly, \u201Ca reason for being\u201D — across three themes: how you feel about your life, your attitude towards the future, and the sense that your existence matters.",
      intro2:
        "The concept of ikigai has been linked in Japanese cohort research (e.g. the Ohsaki study, Sone et al., 2008) to a lower risk of death over time — one of several strands of evidence connecting a sense of purpose to healthy ageing.",
      begin: "Let's begin",
      seeResults: "See my results",
      questionsEyebrow: "Your own honest reaction",
      questionsHeading: "How much do you agree with each?",
      questionsBlurb: "Thinking about your life right now — there are no right or wrong answers.",
      questions: [
        "I often feel that I am happy.",
        "My life is mentally rich and fulfilled.",
        "I am interested in many things.",
        "I would like to develop myself.",
        "I would like to learn something new or start something.",
        "I have room in my mind.",
        "I believe that I have some impact on someone.",
        "I feel that I am contributing to someone or to society.",
        "I think that my existence is needed by something or someone.",
      ],
      agreement: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
      outOf45: "out of 45 · higher means stronger ikigai",
      bands: (total: number) =>
        `Score ${total} of 45. Illustrative bands only: 9–20 lower, 21–32 moderate, 33–45 strong — not official clinical cutoffs.`,
      behindScore: "What's behind your score",
      subscales: [
        "Positive feelings towards life",
        "Active attitude towards the future",
        "Sense that your existence matters",
      ],
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is a wellness reflection tool based on a published research questionnaire, not a mental health diagnosis. If you're feeling persistently low, hopeless, or unmotivated, please reach out to your doctor or a counsellor — support helps.",
      result: {
        low: {
          label: "Lower sense of ikigai right now",
          title: "This is worth paying attention to",
          text: 'Your answers suggest your sense of "reason for being" feels thin right now. That\'s a common, changeable state — not a diagnosis — and often shifts when you reconnect with activities, people, or goals that matter to you.',
          nextSteps: [
            "Look at your lowest-scoring theme below — that's the most useful place to start.",
            "Pick one small activity this week that feels meaningful, not just necessary.",
            "If low motivation or low mood has lasted more than two weeks, mention it to your doctor.",
          ],
        },
        mid: {
          label: "Moderate sense of ikigai",
          title: "A fairly typical, mixed picture",
          text: "Some parts of your life feel purposeful, others less so — which is normal. Research links even modest gains in purpose-related measures with better health outcomes over time, so small changes can still be worthwhile.",
          nextSteps: [
            "Notice which theme below scores lowest, and try one small step towards it this week.",
            "Consider a small goal or role (volunteering, a hobby, family involvement) that gives structure to your week.",
            "Retake this check in a few weeks to track any shift.",
          ],
        },
        high: {
          label: "Strong sense of ikigai",
          title: "A real protective factor",
          text: "Your answers reflect a strong, consistent sense of purpose across all three themes — one of the more robust psychological correlates of healthy ageing in the research literature. Whatever is giving your days meaning right now, it's worth protecting.",
          nextSteps: [
            "Keep investing time in the activities and relationships driving this.",
            "Retake this check every few months — ikigai can shift with life changes like retirement or loss.",
            "Share what's working with someone else — purpose is often contagious.",
          ],
        },
      },
    },
    sitToStand: {
      eyebrow: "Physical Function Check · ~4 minutes",
      title: "Sit-to-Stand Check",
      intro1:
        "This test measures the strength in your legs and hips — the muscles you use every day to get up from a chair, climb stairs, or catch your balance.",
      intro2:
        "You'll stand up and sit down from a chair as many times as you can in 30 seconds. No equipment needed beyond a sturdy chair.",
      begin: "Let's begin",
      safetyHeading: "Two quick safety questions",
      chairQuestion: "Do you have a sturdy chair with no wheels, that won't slide when you sit or stand?",
      chairYes: "Yes, ready",
      chairNo: "Not yet",
      safeQuestion:
        "Right now, are you free of pain, dizziness, or a recent injury that would make standing up repeatedly unsafe?",
      safeYes: "Yes, I'm fine",
      safeNo: "Not today",
      compareNote: "Just so we can compare your result fairly",
      yourAge: "Your age",
      yearsUnit: "years",
      female: "Female",
      male: "Male",
      holdOff: "Let's hold off",
      skipToday: "We'll skip the test for today",
      skipBody:
        "Standing up repeatedly isn't a good idea while you're dealing with pain, dizziness, or a recent injury, or without a chair that won't slide. Please check with your doctor first, or get set up safely — we'll be right here whenever you're ready to try.",
      setupHeading: "Set up your chair like this",
      watchLoop: "Watch it loop once, then try a slow practice rep yourself.",
      setup1Strong: "Back against a wall.",
      setup1: "Or push it into a corner so it can't slide.",
      setup2Strong: "Sit towards the front edge.",
      setup2: "Feet flat on the floor, about shoulder-width apart.",
      setup3Strong: "Cross your arms over your chest.",
      setup3: "No pushing off with your hands or the chair arms.",
      setupBody:
        "In the real check, do as many full stands as you can in 30 seconds. Full stand, full sit, that's one rep. Just count each one in your head — no need to touch your phone while you're moving. We'll ask for your total once the timer ends.",
      ready: "I'm ready",
      timeRemaining: "Time remaining",
      go: "Go — as many full stands as you can.",
      halfway: "Halfway there — keep going.",
      almostDone: "Almost done.",
      countInHead:
        "🧠 Count each full stand in your head. No need to touch your phone — we'll ask for your total when time's up.",
      stopRest: "Stop",
      timesUp: "Time's up",
      howMany: "How many did you complete?",
      countOnlyFull: "Count only full stands — all the way up, all the way back down.",
      seeResults: "See my results",
      standsIn30: "full stands in 30 seconds",
      typicalRange: (lo: number, hi: number) => `Typical range for your group: ${lo}–${hi} stands (illustrative reference).`,
      disclaimer:
        "This is an educational screening check, not a diagnosis. If you felt very unsteady during this test, please mention it to your doctor.",
      sources: "Sources: Rikli & Jones Senior Fitness Test, 1999.",
      result: {
        below: {
          label: "Below typical range for your age group",
          title: "This is a signal, not a diagnosis",
          text: "Lower-body strength is one of the most trainable aspects of ageing — research shows meaningful improvement is possible within 8–12 weeks of consistent, simple exercise. Worth mentioning at your next doctor visit, especially alongside any recent changes in balance or stair-climbing.",
        },
        within: {
          label: "Within typical range for your age group",
          title: "Holding steady",
          text: "Your lower-body strength is where we'd expect for your age. This is exactly the kind of measure that quietly declines if it isn't used — regular movement helps you stay right here.",
        },
        above: {
          label: "Above typical range for your age group",
          title: "Stronger than most peers your age",
          text: "This is strongly associated with staying independent and lowering fall risk as you age. Whatever you're doing for activity, it's working — keep it up.",
        },
      },
    },
  },

  trends: {
    title: "Your Trends",
    blurb:
      "Every check you've ever taken, so you can see how you're changing over time — not just your latest result.",
    noChecks: "No checks yet.",
    retake: "Retake",
    start: "Start",
  },

  readingDetail: {
    unknown: "Unknown assessment.",
    backToReadings: "← Back to readings",
    yourProgress: "Your progress",
    trendTitle: (name: string) => `${name} Trend`,
    noResults: "No results saved yet. Take this check to start building your trend here.",
    history: "History",
    takeCheck: "Take this check",
    retakeCheck: "Retake this check",
  },

  landing: {
    tagline: "Add life to your years.",
  },

  upgradeSuccess: {
    title: "You're all set",
    body: "Your payment went through. It may take a few seconds for your plan to show as active.",
    backToDashboard: "Back to dashboard",
  },

  consent: {
    heading: "Consent of data usage & PDPA",
    clauses: [
      "Purpose of Collection — I consent to ProAge collecting, using, and storing my personal data and assessment results for the purposes of conducting the assessment, providing post-session advice, and for internal quality assurance.",
      "Compliance of PDPA — I acknowledge that ProAge will protect my data in accordance with the Personal Data Protection Act (PDPA). I understand that my data will not be sold or disclosed to unauthorised third parties.",
    ],
  },
};

export type Dictionary = typeof en;
