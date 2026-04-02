import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleSummary } from "@/lib/types";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Bookmarks",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_reader_session");
  if (!session?.value) redirect("/login?next=/account/bookmarks");

  const { data, error } = await safeApiFetch<ApiListResponse<ArticleSummary>>(
    "/api/v1/accounts/bookmarks/?page_size=50",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <Link href="/account" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          ← Account
        </Link>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Bookmarks
        </h1>
      </div>

      {error && (
        <p style={{ color: "var(--muted)" }}>Unable to load bookmarks. Please try again.</p>
      )}

      {!error && (!data?.results.length) && (
        <p style={{ color: "var(--muted)" }}>
          You haven&rsquo;t bookmarked any articles yet. Click the bookmark icon on any article to
          save it here.
        </p>
      )}

      {data?.results.map((article) => (
        <article
          key={article.id}
          style={{
            borderBottom: "1px solid var(--line)",
            paddingBottom: "1.25rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
            {article.category?.name}
          </div>
          <Link
            href={`/articles/${article.slug}`}
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--ink)",
              textDecoration: "none",
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </Link>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
            {formatRelativeTime(article.published_at)}
          </p>
        </article>
      ))}
    </div>
  );
}
