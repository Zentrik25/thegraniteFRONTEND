import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import CmsShell from "@/components/cms/CmsShell";
import Link from "next/link";

export const metadata: Metadata = { title: "CMS Dashboard" };
export const dynamic = "force-dynamic";

interface DashboardStats {
  total_articles?: number;
  published_articles?: number;
  draft_articles?: number;
  total_comments?: number;
  pending_comments?: number;
  total_subscribers?: number;
  active_subscribers?: number;
}

export default async function CmsDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { data: stats } = await safeApiFetch<DashboardStats>("/api/v1/staff/dashboard/stats/", {
    headers: { Authorization: `Bearer ${session.value}` },
    cache: "no-store",
  });

  const statCards = [
    { label: "Published articles", value: stats?.published_articles ?? "—" },
    { label: "Drafts", value: stats?.draft_articles ?? "—" },
    { label: "Pending comments", value: stats?.pending_comments ?? "—" },
    { label: "Active subscribers", value: stats?.active_subscribers ?? "—" },
  ];

  const quickLinks = [
    { label: "New article", href: "/cms/articles/new" },
    { label: "Moderate comments", href: "/cms/comments" },
    { label: "Manage newsletter", href: "/cms/newsletter" },
    { label: "Ad campaigns", href: "/cms/ads" },
  ];

  return (
    <CmsShell title="Dashboard">
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {statCards.map(({ label, value }) => (
            <div
              key={label}
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Quick actions
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {quickLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "block",
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  padding: "1rem",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "var(--ink)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </CmsShell>
  );
}
