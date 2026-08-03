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
    title: "Your Longevity Readings",
    blurb: "Every check you've taken, and your latest result for each.",
    yourChecks: "Your 9 checks",
    notStarted: "Not started",
    legend: {
      typical: "Typical",
      worthALook: "Worth a look",
      seeDoctor: "Discuss with your doctor",
    },
    missingHistory: "Missing history from proageing.org?",
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
    blurb:
      "Your 9 free assessment checks are always free, and your account keeps a free history of every check you take over time. These are the guided programmes that turn your results into a daily plan.",
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
      title: "The 21-Day ProAgeing Challenge",
      blurb:
        "Your 9 free assessment checks are always free. The guided 21-Day Challenge — daily actions, streaks, and a Keystone Habit at the end — is a paid programme.",
      seePlans: "See plans & pricing",
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
      ready: "I'm ready",
      balancingNow: "Balancing now",
      tapStopWhen: "Balancing… tap Stop when you touch down",
      tapStartWhen: "Tap Start when your foot lifts off",
      start: "Start",
      stop: "Stop",
      secondsBalanced: "seconds balanced",
      typicalRange: (lo: string, hi: string) =>
        `Typical range for your age & sex: ${lo}–${hi}s (illustrative reference, Seino et al., 2014).`,
      doctorFlag: "⚠️ Worth mentioning to your doctor",
      doctorFlagBody:
        "Holding a one-leg stance for less than 5 seconds has been linked to a significantly higher risk of injurious falls (Vellas et al., 1997). This is a signal worth following up on, not a diagnosis.",
      nextStepsHeading: "✅ Suggested next steps",
      disclaimer:
        "This is an educational screening check, not a diagnosis. If you felt very unsteady during this test, please mention it to your doctor and consider having someone nearby next time.",
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
      stopRest: "Stop — I need to rest",
      timesUp: "Time's up",
      howMany: "How many did you complete?",
      countOnlyFull: "Count only full stands — all the way up, all the way back down.",
      seeResults: "See my results",
      standsIn30: "full stands in 30 seconds",
      typicalRange: (lo: number, hi: number) =>
        `Typical range for your group: ${lo}–${hi} stands (illustrative reference, Rikli & Jones Senior Fitness Test).`,
      disclaimer:
        "This is an educational screening check, not a diagnosis. If you felt very unsteady during this test, please mention it to your doctor.",
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

  consent: {
    heading: "Consent of data usage & PDPA",
    clauses: [
      "Purpose of Collection — I consent to ProAge collecting, using, and storing my personal data and assessment results for the purposes of conducting the assessment, providing post-session advice, and for internal quality assurance.",
      "Compliance of PDPA — I acknowledge that ProAge will protect my data in accordance with the Personal Data Protection Act (PDPA). I understand that my data will not be sold or disclosed to unauthorised third parties.",
    ],
  },
};

export type Dictionary = typeof en;
