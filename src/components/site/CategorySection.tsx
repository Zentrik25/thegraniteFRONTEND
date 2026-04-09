/**
 * CategorySection — reusable homepage section block.
 * Layout: section heading + 1 large card (left, 60%) + 2 small cards (right, 40%).
 * Uses ArticleListSerializer fields: image_url, title, excerpt, author_name,
 * published_at, category.name. No read_time, no thumbnail.
 */

import Image from "next/image";
import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface CategorySectionProps {
  /** Display name shown in the heading, e.g. "Politics" */
  title: string;
  /** Category slug for the "More …" link, e.g. "politics" */
  slug: string;
  /** Up to 3 articles — articles[0] = large card, articles[1-2] = small cards */
  articles: ArticleSummary[];
}

export function CategorySection({ title, slug, articles }: CategorySectionProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const smalls = rest.slice(0, 2);

  return (
    <section className="gp-cat-section" aria-labelledby={`gp-cat-${slug}-label`}>
      <div className="gp-container">

        {/* ── Section head ── */}
        <div className="gp-cat-section-head">
          <h2 className="gp-cat-section-title" id={`gp-cat-${slug}-label`}>
            {title}
          </h2>
          <Link href={`/categories/${slug}`} className="gp-cat-section-more">
            More {title} →
          </Link>
        </div>

        {/* ── Cards grid ── */}
        <div className="gp-cat-grid">

          {/* Large card (left) */}
          <article className="gp-cat-large-card">
            <Link href={`/articles/${lead.slug}`} className="gp-cat-img-link" tabIndex={-1} aria-hidden="true">
              {lead.image_url ? (
                <div className="gp-cat-img relative overflow-hidden">
                  <Image
                    src={mediaProxyPath(lead.image_url) ?? ""}
                    alt={lead.image_alt || lead.title}
                    fill
                    sizes="(max-width: 960px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="gp-cat-img-ph" aria-hidden="true" />
              )}
            </Link>

            <div className="gp-cat-large-body">
              {lead.category && (
                <span className="gp-cat-label-sm">{lead.category.name}</span>
              )}
              <h3 className="gp-cat-large-headline">
                <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
              </h3>
              <p className="gp-cat-meta">
                {lead.author_name && <span>{lead.author_name}</span>}
                {lead.author_name && lead.published_at && (
                  <span className="gp-cat-meta-sep" aria-hidden="true">·</span>
                )}
                {lead.published_at && (
                  <span>{formatRelativeTime(lead.published_at)}</span>
                )}
              </p>
            </div>
          </article>

          {/* Small cards (right) */}
          {smalls.length > 0 && (
            <div className="gp-cat-small-stack">
              {smalls.map((article, i) => (
                <article
                  key={article.slug}
                  className={`gp-cat-small-card${i > 0 ? " gp-cat-small-card--divider" : ""}`}
                >
                  <Link href={`/articles/${article.slug}`} className="gp-cat-img-link" tabIndex={-1} aria-hidden="true">
                    {article.image_url ? (
                      <div className="gp-cat-img relative overflow-hidden">
                        <Image
                          src={mediaProxyPath(article.image_url) ?? ""}
                          alt={article.image_alt || article.title}
                          fill
                          sizes="(max-width: 960px) 100vw, 30vw"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="gp-cat-img-ph" aria-hidden="true" />
                    )}
                  </Link>

                  <div className="gp-cat-small-body">
                    {article.category && (
                      <span className="gp-cat-label-sm">{article.category.name}</span>
                    )}
                    <h3 className="gp-cat-small-headline">
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    {article.published_at && (
                      <p className="gp-cat-time">{formatRelativeTime(article.published_at)}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
