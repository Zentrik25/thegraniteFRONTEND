import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HomeTopStoriesProps {
  articles: ArticleSummary[];
}

export function HomeTopStories({ articles }: HomeTopStoriesProps) {
  const items = articles.slice(0, 4);
  if (items.length === 0) return null;

  return (
    <div className="hp-row">
      <div className="hp-row-head">
        <p className="hp-row-label">More stories</p>
        <Link className="hp-row-more" href="/search">See all →</Link>
      </div>

      <div className="hp-row-grid">
        {items.map((article) => (
          <article key={article.slug} className="hp-card">
            {article.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="hp-card-img"
                src={mediaProxyPath(article.image_url) ?? ""}
                alt={article.image_alt || article.title}
                loading="lazy"
              />
            ) : (
              <div className="hp-card-img-ph" aria-hidden="true" />
            )}

            <div className="hp-card-body">
              {(article.is_breaking || article.category) && (
                <span className={`cat-badge${article.is_breaking ? " cat-badge--breaking" : ""}`}>
                  {article.is_breaking ? "Breaking" : article.category?.name}
                </span>
              )}
              <h3 className="hp-card-title">
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              {article.published_at && (
                <time className="hp-card-time" dateTime={article.published_at}>
                  {formatRelativeTime(article.published_at)}
                </time>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
