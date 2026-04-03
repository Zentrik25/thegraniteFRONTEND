import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { TopStorySlot } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";

/** Replaces spaces with non-breaking spaces around dates, currency, and numbers */
function formatHeadline(title: string): string {
  return title
    // "April 1", "March 31", "January 2026" etc — month + number
    .replace(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d)/g,
      "$1\u00A0$2"
    )
    // Currency: US$320, ZWG 500, R 1,200, USD 100
    .replace(/\b(US\$|ZWG|USD|ZAR|R|£|€)\s*(\d)/g, "$1\u00A0$2")
    // Number + common suffix: 4%, 3.5bn, 12m
    .replace(/(\d)\s+(percent|billion|million|trillion|bn|mn|tn|kg|km|MW|kV)/gi, "$1\u00A0$2");
}

export function TopStoriesGrid({ slots }: { slots: TopStorySlot[] }) {
  const filled = slots.filter((s) => s.article !== null);
  if (filled.length === 0) return null;

  const lead = filled[0].article!;
  const secondary = filled.slice(1, 6).map((s) => s.article!);

  return (
    <div className="top-stories-layout">
      {/* Lead story */}
      <div className="lead-story-cell">
        {lead.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="lead-story-img"
            src={mediaProxyPath(lead.image_url) ?? ""}
            alt={lead.image_alt || lead.title}
            fetchPriority="high"
          />
        ) : (
          <div className="lead-img-placeholder" aria-hidden="true" />
        )}

        {lead.is_breaking ? (
          <p className="lead-story-kicker">Breaking</p>
        ) : lead.category ? (
          <p className="lead-story-kicker">{lead.category.name}</p>
        ) : null}

        <h2 className="lead-story-title">
          <Link href={`/articles/${lead.slug}`}>
            {formatHeadline(lead.title)}
          </Link>
        </h2>

        {lead.excerpt && (
          <p className="lead-story-excerpt">{lead.excerpt}</p>
        )}

        <StoryMeta article={lead} />
      </div>

      {/* Secondary stories */}
      {secondary.length > 0 && (
        <div className="secondary-panel" aria-label="More top stories">
          {secondary.map((article, i) => (
            <div className="secondary-story-cell" key={article.slug}>
              <span className="secondary-rank" aria-hidden="true">
                {String(i + 2).padStart(2, "0")}
              </span>
              {article.category && (
                <p
                  className="lead-story-kicker"
                  style={{ fontSize: "0.62rem", margin: 0 }}
                >
                  {article.category.name}
                </p>
              )}
              <h3 className="secondary-title">
                <Link href={`/articles/${article.slug}`}>
                  {formatHeadline(article.title)}
                </Link>
              </h3>
              <StoryMeta article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
