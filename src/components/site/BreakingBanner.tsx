import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";

export function BreakingBanner({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;
  const lead = articles[0];
  const overflow = articles.length - 1;

  return (
    <div className="breaking-strip" role="alert" aria-label="Breaking news">
      <div className="breaking-strip-inner">
        <span className="breaking-label" aria-hidden="true">
          Breaking
        </span>
        <div className="breaking-headlines">
          <Link className="breaking-link" href={`/articles/${lead.slug}`}>
            {lead.title}
          </Link>
        </div>
        {overflow > 0 && (
          <Link className="breaking-count" href="/search?q=breaking">
            +{overflow} more
          </Link>
        )}
      </div>
    </div>
  );
}
