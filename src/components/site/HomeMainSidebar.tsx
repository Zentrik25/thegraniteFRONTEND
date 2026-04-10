/**
 * HomeMainSidebar — "Trending Now" high-impact card.
 * Dark card with rank numbers, thumbnails, and strong hover states.
 */

import Link from "next/link";

import type { TrendingArticle } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";

interface HomeMainSidebarProps {
  trending: TrendingArticle[];
}

export function HomeMainSidebar({ trending }: HomeMainSidebarProps) {
  const topItems = trending.slice(0, 6);
  if (topItems.length === 0) return null;

  return (
    <div className="gp-sidebar">
      <div className="gp-trending-card">
        {/* Header */}
        <div className="gp-trending-card-head">
          <span className="gp-trending-card-flame" aria-hidden="true">🔥</span>
          <p className="gp-trending-card-title">Trending Now</p>
        </div>

        {/* Items */}
        <ol className="gp-trending-card-list" aria-label="Trending articles">
          {topItems.map((item, i) => {
            const { article } = item;
            const thumb = mediaProxyPath(article.image_url ?? "");

            return (
              <li key={article.slug}>
                <Link href={`/articles/${article.slug}`} className="gp-trending-card-item">
                  {/* Rank */}
                  <span className="gp-trending-card-rank" aria-label={`#${i + 1}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail */}
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="gp-trending-card-thumb"
                      src={thumb}
                      alt={article.image_alt || article.title}
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  ) : (
                    <div className="gp-trending-card-thumb-ph" aria-hidden="true" />
                  )}

                  {/* Text */}
                  <div className="gp-trending-card-body">
                    {article.category && (
                      <span className="gp-trending-card-cat">
                        {article.category.name}
                      </span>
                    )}
                    <span className="gp-trending-card-headline">
                      {article.title}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
