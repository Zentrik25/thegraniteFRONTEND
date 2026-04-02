import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { ArticleSummary } from "@/lib/types";

export function LatestFeed({
  articles,
  limit = 12,
}: {
  articles: ArticleSummary[];
  limit?: number;
}) {
  const items = articles.slice(0, limit);
  if (items.length === 0) {
    return <p className="meta">No recent stories yet.</p>;
  }

  return (
    <div className="latest-list" role="feed" aria-label="Latest news">
      {items.map((article) => (
        <div className="latest-item" key={article.slug}>
          {article.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="latest-thumb"
              src={article.image_url}
              alt={article.image_alt || article.title}
            />
          ) : (
            <span className="latest-thumb-ph" aria-hidden="true" />
          )}
          <div className="latest-body">
            <h3 className="latest-title">
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
            </h3>
            {article.excerpt && (
              <p className="latest-excerpt">{article.excerpt}</p>
            )}
            <StoryMeta article={article} />
          </div>
        </div>
      ))}
    </div>
  );
}
