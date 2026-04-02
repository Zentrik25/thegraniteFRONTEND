import Link from "next/link";

import type { ArticleSummary, SectionDetail } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HomeSectionsProps {
  sections: SectionDetail[];
}

function SectionBlock({ section }: { section: SectionDetail }) {
  const lead: ArticleSummary | null = section.hero_article ?? section.articles[0] ?? null;
  const sideItems = section.articles
    .filter((a) => a.slug !== lead?.slug)
    .slice(0, 3);

  if (!lead && sideItems.length === 0) return null;

  const sectionHref = `/sections/${section.slug}`;

  return (
    <div className="hp-section-block">
      <div className="hp-section-head">
        <Link className="hp-section-name" href={sectionHref}>
          {section.name}
        </Link>
        <Link className="hp-section-more" href={sectionHref}>
          More {section.name} →
        </Link>
      </div>

      <div className="hp-section-grid">
        {lead && (
          <article>
            {lead.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="hp-section-lead-img"
                src={mediaProxyPath(lead.image_url) ?? ""}
                alt={lead.image_alt || lead.title}
                loading="lazy"
              />
            ) : (
              <div className="hp-section-lead-img-ph" aria-hidden="true" />
            )}

            {(lead.is_breaking || lead.category) && (
              <span className={`cat-badge${lead.is_breaking ? " cat-badge--breaking" : " cat-badge--section"}`}>
                {lead.is_breaking ? "Breaking" : lead.category?.name}
              </span>
            )}

            <h3 className="hp-section-lead-title">
              <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
            </h3>

            {lead.excerpt && (
              <p className="hp-section-lead-excerpt">{lead.excerpt}</p>
            )}
          </article>
        )}

        {sideItems.length > 0 && (
          <div className="hp-section-items">
            {sideItems.map((article) => (
              <article key={article.slug} className="hp-section-item">
                {(article.is_breaking || article.category) && (
                  <span className={`cat-badge${article.is_breaking ? " cat-badge--breaking" : ""}`}>
                    {article.is_breaking ? "Breaking" : article.category?.name}
                  </span>
                )}
                <h3 className="hp-section-item-title">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                {article.published_at && (
                  <time className="hp-section-item-time" dateTime={article.published_at}>
                    {formatRelativeTime(article.published_at)}
                  </time>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function HomeSections({ sections }: HomeSectionsProps) {
  const visible = sections.filter(
    (s) => s.hero_article !== null || s.articles.length > 0,
  );
  if (visible.length === 0) return null;

  return (
    <div className="hp-sections" aria-label="Coverage by section">
      {visible.map((section) => (
        <SectionBlock key={section.slug} section={section} />
      ))}
    </div>
  );
}
