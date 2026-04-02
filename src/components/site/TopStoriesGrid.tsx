import Link from "next/link";

import { StoryMeta } from "@/components/site/StoryMeta";
import type { TopStorySlot } from "@/lib/types";

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
            src={lead.image_url}
            alt={lead.image_alt || lead.title}
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
          <Link href={`/articles/${lead.slug}`}>{lead.title}</Link>
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
                <Link href={`/articles/${article.slug}`}>{article.title}</Link>
              </h3>
              <StoryMeta article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
