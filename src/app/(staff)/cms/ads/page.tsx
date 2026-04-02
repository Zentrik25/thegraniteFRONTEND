import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, AdZone } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { formatDate, formatCurrencyUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Ads — CMS" };
export const dynamic = "force-dynamic";

interface AdCampaign {
  id: string | number;
  name: string;
  status: string;
  zone: AdZone | null;
  start_date: string;
  end_date: string | null;
  total_impressions?: number;
  total_clicks?: number;
  budget?: string;
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  active: { bg: "#d4edda", color: "#155724" },
  paused: { bg: "#fff3cd", color: "#856404" },
  ended:  { bg: "#e2e3e5", color: "#383d41" },
  draft:  { bg: "#d1ecf1", color: "#0c5460" },
};

function ctr(impressions?: number, clicks?: number): string {
  if (!impressions || !clicks) return "—";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

export default async function CmsAdsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { data, error } = await safeApiFetch<ApiListResponse<AdCampaign>>(
    "/api/v1/advertising/campaigns/?page_size=25",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const campaigns = data?.results ?? [];

  return (
    <CmsShell title="Ad Campaigns">
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
          Could not load campaigns. {error}
        </div>
      )}

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
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600 }}>Campaign</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Zone</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Impr.</th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Clicks</th>
              <th style={{ textAlign: "right", padding: "0.75rem 0.5rem", fontWeight: 600 }}>CTR</th>
              <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontWeight: 600 }}>Budget</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                  No campaigns found.
                </td>
              </tr>
            )}
            {campaigns.map((c) => {
              const badge = STATUS_COLOR[c.status] ?? { bg: "#eee", color: "#333" };
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#888" }}>
                      {formatDate(c.start_date)}
                      {c.end_date ? ` – ${formatDate(c.end_date)}` : ""}
                    </div>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#666" }}>
                    {c.zone?.name ?? "—"}
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
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#555" }}>
                    {c.total_impressions?.toLocaleString() ?? "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#555" }}>
                    {c.total_clicks?.toLocaleString() ?? "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", textAlign: "right", color: "#555" }}>
                    {ctr(c.total_impressions, c.total_clicks)}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "#555" }}>
                    {c.budget ? formatCurrencyUsd(c.budget) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.total_pages && data.total_pages > 1 && (
        <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#888" }}>
          Page {data.current_page} of {data.total_pages} — {data.count} campaigns total
        </div>
      )}
    </CmsShell>
  );
}
