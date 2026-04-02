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

interface NewsletterCampaign {
  id: string | number;
  subject: string;
  sent_at: string | null;
  status: string;
  recipient_count?: number;
}

export default async function CmsNewsletterPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const headers = { Authorization: `Bearer ${session.value}` };

  const [subsRes, campaignsRes] = await Promise.all([
    safeApiFetch<ApiListResponse<NewsletterSubscriber>>(
      "/api/v1/newsletter/subscribers/?page_size=10",
      { headers, cache: "no-store" }
    ),
    safeApiFetch<ApiListResponse<NewsletterCampaign>>(
      "/api/v1/newsletter/campaigns/?page_size=10",
      { headers, cache: "no-store" }
    ),
  ]);

  const subscribers = subsRes.data;
  const campaigns = campaignsRes.data?.results ?? [];

  const statusBadge: Record<string, { bg: string; color: string }> = {
    sent: { bg: "#d4edda", color: "#155724" },
    draft: { bg: "#e2e3e5", color: "#383d41" },
    scheduled: { bg: "#d1ecf1", color: "#0c5460" },
    failed: { bg: "#f8d7da", color: "#721c24" },
  };

  return (
    <CmsShell title="Newsletter">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Stats */}
        {subscribers && (
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "1.25rem", display: "inline-flex", flexDirection: "column", gap: "0.25rem", width: "fit-content" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent)" }}>
              {subscribers.count.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#666" }}>Total subscribers</div>
          </div>
        )}

        {/* Campaigns */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700 }}>Campaigns</h2>
            <a
              href="/cms/newsletter/new"
              style={{
                background: "var(--accent)",
                color: "#fff",
                padding: "0.4rem 1rem",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              + New campaign
            </a>
          </div>

          {campaigns.length === 0 && (
            <p style={{ color: "#888", fontSize: "0.875rem" }}>No campaigns yet.</p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {campaigns.map((c) => {
              const badge = statusBadge[c.status] ?? { bg: "#eee", color: "#333" };
              return (
                <div
                  key={c.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    padding: "0.875rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{c.subject}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.1rem" }}>
                      {c.sent_at ? `Sent ${formatDate(c.sent_at)}` : "Not sent"}{" "}
                      {c.recipient_count ? `· ${c.recipient_count.toLocaleString()} recipients` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {c.status}
                    </span>
                    {c.status === "draft" && (
                      <a
                        href={`/cms/newsletter/${c.id}/edit`}
                        style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}
                      >
                        Edit
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </CmsShell>
  );
}
