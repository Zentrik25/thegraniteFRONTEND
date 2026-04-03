import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleSummary } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import CmsStatusFilter from "@/components/cms/CmsStatusFilter";
import { StatusBadge } from "@/components/staff/StatusBadge";
import { DeleteArticleButton } from "@/components/cms/DeleteArticleButton";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";

function formatViews(n: number | undefined): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const metadata: Metadata = { title: "Articles — CMS" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}

export default async function CmsArticlesPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const sp = await searchParams;
  const page = sp.page ?? "1";
  const status = sp.status ?? "";
  const q = sp.q ?? "";

  const params = new URLSearchParams({ page, page_size: "25" });
  if (status) params.set("status", status);
  if (q) params.set("search", q);

  const { data } = await safeApiFetch<ApiListResponse<ArticleSummary>>(
    `/api/v1/articles/?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const articles = data?.results ?? [];

  return (
    <CmsShell title="Articles">
      <style>{`.cms-article-row:hover { background: #fafafa; }`}</style>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <form style={{ display: "flex", gap: "0.5rem", flex: 1, minWidth: "200px" }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search articles…"
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "0.875rem",
            }}
          />
          <button
            type="submit"
            style={{
              background: "var(--ink)",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Search
          </button>
        </form>

        <CmsStatusFilter defaultValue={status} />

        <Link
          href="/cms/articles/new"
          style={{
            background: "var(--accent)",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
          }}
        >
          + New article
        </Link>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ textAlign: "left", padding: "0.6rem 1rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Title</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.5rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Author</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.5rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Status</th>
              <th style={{ textAlign: "right", padding: "0.6rem 0.5rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Views</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.5rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Date</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", fontWeight: 600, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#aaa", fontSize: "0.9rem" }}>
                  No articles found. <Link href="/cms/articles/new" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>Create the first one →</Link>
                </td>
              </tr>
            )}
            {articles.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0" }} className="cms-article-row">
                <td style={{ padding: "0.65rem 1rem", maxWidth: "340px" }}>
                  <Link
                    href={`/cms/articles/${a.slug}/edit`}
                    style={{ fontWeight: 600, color: "#111", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {a.title}
                  </Link>
                  {a.category?.name && (
                    <div style={{ fontSize: "0.72rem", color: "#999", marginTop: "0.1rem" }}>{a.category.name}</div>
                  )}
                </td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#555", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                  {a.author_name ?? a.author?.display_name ?? <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td style={{ padding: "0.65rem 0.5rem" }}>
                  <StatusBadge status={a.status ?? "draft"} />
                </td>
                <td style={{ padding: "0.65rem 0.5rem", textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem", color: "#666" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {formatViews(a.view_count)}
                  </span>
                </td>
                <td style={{ padding: "0.65rem 0.5rem", color: "#888", whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                  {a.published_at
                    ? formatRelativeTime(a.published_at)
                    : a.created_at
                    ? formatRelativeTime(a.created_at)
                    : <span style={{ color: "#ccc" }}>—</span>}
                </td>
                <td style={{ padding: "0.65rem 0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link
                      href={`/cms/articles/${a.slug}/edit`}
                      style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none", fontSize: "0.8rem" }}
                    >
                      Edit →
                    </Link>
                    {(a.status ?? "draft").toLowerCase() !== "archived" && (
                      <DeleteArticleButton slug={a.slug} title={a.title} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (data.total_pages ?? 1) > 1 && (
        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.82rem", color: "#888" }}>
          <span>{data.count} articles total</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {Number(page) > 1 && (
              <Link
                href={`/cms/articles?page=${Number(page) - 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
                style={{ padding: "0.35rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px", textDecoration: "none", color: "#333" }}
              >
                ← Prev
              </Link>
            )}
            <span style={{ padding: "0.35rem 0.75rem", background: "#f5f5f5", borderRadius: "4px" }}>
              {data.current_page} / {data.total_pages}
            </span>
            {Number(page) < (data.total_pages ?? 1) && (
              <Link
                href={`/cms/articles?page=${Number(page) + 1}${status ? `&status=${status}` : ""}${q ? `&q=${q}` : ""}`}
                style={{ padding: "0.35rem 0.75rem", border: "1px solid #ddd", borderRadius: "4px", textDecoration: "none", color: "#333" }}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
      {data && (data.total_pages ?? 1) <= 1 && data.count > 0 && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "#aaa" }}>
          {data.count} article{data.count !== 1 ? "s" : ""}
        </div>
      )}
    </CmsShell>
  );
}
