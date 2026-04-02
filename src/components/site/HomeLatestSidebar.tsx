import Link from "next/link";

import type { ArticleSummary, TrendingArticle } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime, pluralize } from "@/lib/format";

interface HomeLatestSidebarProps {
  articles: ArticleSummary[];
  trending: TrendingArticle[];
}

export function HomeLatestSidebar({ articles, trending }: HomeLatestSidebarProps) {
  const items = articles.slice(0, 10);

  return (
    <section aria-labelledby="hp-latest-label">
      <div className="hp-latest-layout">
        {/* Latest feed */}
        <div>
          <div className="hp-latest-head">
            <h2 className="hp-latest-label" id="hp-latest-label">Latest</h2>
            <Link className="hp-latest-more" href="/search">More →</Link>
          </div>

          {items.length === 0 ? (
            <p className="copy">No recent stories yet.</p>
          ) : (
            <div role="feed" aria-label="Latest news">
              {items.map((article) => (
                <article key={article.slug} className="hp-latest-item">
                  {article.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="hp-latest-thumb"
                      src={mediaProxyPath(article.image_url) ?? ""}
                      alt={article.image_alt || article.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="hp-latest-thumb-ph" aria-hidden="true" />
                  )}

                  <div className="hp-latest-body">
                    {(article.is_breaking || article.category) && (
                      <span className={`cat-badge${article.is_breaking ? " cat-badge--breaking" : ""}`}>
                        {article.is_breaking ? "Breaking" : article.category?.name}
                      </span>
                    )}
                    <h3 className="hp-latest-title">
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    {article.excerpt && (
                      <p className="hp-latest-excerpt">{article.excerpt}</p>
                    )}
                    {article.published_at && (
                      <time className="hp-latest-time" dateTime={article.published_at}>
                        {formatRelativeTime(article.published_at)}
                      </time>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — Most read only, no newsletter form */}
        {trending.length > 0 && (
          <aside aria-label="Most read">
            <div className="hp-sidebar-widget">
              <p className="hp-sidebar-title">Most read</p>
              {trending.slice(0, 6).map((item) => (
                <div key={item.article.slug} className="hp-trending-item">
                  <span className="hp-trending-rank" aria-hidden="true">
                    {String(item.rank).padStart(2, "0")}
                  </span>
                  <div className="hp-trending-text">
                    <Link href={`/articles/${item.article.slug}`}>
                      {item.article.title}
                    </Link>
                    <p className="hp-trending-views">
                      {pluralize(item.view_count, "view")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
