/**
 * HomeNewsGrid — Apple-style 3-column news card grid.
 * Cards have 8px radius + shadow on hover.
 * Playfair Display headlines, Inter meta.
 */

import Image from "next/image";
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
  const items = articles.slice(0, 9);
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

      <div className="gp-news-grid">
        {items.map((article) => (
          <article key={article.slug} className="gp-news-card">
            <Link
              href={`/articles/${article.slug}`}
              className="gp-news-card-img-link"
              tabIndex={-1}
              aria-hidden="true"
            >
              {article.image_url ? (
                <div className="gp-news-card-img relative overflow-hidden">
                  <Image
                    src={mediaProxyPath(article.image_url) ?? ""}
                    alt={article.image_alt || article.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="gp-news-card-img-ph" aria-hidden="true" />
              )}
            </Link>

            <div className="gp-news-card-body">
              {(article.is_breaking || article.category) && (
                <span className="gp-cat-label">
                  {article.is_breaking ? "Breaking" : article.category?.name}
                </span>
              )}

              <h3 className="gp-news-card-title">
                <Link href={`/articles/${article.slug}`}>
                  {article.title}
                </Link>
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
