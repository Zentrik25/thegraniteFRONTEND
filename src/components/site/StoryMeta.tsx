import Link from "next/link";

import { formatRelativeTime } from "@/lib/format";
import type { ArticleSummary } from "@/lib/types";

interface StoryMetaProps {
  article: Pick<ArticleSummary, "category" | "author_name" | "published_at" | "is_premium">;
}

export function StoryMeta({ article }: StoryMetaProps) {
  const parts: React.ReactNode[] = [];

  if (article.category) {
    parts.push(
      <Link
        key="cat"
        className="story-cat-link"
        href={`/categories/${article.category.slug}`}
      >
        {article.category.name}
      </Link>,
    );
  }

  if (article.author_name) {
    parts.push(<span key="author">{article.author_name}</span>);
  }

  if (article.published_at) {
    parts.push(
      <time key="date" dateTime={article.published_at}>
        {formatRelativeTime(article.published_at)}
      </time>,
    );
  }

  if (article.is_premium) {
    parts.push(
      <span key="premium" className="story-meta-premium">
        Premium
      </span>,
    );
  }

  if (parts.length === 0) return null;

  return (
    <p className="story-meta">
      {parts.flatMap((part, i) =>
        i === 0
          ? [part]
          : [
              <span key={`sep-${i}`} className="story-meta-sep" aria-hidden="true">
                ·
              </span>,
              part,
            ],
      )}
    </p>
  );
}
