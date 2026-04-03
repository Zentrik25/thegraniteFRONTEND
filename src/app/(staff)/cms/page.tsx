import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard — CMS" };
export const dynamic = "force-dynamic";

// ─── Backend response shapes ───────────────────────────────────────────────

interface ArticleListItem {
  status?: string;
  view_count?: number;
  published_at?: string;
  title?: string;
  slug?: string;
  author_name?: string;
}

interface CommentItem {
  status?: string;
  created_at?: string;
  body?: string;
  author_name?: string;
  article_title?: string;
  article_slug?: string;
}

interface SubscriberItem {
  is_active?: boolean;
  subscribed_at?: string;
  email?: string;
}

interface MediaItem {
  id: string | number;
  created_at?: string;
}

// ─── KPI derivation ────────────────────────────────────────────────────────

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function relTime(iso: string | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function CmsDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const h = { Authorization: `Bearer ${session.value}` };

  // Fetch everything in parallel — all failures are safe (no throw)
  const [articlesRes, commentsRes, subsRes, mediaRes] = await Promise.all([
    safeApiFetch<ApiListResponse<ArticleListItem>>("/api/v1/articles/?page_size=100", { headers: h, cache: "no-store" }),
    safeApiFetch<ApiListResponse<CommentItem>>("/api/v1/comments/?page_size=100", { headers: h, cache: "no-store" }),
    safeApiFetch<ApiListResponse<SubscriberItem>>("/api/v1/newsletter/subscribers/?page_size=100", { headers: h, cache: "no-store" }),
    safeApiFetch<ApiListResponse<MediaItem>>("/api/v1/media/?page_size=1", { headers: h, cache: "no-store" }),
  ]);

  // Articles KPIs
  const allArticles   = articlesRes.data?.results ?? [];
  const totalArticles = articlesRes.data?.count ?? allArticles.length;
  const published     = allArticles.filter((a) => (a.status ?? "").toLowerCase() === "published");
  const drafts        = allArticles.filter((a) => (a.status ?? "").toLowerCase() === "draft");
  const totalViews    = allArticles.reduce((sum, a) => sum + (a.view_count ?? 0), 0);
  const recentArticles = [...allArticles]
    .filter((a) => (a.status ?? "").toLowerCase() === "published" && a.published_at)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
    .slice(0, 5);

  // Comments KPIs
  const allComments   = commentsRes.data?.results ?? [];
  const totalComments = commentsRes.data?.count ?? allComments.length;
  const pending       = allComments.filter((c) => (c.status ?? "").toLowerCase() === "pending");
  const recentComments = [...allComments]
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .slice(0, 4);

  // Subscriber KPIs
  const allSubs       = subsRes.data?.results ?? [];
  const totalSubs     = subsRes.data?.count ?? allSubs.length;
  const activeSubs    = allSubs.filter((s) => s.is_active !== false).length;

  // Media
  const totalMedia = mediaRes.data?.count ?? 0;

  const kpis = [
    {
      label: "Published",
      value: fmt(published.length || articlesRes.data?.count),
      sub: `${drafts.length} draft${drafts.length !== 1 ? "s" : ""}`,
      href: "/cms/articles?status=published",
      accent: "#155724",
      bg: "#d4edda",
    },
    {
      label: "Total articles",
      value: fmt(totalArticles),
      sub: `${allArticles.filter((a) => (a.status ?? "").toLowerCase() === "archived").length} archived`,
      href: "/cms/articles",
      accent: "#1a1a2e",
      bg: "#f0f0f8",
    },
    {
      label: "Total views",
      value: fmt(totalViews),
      sub: "across all articles",
      href: "/cms/articles",
      accent: "#0f4c81",
      bg: "#e8f2fb",
    },
    {
      label: "Comments",
      value: fmt(totalComments),
      sub: pending.length > 0 ? `${pending.length} pending review` : "All moderated",
      href: "/cms/comments",
      accent: pending.length > 0 ? "#856404" : "#155724",
      bg: pending.length > 0 ? "#fff3cd" : "#d4edda",
    },
    {
      label: "Subscribers",
      value: fmt(totalSubs),
      sub: `${activeSubs} active`,
      href: "/cms/newsletter",
      accent: "#5c2d91",
      bg: "#f3e8ff",
    },
    {
      label: "Media files",
      value: fmt(totalMedia),
      sub: "in library",
      href: "/cms/media",
      accent: "#333",
      bg: "#f5f5f5",
    },
  ];

  const quickLinks = [
    { label: "+ New article", href: "/cms/articles/new", primary: true },
    { label: "Moderate comments", href: "/cms/comments", primary: false },
    { label: "Newsletter", href: "/cms/newsletter", primary: false },
    { label: "Upload media", href: "/cms/media", primary: false },
    { label: "Ad campaigns", href: "/cms/ads", primary: false },
    { label: "Staff management", href: "/cms/staff", primary: false },
  ];

  return (
    <CmsShell title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── KPI grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {kpis.map(({ label, value, sub, href, accent, bg }) => (
            <Link
              key={label}
              href={href}
              style={{
                display: "block",
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                padding: "1.25rem 1.25rem 1rem",
                textDecoration: "none",
                borderTop: `3px solid ${accent}`,
                transition: "box-shadow 0.15s",
              }}
              className="dash-kpi-card"
            >
              <div style={{ fontSize: "2.1rem", fontWeight: 900, color: accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                {value}
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#333", marginTop: "0.35rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.2rem", display: "inline-block", background: bg, padding: "0.1rem 0.4rem", borderRadius: "3px" }}>
                {sub}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Two-column activity ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

          {/* Recent published articles */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#555", margin: 0 }}>
                Recent articles
              </h2>
              <Link href="/cms/articles" style={{ fontSize: "0.72rem", color: "#981b1e", textDecoration: "none" }}>View all →</Link>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", overflow: "hidden" }}>
              {recentArticles.length === 0 ? (
                <p style={{ padding: "1.25rem", fontSize: "0.82rem", color: "#aaa", margin: 0 }}>No published articles yet.</p>
              ) : (
                recentArticles.map((a, i) => (
                  <Link
                    key={a.slug ?? i}
                    href={a.slug ? `/cms/articles/${a.slug}/edit` : "/cms/articles"}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "0.75rem 1rem",
                      borderBottom: i < recentArticles.length - 1 ? "1px solid #f5f5f5" : "none",
                      textDecoration: "none",
                      gap: "0.5rem",
                    }}
                    className="dash-row"
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title ?? "Untitled"}
                      </div>
                      {a.author_name && (
                        <div style={{ fontSize: "0.7rem", color: "#999" }}>{a.author_name}</div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      {a.view_count != null && a.view_count > 0 && (
                        <div style={{ fontSize: "0.72rem", color: "#666", fontVariantNumeric: "tabular-nums" }}>
                          {fmt(a.view_count)} views
                        </div>
                      )}
                      <div style={{ fontSize: "0.68rem", color: "#bbb" }}>{relTime(a.published_at)}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Recent comments */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#555", margin: 0 }}>
                Recent comments
                {pending.length > 0 && (
                  <span style={{ marginLeft: "0.5rem", background: "#ffc107", color: "#333", borderRadius: "3px", padding: "0.05rem 0.35rem", fontSize: "0.65rem", fontWeight: 700 }}>
                    {pending.length} pending
                  </span>
                )}
              </h2>
              <Link href="/cms/comments" style={{ fontSize: "0.72rem", color: "#981b1e", textDecoration: "none" }}>Moderate →</Link>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", overflow: "hidden" }}>
              {recentComments.length === 0 ? (
                <p style={{ padding: "1.25rem", fontSize: "0.82rem", color: "#aaa", margin: 0 }}>No comments yet.</p>
              ) : (
                recentComments.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.75rem 1rem",
                      borderBottom: i < recentComments.length - 1 ? "1px solid #f5f5f5" : "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#333" }}>
                        {c.author_name ?? "Anonymous"}
                      </span>
                      <span style={{ fontSize: "0.65rem", color: "#bbb" }}>{relTime(c.created_at)}</span>
                    </div>
                    {c.body && (
                      <div style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {c.body}
                      </div>
                    )}
                    {(c.status ?? "").toLowerCase() === "pending" && (
                      <span style={{ display: "inline-block", marginTop: "0.25rem", fontSize: "0.62rem", fontWeight: 700, background: "#fff3cd", color: "#856404", borderRadius: "3px", padding: "0.05rem 0.3rem" }}>
                        Pending
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ── Quick actions ── */}
        <section>
          <h2 style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#555", marginBottom: "0.75rem" }}>
            Quick actions
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
            {quickLinks.map(({ label, href, primary }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "inline-block",
                  background: primary ? "#981b1e" : "#fff",
                  border: primary ? "none" : "1px solid #e0e0e0",
                  borderRadius: "4px",
                  padding: "0.5rem 1.1rem",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  color: primary ? "#fff" : "#333",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

      </div>

      <style>{`
        .dash-kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .dash-row:hover { background: #fafafa; }
      `}</style>
    </CmsShell>
  );
}
