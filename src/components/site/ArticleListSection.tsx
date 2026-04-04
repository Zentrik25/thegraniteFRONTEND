import Link from "next/link";
import Image from "next/image";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface ArticleListSectionProps {
  heading: string;
  articles: ArticleSummary[];
}

export function ArticleListSection({ heading, articles }: ArticleListSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby={`als-${heading}`} className="als-section">
      <div className="als-head">
        <h2 className="als-title" id={`als-${heading}`}>{heading}</h2>
      </div>

      <div className="als-grid">
        {articles.map((article) => {
          const src = article.image_url ? mediaProxyPath(article.image_url) : null;

          return (
            <article key={article.slug} className="als-card">
              <Link href={`/articles/${article.slug}`} className="als-img-link" aria-label={article.title} tabIndex={-1}>
                <div className="als-img-wrap">
                  {src ? (
                    <Image
                      src={src}
                      alt={article.image_alt || article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 220px"
                      className="als-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="als-img-ph" aria-hidden="true" />
                  )}
                </div>
              </Link>

              <div className="als-body">
                <div className="als-badges">
                  {article.is_breaking && (
                    <span className="badge badge-breaking">Breaking</span>
                  )}
                  {article.is_premium && (
                    <span className="badge badge-premium">Premium</span>
                  )}
                  {article.category && (
                    <Link
                      href={`/categories/${article.category.slug}`}
                      className="cat-badge"
                    >
                      {article.category.name}
                    </Link>
                  )}
                </div>

                <h3 className="als-card-title">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>

                <p className="als-meta">
                  {article.published_at && formatRelativeTime(article.published_at)}
                  {article.published_at && article.author_name && " · "}
                  {article.author_name}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
