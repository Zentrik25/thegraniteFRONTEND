import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Newsletter — CMS" };
export const dynamic = "force-dynamic";

interface NewsletterSubscriber {
  id: string | number;
  email: string;
  subscribed_at: string;
  is_active: boolean;
}

export default async function CmsNewsletterPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { data, error } = await safeApiFetch<ApiListResponse<NewsletterSubscriber>>(
    "/api/v1/newsletter/subscribers/?page_size=25",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const subscribers = data?.results ?? [];

  return (
    <CmsShell title="Newsletter">
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
            marginBottom: "1.25rem",
          }}
        >
          Could not load subscribers. {error}
        </div>
      )}

      {/* Summary stat */}
      {data && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            padding: "1.25rem 1.5rem",
            display: "inline-flex",
            flexDirection: "column",
            gap: "0.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>
            {data.count.toLocaleString()}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#666" }}>Total subscribers</div>
        </div>
      )}

      {/* Subscriber table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600 }}>Email</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Subscribed</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                  {error ? "Error loading data." : "No subscribers yet."}
                </td>
              </tr>
            )}
            {subscribers.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#333" }}>{s.email}</td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#888", fontSize: "0.8rem" }}>
                  {formatDate(s.subscribed_at)}
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span
                    style={{
                      color: s.is_active ? "#155724" : "#721c24",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    {s.is_active ? "Active" : "Unsubscribed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.total_pages && data.total_pages > 1 && (
        <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#888" }}>
          Page {data.current_page} of {data.total_pages} — {data.count} total
        </div>
      )}
    </CmsShell>
  );
}
