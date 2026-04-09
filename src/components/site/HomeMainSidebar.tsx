/**
 * HomeMainSidebar — right-hand sidebar for the homepage two-column zone.
 *
 * Widgets (top → bottom):
 *   1. Most Read — numbered list from trending data
 *   2. Newsletter — compact signup form
 *   3. Africa Briefs — compact article list from Africa section (when available)
 */

import Link from "next/link";

import type { TrendingArticle } from "@/lib/types";
import { SidebarNewsletterForm } from "@/components/site/SidebarNewsletterForm";

interface HomeMainSidebarProps {
  trending: TrendingArticle[];
}

export function HomeMainSidebar({ trending }: HomeMainSidebarProps) {
  const topItems = trending.slice(0, 5);

  return (
    <div className="gp-sidebar">
      {/* Most Read widget */}
      {topItems.length > 0 && (
        <div className="gp-sidebar-widget">
          <p className="gp-sidebar-title">Most Read</p>
          <ol className="gp-sidebar-mr-list">
            {topItems.map((item, i) => (
              <li key={item.article.slug} className="gp-sidebar-mr-item">
                <span className="gp-sidebar-mr-num" aria-hidden="true">
                  {i + 1}
                </span>
                <Link
                  href={`/articles/${item.article.slug}`}
                  className="gp-sidebar-mr-title"
                >
                  {item.article.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Newsletter widget */}
      <div className="gp-sidebar-widget">
        <p className="gp-sidebar-title">Newsletter</p>
        <SidebarNewsletterForm />
      </div>

    </div>
  );
}
