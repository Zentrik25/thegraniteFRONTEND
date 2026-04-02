import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, Subscription } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { formatDate, formatCurrencyUsd } from "@/lib/format";

export const metadata: Metadata = { title: "Subscriptions — CMS" };
export const dynamic = "force-dynamic";

const STATUS_TABS = ["", "active", "trialing", "past_due", "cancelled", "expired"] as const;

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  active:    { bg: "#d4edda", color: "#155724" },
  trialing:  { bg: "#d1ecf1", color: "#0c5460" },
  past_due:  { bg: "#fff3cd", color: "#856404" },
  cancelled: { bg: "#f8d7da", color: "#721c24" },
  expired:   { bg: "#e2e3e5", color: "#383d41" },
};

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function CmsSubscriptionsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = sp.page ?? "1";

  const params = new URLSearchParams({ page, page_size: "25" });
  if (status) params.set("status", status);

  const { data, error } = await safeApiFetch<ApiListResponse<Subscription>>(
    `/api/v1/subscriptions/?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const subs = data?.results ?? [];

  return (
    <CmsShell title="Subscriptions">
      {/* Status filter */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={s ? `/cms/subscriptions?status=${s}` : "/cms/subscriptions"}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
              background: status === s ? "var(--accent)" : "#e8e8e8",
              color: status === s ? "#fff" : "#444",
              textTransform: "capitalize",
            }}
          >
            {s || "All"}
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
          Could not load subscriptions. {error}
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
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600 }}>User</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Plan</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Expires</th>
              <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontWeight: 600 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                  {error ? "Error loading data." : "No subscriptions found."}
                </td>
              </tr>
            )}
            {subs.map((s) => {
              const badge = STATUS_COLOR[s.status] ?? { bg: "#eee", color: "#333" };
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ fontWeight: 600 }}>{s.user?.email ?? "—"}</div>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#555" }}>{s.plan?.name ?? "—"}</td>
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
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#888" }}>
                    {s.current_period_end ? formatDate(s.current_period_end) : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "#555" }}>
                    {s.plan?.price_usd ? formatCurrencyUsd(s.plan.price_usd) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
          <span>
            Page {data.current_page} of {data.total_pages} — {data.count} total
          </span>
          {data.current_page && data.current_page > 1 && (
            <Link
              href={`/cms/subscriptions?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.current_page - 1) })}`}
              style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
            >
              ← Prev
            </Link>
          )}
          {data.current_page && data.current_page < data.total_pages && (
            <Link
              href={`/cms/subscriptions?${new URLSearchParams({ ...(status ? { status } : {}), page: String(data.current_page + 1) })}`}
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
