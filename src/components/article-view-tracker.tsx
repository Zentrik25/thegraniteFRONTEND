"use client";

import { useEffect } from "react";

import { PUBLIC_API_BASE_URL } from "@/lib/env";

/**
 * Fires a POST to the analytics view endpoint once on mount.
 * Silently swallowed — never blocks reading.
 */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`${PUBLIC_API_BASE_URL}/api/v1/analytics/articles/${slug}/view/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // analytics is best-effort
    });
  }, [slug]);

  return null;
}
