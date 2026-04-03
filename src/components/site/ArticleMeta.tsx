import type { ArticleSummary } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";

interface ArticleMetaProps {
  article: Pick<ArticleSummary, "published_at" | "author_name">;
  className?: string;
}

/**
 * Compact meta line: "4h ago · The Granite Reporter"
 * Used on homepage article cards. View counts are shown on the article detail page.
 */
export function ArticleMeta({ article, className }: ArticleMetaProps) {
  const parts: string[] = [];

  if (article.published_at) {
    parts.push(formatRelativeTime(article.published_at));
  }

  if (article.author_name) {
    parts.push(article.author_name);
  }

  return (
    <p className={`article-meta-line${className ? ` ${className}` : ""}`}>
      {parts.join(" · ")}
    </p>
  );
}
