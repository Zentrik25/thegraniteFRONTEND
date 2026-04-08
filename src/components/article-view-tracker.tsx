"use client";

import { useEffect } from "react";

/**
 * Fires a POST to the analytics view proxy endpoint once on mount.
 * Routed through the Next.js server so the backend URL stays server-only
 * and the reader session cookie is forwarded for per-user dedup.
 * Silently swallowed — never blocks reading.
 */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/analytics/articles/${slug}/view`, {
      method: "POST",
    }).catch(() => {
      // analytics is best-effort
    });
  }, [slug]);

  return null;
}
