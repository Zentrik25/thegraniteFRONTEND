/**
 * HomeOpinionRow — 3-column opinion cards on Apple light gray (#f5f5f7).
 * Each card: author initial avatar + name, Playfair headline, excerpt.
 */

import Link from "next/link";

import type { SectionDetail } from "@/lib/types";

interface HomeOpinionRowProps {
  section: SectionDetail;
}

export function HomeOpinionRow({ section }: HomeOpinionRowProps) {
  const articles = [
    ...(section.hero_article ? [section.hero_article] : []),
    ...section.articles,
  ].slice(0, 3);

  if (articles.length === 0) return null;

  return (
    <section className="gp-opinion-row" aria-labelledby="gp-opinion-label">
      <div className="gp-opinion-inner">
        <div className="gp-section-head">
          <h2 className="gp-section-label" id="gp-opinion-label">
            Opinion
          </h2>
          <Link href={`/sections/${section.slug}`} className="gp-section-more">
            More Opinion →
          </Link>
        </div>

        <div className="gp-opinion-grid">
          {articles.map((article) => {
            const authorInitial = article.author_name?.[0]?.toUpperCase() ?? "A";
            return (
              <article key={article.slug} className="gp-opinion-card">
                <div className="gp-opinion-author-row">
                  <div className="gp-opinion-avatar" aria-hidden="true">
                    {authorInitial}
                  </div>
                  <span className="gp-opinion-author-name">
                    {article.author_name ?? "Staff Writer"}
                  </span>
                </div>

                <h3 className="gp-opinion-headline">
                  <Link href={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>

                {article.excerpt && (
                  <p className="gp-opinion-excerpt">{article.excerpt}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
