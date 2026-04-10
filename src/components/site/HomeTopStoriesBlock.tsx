import Image from "next/image";
import Link from "next/link";

import type { TopStorySlot } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { ArticleMeta } from "@/components/site/ArticleMeta";

interface HomeTopStoriesBlockProps {
  slots: TopStorySlot[];
}

/**
 * "Top Stories" section — backend-curated ranked list.
 * Shows up to 5 items: first as a wide card with image, rest as text rows.
 */
export function HomeTopStoriesBlock({ slots }: HomeTopStoriesBlockProps) {
  const items = slots.filter((s) => s.article !== null).slice(0, 5);
  if (items.length === 0) return null;

  const [first, ...rest] = items;
  const lead = first.article!;

  return (
    <div className="hp-top-stories-block">
      <div className="hp-row-head">
        <p className="hp-row-label">Top Stories</p>
        <Link className="hp-row-more" href="/search">All stories →</Link>
      </div>

      <div className="hp-top-stories-grid">
        {/* Lead card */}
        <article className="hp-top-lead-card">
          {lead.image_url ? (
            <div className="hp-top-lead-img relative overflow-hidden">
              <Image
                src={mediaProxyPath(lead.image_url) ?? ""}
                alt={lead.image_alt || lead.title}
                fill
                sizes="(max-width: 960px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="hp-top-lead-img-ph" aria-hidden="true" />
          )}
          <div className="hp-top-lead-body">
            {(lead.is_breaking || lead.category) && (
              <span className={`cat-badge${lead.is_breaking ? " cat-badge--breaking" : ""}`}>
                {lead.is_breaking ? "Breaking" : lead.category?.name}
              </span>
            )}
            <h3 className="hp-top-lead-title">
              <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
            </h3>
            <ArticleMeta article={lead} />
          </div>
        </article>

        {/* Secondary rows with thumbnails */}
        {rest.length > 0 && (
          <div className="hp-top-list">
            {rest.map((slot) => {
              const article = slot.article!;
              return (
                <article key={article.slug} className="hp-top-list-item">
                  {article.image_url ? (
                    <div className="hp-top-list-thumb relative overflow-hidden">
                      <Image
                        src={mediaProxyPath(article.image_url) ?? ""}
                        alt={article.image_alt || article.title}
                        fill
                        sizes="(max-width: 900px) 120px, 120px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="hp-top-list-thumb-ph" aria-hidden="true" />
                  )}
                  <div className="hp-top-list-body">
                    {(article.is_breaking || article.category) && (
                      <span className={`cat-badge${article.is_breaking ? " cat-badge--breaking" : ""}`}>
                        {article.is_breaking ? "Breaking" : article.category?.name}
                      </span>
                    )}
                    <h3 className="hp-top-list-title">
                      <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    </h3>
                    <ArticleMeta article={article} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
