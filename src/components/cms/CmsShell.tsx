import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { hasStaffSession } from "@/lib/auth/staff-session";

interface CmsShellProps {
  children: ReactNode;
  title?: string;
}

const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { label: "Dashboard",   href: "/cms",              icon: "grid" },
      { label: "Articles",    href: "/cms/articles",     icon: "file-text" },
      { label: "Media",       href: "/cms/media",        icon: "image" },
      { label: "Comments",    href: "/cms/comments",     icon: "message-square" },
    ],
  },
  {
    label: "Taxonomy",
    items: [
      { label: "Sections",    href: "/cms/sections",     icon: "layers" },
      { label: "Categories",  href: "/cms/categories",   icon: "tag" },
      { label: "Tags",        href: "/cms/tags",         icon: "hash" },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Newsletter",  href: "/cms/newsletter",   icon: "mail" },
      { label: "Subscriptions", href: "/cms/subscriptions", icon: "star" },
      { label: "Ads",         href: "/cms/ads",          icon: "trending-up" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Staff",       href: "/cms/staff",        icon: "users" },
      { label: "Analytics",   href: "/cms/analytics",    icon: "bar-chart-2" },
      { label: "Settings",    href: "/cms/settings",     icon: "settings" },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    "grid":         "M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z",
    "file-text":    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
    "image":        "M21 15l-5-5L5 21M21 3H3v18M3 9h18",
    "message-square": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    "layers":       "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    "tag":          "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
    "hash":         "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
    "mail":         "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
    "star":         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    "trending-up":  "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
    "users":        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    "bar-chart-2":  "M18 20V10M12 20V4M6 20v-6",
    "settings":     "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  };
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d={icons[name] ?? ""} />
    </svg>
  );
}

export default async function CmsShell({ children, title }: CmsShellProps) {
  const authed = await hasStaffSession();
  if (!authed) redirect("/cms/login");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0f2f5", fontFamily: "var(--sans)" }}>

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside style={{
        width: "230px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #0f1117 0%, #151921 100%)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}>

        {/* Logo area */}
        <div style={{
          padding: "1.4rem 1.2rem 1.1rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}>
          <div style={{
            width: "30px",
            height: "30px",
            background: "var(--accent, #bb1919)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
            </svg>
          </div>
          <div>
            <Link href="/" style={{ fontFamily: "var(--serif)", fontSize: "0.88rem", fontWeight: 700, color: "#fff", textDecoration: "none", display: "block", letterSpacing: "-0.01em" }}>
              The Granite Post
            </Link>
            <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Editorial CMS
            </span>
          </div>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, padding: "0.75rem 0.6rem", overflowY: "auto" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: "0.25rem" }}>
              <p style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.28)",
                padding: "0.75rem 0.6rem 0.3rem",
                margin: 0,
              }}>
                {group.label}
              </p>
              {group.items.map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="cms-nav-link"
                >
                  <NavIcon name={icon} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: "0.9rem 1rem",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}>
          <Link href="/" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            View site
          </Link>
          <form action="/api/staff/logout" method="POST">
            <button type="submit" className="cms-signout-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflowY: "auto" }}>
        {title && (
          <header style={{
            background: "#fff",
            borderBottom: "1px solid #e5e7eb",
            padding: "0.875rem 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <div style={{ width: "3px", height: "20px", background: "var(--accent, #bb1919)", borderRadius: "2px", flexShrink: 0 }} />
            <h1 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#111827" }}>{title}</h1>
          </header>
        )}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
