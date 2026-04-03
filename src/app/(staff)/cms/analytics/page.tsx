import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { TrendingArticle } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import AnalyticsKpis from "@/components/cms/AnalyticsKpis";
import { mediaProxyPath } from "@/lib/utils/media";

export const metadata: Metadata = { title: "Analytics — CMS" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default async function CmsAnalyticsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const sp = await searchParams;
  const period = sp.period === "week" ? "week" : "day";

  const { data: trendingData } = await safeApiFetch<TrendingArticle[] | { results: TrendingArticle[] }>(
    `/api/v1/analytics/trending/?period=${period}&limit=10`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    },
  );

  // Handle both list and paginated responses
  const trending: TrendingArticle[] = Array.isArray(trendingData)
    ? trendingData
    : (trendingData as { results: TrendingArticle[] } | null)?.results ?? [];

  return (
    <CmsShell title="Analytics">
      {/* Period toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Link
          href="/cms/analytics?period=day"
          style={{
            padding: "0.4rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
            background: period === "day" ? "var(--ink)" : "#f0f0f0",
            color: period === "day" ? "#fff" : "#555",
            border: "1px solid transparent",
          }}
        >
          Today
        </Link>
        <Link
          href="/cms/analytics?period=week"
          style={{
            padding: "0.4rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
            background: period === "week" ? "var(--ink)" : "#f0f0f0",
            color: period === "week" ? "#fff" : "#555",
            border: "1px solid transparent",
          }}
        >
          This Week
        </Link>
      </div>

      {/* KPIs and Charts */}
      <AnalyticsKpis period={period as "day" | "week"} />

      {/* Trending articles */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e0e0e0", background: "#f5f5f5" }}>
          <h2 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>
            Most Read — {period === "day" ? "Today" : "This Week"}
          </h2>
        </div>

        {trending.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "#aaa", margin: 0 }}>
            No view data yet for this period.
          </p>
        ) : (
          <div>
            {trending.map((item, idx) => (
              <div
                key={item.article.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderBottom: idx < trending.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                {/* Rank */}
                <span style={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  color: idx < 3 ? "var(--accent)" : "#ccc",
                  width: "1.75rem",
                  flexShrink: 0,
                  fontFamily: "var(--font-ui)",
                  textAlign: "right",
                }}>
                  {item.rank ?? idx + 1}
                </span>

                {/* Thumbnail */}
                {item.article.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaProxyPath(item.article.image_url) ?? ""}
                    alt={item.article.image_alt || item.article.title}
                    style={{ width: 56, height: 40, objectFit: "cover", borderRadius: "3px", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 56, height: 40, background: "#f0f0f0", borderRadius: "3px", flexShrink: 0 }} />
                )}

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    color: "#111",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {item.article.title}
                  </div>
                  {item.article.category && (
                    <div style={{ fontSize: "0.72rem", color: "#999", marginTop: "1px" }}>
                      {item.article.category.name}
                    </div>
                  )}
                </div>

                {/* View count */}
                <span style={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "#333",
                  fontFamily: "var(--font-ui)",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {formatViews(item.view_count)}
                </span>

                {/* Drill-down link */}
                <Link
                  href={`/cms/analytics/articles/${item.article.slug}`}
                  style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}
                >
                  Stats →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </CmsShell>
  );
}
