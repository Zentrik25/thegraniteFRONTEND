/**
 * HomeLeadZone — BBC-style hero.
 * Left: big story (16:9 image, Playfair headline, standfirst, meta).
 * Right: stack of up to 5 secondary stories (thumb + #2997ff category + headline + time).
 */

import Image from "next/image";
import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HomeLeadZoneProps {
  lead: ArticleSummary;
  secondaries: ArticleSummary[];
}

export function HomeLeadZone({ lead, secondaries }: HomeLeadZoneProps) {
  const sides = secondaries.slice(0, 5);

  return (
    <div className="gp-lead-zone">
      <div className="gp-lead-zone-grid">
        {/* ── Big story ── */}
        <article className="gp-lead-main" aria-label="Lead story">
          {lead.image_url ? (
            <div className="gp-lead-img relative overflow-hidden">
              <Image
                src={mediaProxyPath(lead.image_url) ?? ""}
                alt={lead.image_alt || lead.title}
                fill
                priority
                sizes="(max-width: 960px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="gp-lead-img-ph" aria-hidden="true" />
          )}

          {(lead.is_breaking || lead.category) && (
            <span className="gp-cat-label">
              {lead.is_breaking ? "Breaking" : lead.category?.name}
            </span>
          )}

          <h2 className="gp-lead-headline">
            <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
          </h2>

          {lead.excerpt && (
            <p className="gp-lead-standfirst">{lead.excerpt}</p>
          )}

          <p className="gp-meta-line">
            {lead.author_name && <span>{lead.author_name}</span>}
            {lead.author_name && lead.published_at && (
              <span className="gp-meta-sep" aria-hidden="true">·</span>
            )}
            {lead.published_at && (
              <span>{formatRelativeTime(lead.published_at)}</span>
            )}
          </p>
        </article>

        {/* ── Secondaries stack ── */}
        {sides.length > 0 && (
          <div className="gp-lead-secondaries" aria-label="More top stories">
            {sides.map((article) => (
              <article key={article.slug} className="gp-secondary-item">
                {article.image_url && (
                  <div className="gp-secondary-thumb relative overflow-hidden">
                    <Image
                      src={mediaProxyPath(article.image_url) ?? ""}
                      alt={article.image_alt || article.title}
                      fill
                      sizes="(max-width: 960px) 100vw, 60vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="gp-secondary-body">
                  {(article.is_breaking || article.category) && (
                    <span className="gp-secondary-cat">
                      {article.is_breaking ? "Breaking" : article.category?.name}
                    </span>
                  )}
                  <h3 className="gp-secondary-headline">
                    <Link href={`/articles/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  {article.published_at && (
                    <p className="gp-secondary-time">
                      {formatRelativeTime(article.published_at)}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
