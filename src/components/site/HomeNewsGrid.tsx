/**
 * HomeNewsGrid — "Latest News" list with small thumbnails.
 * Two-column list on tablet+; single column on mobile.
 */

import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HomeNewsGridProps {
  articles: ArticleSummary[];
  title?: string;
}

export function HomeNewsGrid({
  articles,
  title = "Latest News",
}: HomeNewsGridProps) {
  const items = articles.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section className="gp-news-section" aria-labelledby="gp-news-grid-label">
      <div className="gp-section-head">
        <h2 className="gp-section-label" id="gp-news-grid-label">
          {title}
        </h2>
        <Link href="/search" className="gp-section-more">
          See all →
        </Link>
      </div>

      <div className="gp-news-list">
        {items.map((article) => (
          <article key={article.slug} className="gp-news-list-item">
            {article.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="gp-news-list-thumb"
                src={mediaProxyPath(article.image_url) ?? ""}
                alt={article.image_alt || article.title}
                loading="lazy"
              />
            ) : (
              <div className="gp-news-list-thumb-ph" aria-hidden="true" />
            )}

            <div className="gp-news-list-body">
              {(article.is_breaking || article.category) && (
                <span className="gp-cat-label">
                  {article.is_breaking ? "Breaking" : article.category?.name}
                </span>
              )}
              <h3 className="gp-news-list-title">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              <p className="gp-news-card-meta">
                {article.published_at && formatRelativeTime(article.published_at)}
                {article.author_name && article.published_at && " · "}
                {article.author_name}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
