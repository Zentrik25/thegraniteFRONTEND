import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";

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
}

// ─── Helpers ──────────────────────────────────────────────────────────────

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

// ─── Quick action definitions ──────────────────────────────────────────────

const quickActions = [
  {
    label: "New Article",
    desc: "Write and publish a story",
    href: "/cms/articles/new",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
    primary: true,
  },
  {
    label: "Upload Media",
    desc: "Add images to the library",
    href: "/cms/media",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    primary: false,
  },
  {
    label: "Moderate Comments",
    desc: "Review pending comments",
    href: "/cms/comments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    primary: false,
  },
  {
    label: "Newsletter",
    desc: "Manage subscribers & sends",
    href: "/cms/newsletter",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    primary: false,
  },
  {
    label: "Analytics",
    desc: "View traffic and trends",
    href: "/cms/analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    primary: false,
  },
  {
    label: "Settings",
    desc: "Profile, password, staff",
    href: "/cms/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    primary: false,
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function CmsDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const h = { Authorization: `Bearer ${session.value}` };

  const [articlesRes, commentsRes] = await Promise.all([
    safeApiFetch<ApiListResponse<ArticleListItem>>("/api/v1/articles/?page_size=100", { headers: h, cache: "no-store" }),
    safeApiFetch<ApiListResponse<CommentItem>>("/api/v1/comments/?page_size=100", { headers: h, cache: "no-store" }),
  ]);

  const allArticles   = articlesRes.data?.results ?? [];
  const totalArticles = articlesRes.data?.count ?? allArticles.length;
  const totalViews    = allArticles.reduce((sum, a) => sum + (a.view_count ?? 0), 0);

  const allComments   = commentsRes.data?.results ?? [];
  const totalComments = commentsRes.data?.count ?? allComments.length;
  const pending       = allComments.filter((c) => (c.status ?? "").toLowerCase() === "pending");

  const recentArticles = [...allArticles]
    .filter((a) => (a.status ?? "").toLowerCase() === "published" && a.published_at)
    .sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime())
    .slice(0, 8);

  const kpis = [
    {
      label: "Total Views",
      value: fmt(totalViews),
      sub: "all articles · all time",
      href: "/cms/analytics",
      color: "#0f4c81",
      bar: "#0f4c81",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
    },
    {
      label: "Total Articles",
      value: fmt(totalArticles),
      sub: `${allArticles.filter((a) => (a.status ?? "").toLowerCase() === "published").length} published`,
      href: "/cms/articles",
      color: "#155724",
      bar: "#155724",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      label: "Comments",
      value: fmt(totalComments),
      sub: pending.length > 0 ? `${pending.length} pending review` : "All moderated",
      href: "/cms/comments",
      color: pending.length > 0 ? "#856404" : "#155724",
      bar: pending.length > 0 ? "#e6a817" : "#2a7a2a",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
  ];

  return (
    <CmsShell title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>

        {/* ── 3 KPI cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {kpis.map(({ label, value, sub, href, color, bar, icon }) => (
            <Link
              key={label}
              href={href}
              className="dash-kpi-card"
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "10px",
                padding: "1.35rem 1.4rem 1.1rem",
                textDecoration: "none",
                borderTop: `4px solid ${bar}`,
                gap: "0.1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "2.4rem", fontWeight: 900, color, lineHeight: 1, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>
                  {value}
                </div>
                <div style={{ color, opacity: 0.45, marginTop: "0.1rem" }}>
                  {icon}
                </div>
              </div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#222", marginTop: "0.5rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#999", marginTop: "0.1rem" }}>
                {sub}
              </div>
            </Link>
          ))}
        </div>

        {/* ── Two-column: recent articles + quick actions ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", alignItems: "start" }}>

          {/* Recent published articles */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
              <h2 style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#555", margin: 0 }}>
                Recent Articles
              </h2>
              <Link href="/cms/articles" style={{ fontSize: "0.72rem", color: "#981b1e", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "8px", overflow: "hidden" }}>
              {recentArticles.length === 0 ? (
                <p style={{ padding: "1.5rem", fontSize: "0.82rem", color: "#aaa", margin: 0, textAlign: "center" }}>No published articles yet.</p>
              ) : (
                recentArticles.map((a, i) => (
                  <Link
                    key={a.slug ?? i}
                    href={a.slug ? `/cms/articles/${a.slug}/edit` : "/cms/articles"}
                    className="dash-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.7rem 1rem",
                      borderBottom: i < recentArticles.length - 1 ? "1px solid #f5f5f5" : "none",
                      textDecoration: "none",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.title ?? "Untitled"}
                      </div>
                      {a.author_name && (
                        <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "1px" }}>{a.author_name}</div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      {a.view_count != null && a.view_count > 0 && (
                        <div style={{ fontSize: "0.72rem", color: "#666", fontVariantNumeric: "tabular-nums" }}>
                          {fmt(a.view_count)} views
                        </div>
                      )}
                      <div style={{ fontSize: "0.68rem", color: "#ccc" }}>{relTime(a.published_at)}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Quick Actions column */}
          <section>
            <h2 style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#555", margin: "0 0 0.65rem" }}>
              Quick Actions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {quickActions.map(({ label, desc, href, icon, primary }) => (
                <Link
                  key={href}
                  href={href}
                  className="dash-action-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    background: primary ? "#981b1e" : "#fff",
                    border: primary ? "none" : "1px solid #e8e8e8",
                    color: primary ? "#fff" : "#111",
                    boxShadow: primary ? "0 2px 8px rgba(152,27,30,0.18)" : "none",
                  }}
                >
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "8px",
                    background: primary ? "rgba(255,255,255,0.18)" : "#f5f5f5",
                    flexShrink: 0,
                    color: primary ? "#fff" : "#555",
                  }}>
                    {icon}
                  </span>
                  <span>
                    <span style={{ display: "block", fontSize: "0.83rem", fontWeight: 700, lineHeight: 1.2 }}>
                      {label}
                    </span>
                    <span style={{ display: "block", fontSize: "0.7rem", opacity: primary ? 0.8 : 1, color: primary ? "#fff" : "#999", marginTop: "1px" }}>
                      {desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>

      <style>{`
        .dash-kpi-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); transform: translateY(-1px); transition: box-shadow 0.15s, transform 0.15s; }
        .dash-kpi-card { transition: box-shadow 0.15s, transform 0.15s; }
        .dash-row:hover { background: #fafafa; }
        .dash-action-btn { transition: box-shadow 0.12s, transform 0.12s; }
        .dash-action-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); transform: translateY(-1px); }
      `}</style>
    </CmsShell>
  );
}
