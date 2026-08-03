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

  consent: {
    heading: "Consent of data usage & PDPA",
    clauses: [
      "Purpose of Collection — I consent to ProAge collecting, using, and storing my personal data and assessment results for the purposes of conducting the assessment, providing post-session advice, and for internal quality assurance.",
      "Compliance of PDPA — I acknowledge that ProAge will protect my data in accordance with the Personal Data Protection Act (PDPA). I understand that my data will not be sold or disclosed to unauthorised third parties.",
    ],
  },
};

export type Dictionary = typeof en;
