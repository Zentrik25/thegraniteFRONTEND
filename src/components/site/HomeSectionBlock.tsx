/**
 * HomeSectionBlock — generic section zone for any primary section.
 * White background, section heading with blue underline,
 * 4-column article grid.
 */

import Link from "next/link";

import type { SectionDetail } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HomeSectionBlockProps {
  section: SectionDetail;
}

export function HomeSectionBlock({ section }: HomeSectionBlockProps) {
  const articles = [
    ...(section.hero_article ? [section.hero_article] : []),
    ...section.articles,
  ].slice(0, 4);

  if (articles.length === 0) return null;

  return (
    <div className="gp-section-block">
      <div className="gp-container">
        <div className="gp-section-block-head">
          <h2 className="gp-section-block-title">
            <Link href={`/sections/${section.slug}`}>{section.name}</Link>
          </h2>
          <Link href={`/sections/${section.slug}`} className="gp-section-block-more">
            More →
          </Link>
        </div>

        <div className="gp-section-block-grid">
          {articles.map((article, i) => (
            <article key={article.slug} className={`gp-section-card${i === 0 ? " gp-section-card--lead" : ""}`}>
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="gp-section-card-img"
                  src={mediaProxyPath(article.image_url) ?? ""}
                  alt={article.image_alt || article.title}
                  loading="lazy"
                />
              )}
              <div className="gp-section-card-body">
                {article.category && (
                  <span className="gp-section-card-cat">{article.category.name}</span>
                )}
                <h3 className="gp-section-card-headline">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>
                {i === 0 && article.excerpt && (
                  <p className="gp-section-card-excerpt">{article.excerpt}</p>
                )}
                {article.published_at && (
                  <p className="gp-section-card-time">{formatRelativeTime(article.published_at)}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
