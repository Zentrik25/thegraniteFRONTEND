import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { hasStaffSession } from "@/lib/auth/staff-session";

interface CmsShellProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { label: "Dashboard", href: "/cms", icon: "📊" },
  { label: "Articles", href: "/cms/articles", icon: "📝" },
  { label: "Sections", href: "/cms/sections", icon: "📑" },
  { label: "Categories", href: "/cms/categories", icon: "🏷️" },
  { label: "Tags", href: "/cms/tags", icon: "🔖" },
  { label: "Media", href: "/cms/media", icon: "🖼️" },
  { label: "Comments", href: "/cms/comments", icon: "💬" },
  { label: "Newsletter", href: "/cms/newsletter", icon: "📧" },
  { label: "Ads", href: "/cms/ads", icon: "📢" },
  { label: "Subscriptions", href: "/cms/subscriptions", icon: "🎁" },
  { label: "Staff", href: "/cms/staff", icon: "👥" },
  { label: "Analytics", href: "/cms/analytics", icon: "📈" },
  { label: "Settings", href: "/cms/settings", icon: "⚙️" },
];

/** Server component — every CMS page that renders this gets a free session check. */
export default async function CmsShell({ children, title }: CmsShellProps) {
  // Centralised guard: any page rendering CmsShell is protected even if the
  // per-page check was accidentally omitted. The login page never uses CmsShell,
  // so there is no redirect loop.
  const authed = await hasStaffSession();
  if (!authed) redirect("/cms/login");

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#f8f8f8",
        fontFamily: "var(--sans)",
      }}
    >
      {/* Sidebar — sticky, never scrolls with main content */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "#1e1e1e",
          color: "#e8e8e8",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1rem",
            borderBottom: "1px solid #333",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1rem",
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              display: "block",
            }}
          >
            The Granite Post
          </Link>
          <span style={{ fontSize: "0.7rem", color: "#999", display: "block", marginTop: "2px" }}>
            CMS
          </span>
        </div>

        <nav style={{ flex: 1, padding: "0.5rem 0" }}>
          {navItems.map(({ label, href, icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.45rem 1rem",
                color: "#ccc",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 700,
                transition: "background 0.1s",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: "1rem", borderTop: "1px solid #333" }}>
          <form action="/api/staff/logout" method="POST">
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "1px solid #444",
                color: "#999",
                padding: "0.4rem 0.75rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.8rem",
                width: "100%",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main — scrolls independently of the sidebar */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflowY: "auto" }}>
        {title && (
          <header
            style={{
              background: "#fff",
              borderBottom: "1px solid #e0e0e0",
              padding: "1rem 1.5rem",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{title}</h1>
          </header>
        )}
        <main style={{ flex: 1, padding: "1.5rem" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
