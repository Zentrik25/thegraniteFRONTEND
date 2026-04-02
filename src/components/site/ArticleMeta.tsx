import type { ArticleSummary } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";

interface ArticleMetaProps {
  article: Pick<ArticleSummary, "published_at" | "author_name" | "view_count">;
  className?: string;
}

/**
 * Compact meta line: "4h ago · The Granite Reporter · 👁 1,234"
 * Used across all homepage article cards.
 */
export function ArticleMeta({ article, className }: ArticleMetaProps) {
  const parts: string[] = [];

  if (article.published_at) {
    parts.push(formatRelativeTime(article.published_at));
  }

  if (article.author_name) {
    parts.push(article.author_name);
  }

  const viewStr =
    article.view_count != null && article.view_count > 0
      ? formatViews(article.view_count)
      : null;

  return (
    <p className={`article-meta-line${className ? ` ${className}` : ""}`}>
      {parts.join(" · ")}
      {viewStr && (
        <>
          {parts.length > 0 && <span className="article-meta-sep" aria-hidden="true"> · </span>}
          <span className="article-meta-views">
            <svg
              className="article-meta-eye"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
            {viewStr}
          </span>
        </>
      )}
    </p>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
