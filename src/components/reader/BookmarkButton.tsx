"use client";

import { useOptimistic, useTransition, useState, useEffect } from "react";
import { readerFetch, SessionExpiredError, redirectToLogin } from "@/lib/api/authed-fetch";

interface BookmarkButtonProps {
  articleSlug: string;
  /**
   * Pass true/false when the caller already knows the bookmark state (e.g. bookmarks list page).
   * Omit (undefined) to have the button check its own status on mount — used on article pages
   * where the server component is cached and cannot read per-user session data.
   */
  initialBookmarked?: boolean;
  /** Compact icon-only mode for use inside article cards */
  compact?: boolean;
}

export default function BookmarkButton({
  articleSlug,
  initialBookmarked,
  compact = false,
}: BookmarkButtonProps) {
  const [committed, setCommitted] = useState(initialBookmarked ?? false);
  const [optimistic, setOptimistic] = useOptimistic(committed);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Self-initialize when caller doesn't know the current state (article pages)
  useEffect(() => {
    if (initialBookmarked !== undefined) return;
    fetch(`/api/reader/bookmarks?article_slug=${encodeURIComponent(articleSlug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { count?: number; results?: { article: { slug: string } }[] } | null) => {
        if (!data) return;
        const bookmarked =
          typeof data.count === "number"
            ? data.count > 0
            : (data.results ?? []).some((b) => b.article.slug === articleSlug);
        setCommitted(bookmarked);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle() {
    const next = !optimistic;
    setError(null);

    startTransition(async () => {
      setOptimistic(next);

      try {
        const res = await (next
          ? readerFetch("/api/reader/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ article_slug: articleSlug }),
            })
          : readerFetch(`/api/reader/bookmarks/${encodeURIComponent(articleSlug)}`, {
              method: "DELETE",
            }));

        if (!res.ok && res.status !== 204) {
          setOptimistic(committed);
          setError("Something went wrong. Try again.");
          return;
        }

        setCommitted(next);
      } catch (err) {
        setOptimistic(committed);
        if (!redirectToLogin(err)) {
          if (err instanceof SessionExpiredError) return;
          setError("Network error. Try again.");
        }
      }
    });
  }

  if (compact) {
    return (
      <div className="relative inline-flex flex-col items-center gap-0.5">
        <button
          onClick={toggle}
          disabled={isPending}
          aria-label={optimistic ? "Remove bookmark" : "Bookmark this article"}
          aria-pressed={optimistic}
          className={[
            "p-1.5 rounded transition-colors",
            optimistic
              ? "text-[var(--accent)]"
              : "text-[var(--muted)] hover:text-[var(--ink)]",
            isPending ? "opacity-50 cursor-wait" : "cursor-pointer",
          ].join(" ")}
        >
          <BookmarkIcon filled={optimistic} />
        </button>
        {error && (
          <span className="absolute bottom-full mb-1 whitespace-nowrap text-xs bg-[var(--ink)] text-white px-2 py-1 rounded shadow-md">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={toggle}
        disabled={isPending}
        aria-pressed={optimistic}
        aria-label={optimistic ? "Remove bookmark" : "Save to bookmarks"}
        className={[
          "inline-flex items-center gap-2 text-sm font-semibold rounded px-3 py-2 border transition-colors",
          optimistic
            ? "border-[var(--accent)] text-[var(--accent)] bg-red-50 hover:bg-red-100"
            : "border-[var(--line)] text-[var(--muted)] bg-white hover:border-[var(--accent)] hover:text-[var(--accent)]",
          isPending ? "opacity-60 cursor-wait" : "cursor-pointer",
        ].join(" ")}
      >
        <BookmarkIcon filled={optimistic} />
        {optimistic ? "Saved" : "Save"}
      </button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
