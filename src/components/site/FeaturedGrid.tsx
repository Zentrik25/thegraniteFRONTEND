import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";

export function FeaturedGrid({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="featured-grid">
      {articles.slice(0, 4).map((article) => (
        <article className="featured-card" key={article.slug}>
          {article.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="featured-img"
              src={mediaProxyPath(article.image_url) ?? ""}
              alt={article.image_alt || article.title}
              loading="lazy"
            />
          ) : (
            <span className="featured-img-placeholder" aria-hidden="true" />
          )}
          <div className="featured-body">
            <h3 className="featured-title">
              <Link href={`/articles/${article.slug}`}>{article.title}</Link>
            </h3>
            {article.excerpt && (
              <p className="featured-excerpt">{article.excerpt}</p>
            )}
            <StoryMeta article={article} />
          </div>
        </article>
      ))}
    </div>
  );
}
