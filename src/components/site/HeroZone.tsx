import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { ArticleMeta } from "@/components/site/ArticleMeta";

interface HeroZoneProps {
  /** Featured articles — first is lead, next up to 3 are secondaries. */
  articles: ArticleSummary[];
}

/**
 * BBC-style hero zone.
 * Lead (big image left) + up to 3 secondaries (right column).
 * Powered by featured/editor-picked articles from the backend.
 */
export function HeroZone({ articles }: HeroZoneProps) {
  if (articles.length === 0) return null;

  const [lead, ...sideArticles] = articles;
  const sides = sideArticles.slice(0, 3);

  return (
    <div className="hp-hero">
      <div className="hp-hero-grid">
        {/* Lead story */}
        <article className="hp-lead">
          {lead.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="hp-lead-img"
              src={mediaProxyPath(lead.image_url) ?? ""}
              alt={lead.image_alt || lead.title}
              loading="eager"
            />
          ) : (
            <div className="hp-lead-img-ph" aria-hidden="true" />
          )}

          {(lead.is_breaking || lead.category) && (
            <span className={`cat-badge${lead.is_breaking ? " cat-badge--breaking" : ""}`}>
              {lead.is_breaking ? "Breaking" : lead.category?.name}
            </span>
          )}

          <h2 className="hp-lead-title">
            <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
          </h2>

          {lead.excerpt && (
            <p className="hp-lead-summary">{lead.excerpt}</p>
          )}

          <ArticleMeta article={lead} />
        </article>

        {/* Secondary stories */}
        {sides.length > 0 && (
          <div className="hp-secondaries">
            {sides.map((article, i) => (
              <article key={article.slug} className="hp-side-item">
                {i === 0 && article.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="hp-side-thumb"
                    src={mediaProxyPath(article.image_url) ?? ""}
                    alt={article.image_alt || article.title}
                    loading="lazy"
                  />
                ) : i === 0 ? (
                  <div className="hp-side-thumb-ph" aria-hidden="true" />
                ) : null}

                <div className="hp-side-body">
                  {(article.is_breaking || article.category) && (
                    <span className={`cat-badge${article.is_breaking ? " cat-badge--breaking" : ""}`}>
                      {article.is_breaking ? "Breaking" : article.category?.name}
                    </span>
                  )}
                  <h3 className="hp-side-title">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <ArticleMeta article={article} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
