import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";

interface ArticleCardProps {
  article: ArticleSummary;
  /** Show full excerpt (default clamps to 3 lines via CSS) */
  showExcerpt?: boolean;
}

export function ArticleCard({ article, showExcerpt = true }: ArticleCardProps) {
  return (
    <article className="article-card">
      {article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="article-card-img"
          src={mediaProxyPath(article.image_url) ?? ""}
          alt={article.image_alt || article.title}
          loading="lazy"
        />
      ) : (
        <div className="article-card-img-ph" aria-hidden="true" />
      )}

      <div className="article-card-body">
        {/* Badges */}
        {(article.is_breaking || article.is_premium || article.is_live) && (
          <div className="article-card-badges">
            {article.is_breaking && (
              <span className="badge badge-breaking">Breaking</span>
            )}
            {article.is_live && (
              <span className="badge badge-live">Live</span>
            )}
            {article.is_premium && (
              <span className="badge badge-premium">Premium</span>
            )}
          </div>
        )}

        {article.category && (
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
