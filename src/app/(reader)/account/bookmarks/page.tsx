import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getReaderAccessToken } from "@/lib/auth/reader-session";
import { safeApiFetch } from "@/lib/api/fetcher";
import { unwrapList } from "@/lib/api/fetcher";
import type { ApiListResponse, BookmarkRecord } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import BookmarkButton from "@/components/reader/BookmarkButton";

export const metadata: Metadata = {
  title: "Bookmarks",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const token = await getReaderAccessToken();
  if (!token) redirect("/login?next=/account/bookmarks");

  const { data, status, error } = await safeApiFetch<ApiListResponse<BookmarkRecord>>(
    "/api/v1/accounts/bookmarks/?page_size=100",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  if (status === 401) redirect("/login?next=/account/bookmarks");

  const bookmarks = unwrapList(data ?? { count: 0, next: null, previous: null, results: [] });

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 flex flex-col gap-8">

        {/* Header */}
        <div>
          <Link
            href="/account"
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1 mb-3"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Account
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Bookmarks</h1>
          {bookmarks.length > 0 && (
            <p className="text-sm text-[var(--muted)] mt-1">
              {bookmarks.length} saved {bookmarks.length === 1 ? "article" : "articles"}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-4 py-3">
            Failed to load bookmarks. <a href="/account/bookmarks" className="font-semibold underline">Try again</a>.
          </div>
        )}

        {/* Empty state */}
        {!error && bookmarks.length === 0 && <EmptyState />}

        {/* List */}
        {bookmarks.length > 0 && (
          <ul className="flex flex-col divide-y divide-[var(--line)]" role="list">
            {bookmarks.map(({ article, created_at }) => (
              <li key={article.slug} className="py-5 flex gap-4 items-start">

                {/* Thumbnail */}
                {article.image_url && (
                  <Image
                    src={article.image_url}
                    alt=""
                    width={80}
                    height={56}
                    className="rounded object-cover shrink-0 hidden sm:block"
                    style={{ objectFit: "cover" }}
                  />
                )}

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="font-serif font-bold text-[var(--ink)] leading-snug hover:text-[var(--accent)] transition-colors line-clamp-2"
                  >
                    {article.title}
                  </Link>
                  {article.excerpt && (
                    <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-[var(--muted)]">
                    Saved {formatRelativeTime(created_at)}
                  </p>
                </div>

                {/* Remove button */}
                <div className="shrink-0 pt-0.5">
                  <BookmarkButton
                    articleSlug={article.slug}
                    initialBookmarked={true}
                    compact
                  />
                </div>

              </li>
            ))}
          </ul>
        )}

      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--line)] flex items-center justify-center">
        <svg className="w-7 h-7 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[var(--ink)]">No bookmarks yet</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-xs">
          Tap the bookmark icon on any article to save it for later.
        </p>
      </div>
      <Link
        href="/"
        className="mt-1 text-sm text-[var(--accent)] font-semibold hover:underline"
      >
        Browse articles
      </Link>
    </div>
  );
}
