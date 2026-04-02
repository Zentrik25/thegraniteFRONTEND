"use client";

import { useEffect } from "react";

interface HistoryTrackerProps {
  articleSlug: string;
}

/**
 * Drop this anywhere on an article page.
 * Fires a single POST to record the view. Silent — no UI, no errors surfaced.
 */
export default function HistoryTracker({ articleSlug }: HistoryTrackerProps) {
  useEffect(() => {
    fetch("/api/reader/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_slug: articleSlug }),
    }).catch(() => {});
    // Intentionally runs only once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
