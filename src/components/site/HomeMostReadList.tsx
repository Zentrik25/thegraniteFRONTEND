/**
 * HomeMostReadList — numbered top-5 most-read section.
 * Full-width, white background, Playfair large number in muted gray.
 */

import Link from "next/link";

import type { TrendingArticle } from "@/lib/types";
import { pluralize } from "@/lib/format";

interface HomeMostReadListProps {
  items: TrendingArticle[];
}

export function HomeMostReadList({ items }: HomeMostReadListProps) {
  const top5 = items.slice(0, 5);
  if (top5.length === 0) return null;

  return (
    <section className="gp-most-read" aria-labelledby="gp-most-read-label">
      <div className="gp-most-read-inner">
        <div className="gp-section-head">
          <h2 className="gp-section-label" id="gp-most-read-label">
            Most Read
          </h2>
        </div>

        <ol className="gp-most-read-list">
          {top5.map((item, i) => (
            <li key={item.article.slug} className="gp-most-read-item">
              <span className="gp-most-read-num" aria-hidden="true">
                {i + 1}
              </span>
              <div className="gp-most-read-body">
                <Link
                  href={`/articles/${item.article.slug}`}
                  className="gp-most-read-title"
                >
                  {item.article.title}
                </Link>
                <p className="gp-most-read-views">
                  {pluralize(item.view_count, "view")}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
