import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, CommentRecord } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Comments — CMS" };
export const dynamic = "force-dynamic";

// Backend only supports: pending, approved, rejected
const STATUS_TABS = ["pending", "approved", "rejected"] as const;

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function CmsCommentsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const sp = await searchParams;
  const status = sp.status ?? "pending";
  const page = sp.page ?? "1";

  const params = new URLSearchParams({ status, page, page_size: "30" });

  const { data, error } = await safeApiFetch<ApiListResponse<CommentRecord>>(
    `/api/v1/moderation/comments/?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const comments = data?.results ?? [];

  return (
    <CmsShell title="Comments">
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={`/cms/comments?status=${s}`}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
              background: status === s ? "var(--accent)" : "#e8e8e8",
              color: status === s ? "#fff" : "#444",
              textTransform: "capitalize",
            }}
          >
            {s}
          </Link>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: "#fff0f0",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          Could not load comments. {error}
        </div>
      )}

      {!error && comments.length === 0 && (
        <p style={{ color: "#888" }}>No {status} comments.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                  {c.author_name ?? "Anonymous"}
                </span>
                <span style={{ color: "#999", fontSize: "0.8rem", marginLeft: "0.5rem" }}>
                  {formatRelativeTime(c.created_at)}
                </span>
                {c.article_title && (
                  <div style={{ fontSize: "0.8rem", color: "var(--accent)", marginTop: "0.1rem" }}>
                    on: {c.article_title}
                  </div>
                )}
              </div>

              {/* Action buttons — backend supports approve and reject only */}
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {status !== "approved" && (
                  <form action={`/api/staff/comments/${c.id}/approve`} method="POST">
                    <button
                      type="submit"
                      style={{
                        background: "#d4edda",
                        color: "#155724",
                        border: "none",
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Approve
                    </button>
                  </form>
                )}
                {status !== "rejected" && (
                  <form action={`/api/staff/comments/${c.id}/reject`} method="POST">
                    <button
                      type="submit"
                      style={{
                        background: "#f8d7da",
                        color: "#721c24",
                        border: "none",
                        padding: "0.3rem 0.7rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </form>
                )}
              </div>
            </div>

            <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "#333", lineHeight: 1.5 }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>

      {data && data.total_pages && data.total_pages > 1 && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            fontSize: "0.875rem",
            color: "#888",
          }}
        >
          <span>Page {data.current_page} of {data.total_pages}</span>
          {data.current_page && data.current_page > 1 && (
            <Link
              href={`/cms/comments?status=${status}&page=${data.current_page - 1}`}
              style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
            >
              ← Prev
            </Link>
          )}
          {data.current_page && data.current_page < data.total_pages && (
            <Link
              href={`/cms/comments?status=${status}&page=${data.current_page + 1}`}
              style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </CmsShell>
  );
}
