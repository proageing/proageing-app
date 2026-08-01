import Image from "next/image";
import { ARTICLES } from "@/lib/articles";

// Mirrors proageing.org/articles.html's card grid, filtered to the 7
// ProAgeing Steps and pointed back out to the site where the full articles
// live.
export function ArticlesSection() {
  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">Articles</p>
      <p className="mt-1 text-sm text-ink-soft dark:text-ink-dark-soft">One read per ProAgeing Step, from proageing.org.</p>

      <div className="mt-4 flex flex-col gap-3">
        {ARTICLES.map((article) => (
          <a
            key={article.href}
            href={article.href}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden rounded-[14px] border-[1.5px] border-border bg-white shadow-sm transition hover:border-primary dark:border-border-dark dark:bg-white/5"
          >
            <div className="relative aspect-[16/9] w-full">
              <Image src={article.image} alt="" fill className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">
                Step {article.step} · {article.theme}
              </p>
              <h3 className="mt-1 font-serif text-base font-semibold leading-snug text-ink dark:text-ink-dark">{article.title}</h3>
              <p className="mt-1 text-xs text-ink-soft dark:text-ink-dark-soft">Isaiah Chng · {article.minutes} min read</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
