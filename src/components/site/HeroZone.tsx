import Link from "next/link";

import type { TopStorySlot } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HeroZoneProps {
  slots: TopStorySlot[];
}

export function HeroZone({ slots }: HeroZoneProps) {
  const filled = slots.filter((s) => s.article !== null);
  if (filled.length === 0) return null;

  const [leadSlot, ...sideSlots] = filled;
  const lead = leadSlot.article!;
  const sides = sideSlots.slice(0, 3).map((s) => s.article!);

  return (
    <div className="hp-hero">
      <div className="hp-hero-grid">
        {/* Lead story */}
        <article className="hp-lead">
          {lead.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="hp-lead-img"
              src={mediaProxyPath(lead.image_url) ?? ""}
              alt={lead.image_alt || lead.title}
              loading="eager"
            />
          ) : (
            <div className="hp-lead-img-ph" aria-hidden="true" />
          )}

          {(lead.is_breaking || lead.category) && (
            <span className={`cat-badge${lead.is_breaking ? " cat-badge--breaking" : ""}`}>
              {lead.is_breaking ? "Breaking" : lead.category?.name}
            </span>
          )}

          <h2 className="hp-lead-title">
            <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
          </h2>

          {lead.excerpt && (
            <p className="hp-lead-summary">{lead.excerpt}</p>
          )}

          {lead.published_at && (
            <time className="hp-lead-time" dateTime={lead.published_at}>
              {formatRelativeTime(lead.published_at)}
            </time>
          )}
        </article>

        {/* Secondary stories */}
        {sides.length > 0 && (
          <div className="hp-secondaries">
            {sides.map((article, i) => (
              <article key={article.slug} className="hp-side-item">
                {i === 0 && article.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="hp-side-thumb"
                    src={mediaProxyPath(article.image_url) ?? ""}
                    alt={article.image_alt || article.title}
                    loading="lazy"
                  />
                ) : i === 0 ? (
                  <div className="hp-side-thumb-ph" aria-hidden="true" />
                ) : null}

                <div className="hp-side-body">
                  {(article.is_breaking || article.category) && (
                    <span className={`cat-badge${article.is_breaking ? " cat-badge--breaking" : ""}`}>
                      {article.is_breaking ? "Breaking" : article.category?.name}
                    </span>
                  )}
                  <h3 className="hp-side-title">
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                  </h3>
                  {article.published_at && (
                    <time className="hp-side-time" dateTime={article.published_at}>
                      {formatRelativeTime(article.published_at)}
                    </time>
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
