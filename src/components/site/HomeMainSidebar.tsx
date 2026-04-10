/**
 * HomeMainSidebar — Trending Now widget for the hero sidebar.
 * Off-white card with dark header, numbered list of 5 articles.
 */

import Link from "next/link";

import type { TrendingArticle } from "@/lib/types";

interface HomeMainSidebarProps {
  trending: TrendingArticle[];
}

export function HomeMainSidebar({ trending }: HomeMainSidebarProps) {
  const topItems = trending.slice(0, 5);
  if (topItems.length === 0) return null;

  return (
    <div className="gp-hero-trending">
      {/* Header */}
      <div className="gp-hero-trending-head">
        <p className="gp-hero-trending-label">Trending Now</p>
      </div>

      {/* Items */}
      <ol className="gp-hero-trending-list" aria-label="Trending articles">
        {topItems.map((item, i) => {
          const { article } = item;

          return (
            <li key={article.slug} className="gp-hero-trending-item">
              <Link href={`/articles/${article.slug}`} className="gp-hero-trending-link">
                <span className="gp-hero-trending-num" aria-label={`#${i + 1}`}>
                  {i + 1}
                </span>
                <div className="gp-hero-trending-body">
                  {article.category && (
                    <span className="gp-hero-trending-cat">
                      {article.category.name}
                    </span>
                  )}
                  <span className="gp-hero-trending-title">
                    {article.title}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
