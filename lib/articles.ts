export interface Article {
  step: number;
  theme: string;
  title: string;
  minutes: number;
  image: string;
  href: string;
}

// Mirrors proageing.org/articles.html — one article per ProAgeing Step,
// linking out to the marketing site since the articles live there, not
// in the app.
export const ARTICLES: Article[] = [
  {
    step: 1,
    theme: "Clarify Your Future",
    title: "The Longevity Paradox: Living Longer Is Not the Goal — Living Better Is",
    minutes: 4,
    image: "/articles/article-longevity-paradox.jpg",
    href: "https://proageing.org/the-longevity-paradox.html",
  },
  {
    step: 2,
    theme: "Healthspan Risks",
    title: "The Middle-Age Numbers Nobody Tells You About",
    minutes: 4,
    image: "/articles/article-middle-age-numbers.jpg",
    href: "https://proageing.org/middle-age-health-numbers.html",
  },
  {
    step: 3,
    theme: "Daily Movement",
    title: "Exercise Is Not About Looking Younger. It Is About Staying Independent.",
    minutes: 4,
    image: "/articles/article-daily-movement.jpg",
    href: "https://proageing.org/exercise-for-independence.html",
  },
  {
    step: 4,
    theme: "Strength & Balance",
    title: "You Don't Need to Reverse Ageing. You Need to Prepare for It.",
    minutes: 3,
    image: "/articles/article-prepare-not-reverse.jpg",
    href: "https://proageing.org/prepare-not-reverse-ageing.html",
  },
  {
    step: 5,
    theme: "Fuel Your Body",
    title: "Eating for Muscle, Not Just for Weight",
    minutes: 3,
    image: "/articles/article-eating-for-muscle.jpg",
    href: "https://proageing.org/eating-for-muscle.html",
  },
  {
    step: 6,
    theme: "Sleep & Stress",
    title: "Recovery Is Not the Reward for the Work. It Is Part of the Work.",
    minutes: 3,
    image: "/articles/article-recovery.jpg",
    href: "https://proageing.org/recovery-is-part-of-the-work.html",
  },
  {
    step: 7,
    theme: "Connection",
    title: "You Don't Age Alone — And You're Not Meant To",
    minutes: 3,
    image: "/articles/article-connection.jpg",
    href: "https://proageing.org/you-dont-age-alone.html",
  },
];
