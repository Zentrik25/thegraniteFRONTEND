import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getReaderAccessToken } from "@/lib/auth/reader-session";
import { mediaProxyPath } from "@/lib/utils/media";
import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import type { ApiListResponse, ReadingHistoryRecord } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import ClearHistoryButton from "./ClearHistoryButton";

export const metadata: Metadata = {
  title: "Reading History",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const token = await getReaderAccessToken();
  if (!token) redirect("/login?next=/account/history");

  const { data, status, error } = await safeApiFetch<ApiListResponse<ReadingHistoryRecord>>(
    "/api/v1/accounts/history/?page_size=100",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  if (status === 401) redirect("/login?next=/account/history");

  const records = unwrapList(data ?? { count: 0, next: null, previous: null, results: [] });

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
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
            <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Reading History</h1>
            {records.length > 0 && (
              <p className="text-sm text-[var(--muted)] mt-1">
                {records.length} {records.length === 1 ? "article" : "articles"}
              </p>
            )}
          </div>

          {records.length > 0 && <ClearHistoryButton />}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-4 py-3">
            Failed to load history.{" "}
            <a href="/account/history" className="font-semibold underline">Try again</a>.
          </div>
        )}

        {/* Empty state */}
        {!error && records.length === 0 && <EmptyState />}

        {/* List */}
        {records.length > 0 && (
          <ul className="flex flex-col divide-y divide-[var(--line)]" role="list">
            {records.map((record) => {
              const { article, read_at, read_count } = record;
              return (
                <li key={article.slug} className="py-5 flex gap-4 items-start">

                  {/* Thumbnail */}
                  {article.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaProxyPath(article.image_url) ?? ""}
                      alt=""
                      className="rounded object-cover shrink-0 hidden sm:block"
                      style={{ width: 80, height: 56, objectFit: "cover" }}
                      loading="lazy"
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
                    <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                      <span>{formatRelativeTime(read_at)}</span>
                      {read_count > 1 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Read {read_count}×</span>
                        </>
                      )}
                    </div>
                  </div>

                </li>
              );
            })}
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[var(--ink)]">No history yet</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-xs">
          Articles you read will appear here automatically.
        </p>
      </div>
      <Link href="/" className="mt-1 text-sm text-[var(--accent)] font-semibold hover:underline">
        Browse articles
      </Link>
    </div>
  );
}
