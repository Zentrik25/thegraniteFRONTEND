import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { safeApiFetch } from "@/lib/api/fetcher";
import CmsShell from "@/components/cms/CmsShell";
import AnalyticsKpis from "@/components/cms/AnalyticsKpis";
import { mediaProxyPath } from "@/lib/utils/media";

export const metadata: Metadata = { title: "Analytics — CMS" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

function fmtViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Safely extract a string field from an unknown object
function str(obj: unknown, ...keys: string[]): string {
  let cur: unknown = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== "object") return "";
    cur = (cur as Record<string, unknown>)[k];
  }
  return typeof cur === "string" ? cur : "";
}

function num(obj: unknown, key: string): number {
  if (!obj || typeof obj !== "object") return 0;
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "number" ? v : Number(v) || 0;
}

export default async function CmsAnalyticsPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const sp = await searchParams;
  const period = sp.period === "week" ? "week" : "day";

  const { data: raw } = await safeApiFetch<unknown>(
    `/api/v1/analytics/trending/?period=${period}&limit=10`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    },
  );

  // Normalise to array regardless of backend shape
  const trending: unknown[] = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown> | null)?.results)
      ? ((raw as Record<string, unknown>).results as unknown[])
      : [];

  const TAB: React.CSSProperties = {
    padding: "0.4rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
    border: "1px solid transparent",
  };

  return (
    <CmsShell title="Analytics">
      {/* Period toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Link href="/cms/analytics?period=day" style={{ ...TAB, background: period === "day" ? "#111" : "#f0f0f0", color: period === "day" ? "#fff" : "#555" }}>
          Today
        </Link>
        <Link href="/cms/analytics?period=week" style={{ ...TAB, background: period === "week" ? "#111" : "#f0f0f0", color: period === "week" ? "#fff" : "#555" }}>
          This Week
        </Link>
      </div>

      {/* KPIs + chart (client component) */}
      <AnalyticsKpis period={period} />

      {/* Trending list */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e0e0e0", background: "#f5f5f5" }}>
          <h2 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#555" }}>
            Most Read — {period === "day" ? "Today" : "This Week"}
          </h2>
        </div>

        {trending.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "#aaa", margin: 0 }}>
            No view data yet for this period.
          </p>
        ) : (
          <div>
            {trending.map((item, idx) => {
              const article = (item as Record<string, unknown>)?.article as Record<string, unknown> | undefined;
              const slug = str(article, "slug") || String(idx);
              const title = str(article, "title") || slug;
              const imageUrl = str(article, "image_url");
              const imageAlt = str(article, "image_alt") || title;
              const catName = str(article, "category", "name") || str((article as Record<string, unknown> | undefined)?.category, "name");
              const viewCount = num(item, "view_count");
              const rank = num(item, "rank") || idx + 1;

              return (
                <div
                  key={slug + idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderBottom: idx < trending.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: idx < 3 ? "var(--accent, #981b1e)" : "#ddd", width: "1.75rem", flexShrink: 0, textAlign: "right" }}>
                    {rank}
                  </span>

                  {/* Thumbnail */}
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaProxyPath(imageUrl) ?? imageUrl}
                      alt={imageAlt}
                      style={{ width: 56, height: 40, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: 56, height: 40, background: "#f0f0f0", flexShrink: 0 }} />
                  )}

                  {/* Title + category */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {title}
                    </div>
                    {catName && (
                      <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 1 }}>{catName}</div>
                    )}
                  </div>

                  {/* View count */}
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#333", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    {fmtViews(viewCount)}
                  </span>

                  {/* Drill-down — only if we have a real slug */}
                  {str(article, "slug") && (
                    <Link href={`/cms/analytics/articles/${str(article, "slug")}`} style={{ fontSize: "0.78rem", color: "var(--accent, #981b1e)", textDecoration: "none", fontWeight: 600, flexShrink: 0 }}>
                      Stats →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CmsShell>
  );
}
