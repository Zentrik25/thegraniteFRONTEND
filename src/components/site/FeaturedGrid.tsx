import Image from "next/image";
import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { ArticleSummary } from "@/lib/types";

export function FeaturedGrid({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="featured-grid">
      {articles.slice(0, 4).map((article) => (
        <article className="featured-card" key={article.slug}>
          {article.image_url ? (
            <div className="featured-img" style={{ position: "relative" }}>
              <Image
                src={article.image_url}
                alt={article.image_alt || article.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 370px"
              />
            </div>
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
