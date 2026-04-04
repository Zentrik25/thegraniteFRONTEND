import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";

interface ArticleCardProps {
  article: ArticleSummary;
  /** Show excerpt text */
  showExcerpt?: boolean;
}

export function ArticleCard({
  article,
  showExcerpt = true,
}: ArticleCardProps) {
  const imageSrc = article.image_url ? mediaProxyPath(article.image_url) : null;

  const badges = [
    article.is_breaking && { label: "Breaking", className: "badge-breaking" },
    article.is_live && { label: "Live", className: "badge-live" },
    article.is_premium && { label: "Premium", className: "badge-premium" },
  ].filter(Boolean) as { label: string; className: string }[];

  return (
    <article className="article-card">
      <Link
        href={`/articles/${article.slug}`}
        className="article-card-media-link"
        aria-label={article.title}
      >
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="article-card-img"
            src={imageSrc}
            alt={article.image_alt || article.title}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="article-card-img-ph" aria-hidden="true" />
        )}
      </Link>

      <div className="article-card-body">
        {badges.length > 0 && (
          <div className="article-card-badges" aria-label="Article status">
            {badges.map((badge) => (
              <span key={badge.label} className={`badge ${badge.className}`}>
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {article.category?.name && (
          <p className="article-card-kicker">{article.category.name}</p>
        )}

        <h3 className="article-card-title">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {showExcerpt && article.excerpt && (
          <p className="article-card-excerpt">{article.excerpt}</p>
        )}

        <StoryMeta article={article} />
      </div>
    </article>
  );
}