/**
 * HomeMainSidebar — right-hand sidebar for the homepage two-column zone.
 * Widget: Trending Now — thumbnail + category badge + headline.
 */

import Image from "next/image";
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
      <div className="gp-sidebar-widget">
        <p className="gp-sidebar-title">Trending Now</p>
        <ol className="gp-trending-list" aria-label="Trending articles">
          {topItems.map((item) => {
            const { article } = item;
            const thumb = mediaProxyPath(article.image_url ?? "");

            return (
              <li key={article.slug} className="gp-trending-item">
                {/* Thumbnail */}
                <Link
                  href={`/articles/${article.slug}`}
                  className="gp-trending-thumb-link"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {thumb ? (
                    <div className="gp-trending-thumb relative">
                      <Image
                        src={thumb}
                        alt={article.image_alt || article.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="gp-trending-thumb-ph" />
                  )}
                </Link>

                {/* Text */}
                <div className="gp-trending-body">
                  {article.category && (
                    <span className="gp-trending-cat">
                      {article.category.name}
                    </span>
                  )}
                  <Link
                    href={`/articles/${article.slug}`}
                    className="gp-trending-title"
                  >
                    {article.title}
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
