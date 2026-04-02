import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleSummary } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";

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
    `/api/v1/staff/articles/?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const articles = data?.results ?? [];

  const statusBadge: Record<string, { bg: string; color: string }> = {
    published: { bg: "#d4edda", color: "#155724" },
    draft: { bg: "#e2e3e5", color: "#383d41" },
    scheduled: { bg: "#d1ecf1", color: "#0c5460" },
    archived: { bg: "#fff3cd", color: "#856404" },
  };

  return (
    <CmsShell title="Articles">
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

        <select
          onChange={(e) => {
            // handled via form below
          }}
          defaultValue={status}
          style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.875rem" }}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>

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
            <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600 }}>Title</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Author</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Date</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                  No articles found.
                </td>
              </tr>
            )}
            {articles.map((a) => {
              const badge = statusBadge[a.status ?? "draft"] ?? { bg: "#eee", color: "#333" };
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.75rem 1rem", maxWidth: "320px" }}>
                    <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.title}
                    </div>
                    {a.category?.name && (
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>{a.category.name}</div>
                    )}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#555" }}>
                    {a.author?.display_name ?? "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {a.status ?? "draft"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#888", whiteSpace: "nowrap" }}>
                    {formatRelativeTime(a.published_at)}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <Link
                      href={`/cms/articles/${a.id}/edit`}
                      style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none", fontSize: "0.8rem" }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {data && data.total_pages && data.total_pages > 1 && (
        <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#888" }}>
          Page {data.current_page} of {data.total_pages} — {data.count} articles total
        </div>
      )}
    </CmsShell>
  );
}
