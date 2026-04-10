"use client";

import { useState, useEffect } from "react";

interface ViewResponse {
  ok: boolean;
  view_count: number | null;
}

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/**
 * Tracks the view on mount (awaited server-side proxy so it actually records),
 * shows the initial cached count immediately, then updates to the fresh count
 * returned by the POST response.
 */
export function ArticleViewTracker({
  slug,
  initialCount,
}: {
  slug: string;
  initialCount?: number | null;
}) {
  const [count, setCount] = useState<number | null>(initialCount ?? null);

  useEffect(() => {
    fetch(`/api/analytics/articles/${slug}/view`, { method: "POST" })
      .then((r) => r.json())
      .then((d: unknown) => {
        if (d && typeof d === "object" && "view_count" in d) {
          const v = (d as ViewResponse).view_count;
          if (typeof v === "number") setCount(v);
        }
      })
      .catch(() => {
        // analytics is best-effort
      });
  }, [slug]);

  if (!count || count <= 0) return null;

  return (
    <>
      <span className="article-detail-meta-sep" aria-hidden="true">
        ·
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          fontFamily: "var(--font-ui)",
        }}
        aria-label={`${count.toLocaleString()} views`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {formatViewCount(count)}
      </span>
    </>
  );
}
