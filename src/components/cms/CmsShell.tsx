import Link from "next/link";
import type { ReactNode } from "react";

interface CmsShellProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { label: "Dashboard", href: "/cms" },
  { label: "Articles", href: "/cms/articles" },
  { label: "Media", href: "/cms/media" },
  { label: "Comments", href: "/cms/comments" },
  { label: "Newsletter", href: "/cms/newsletter" },
  { label: "Ads", href: "/cms/ads" },
  { label: "Subscriptions", href: "/cms/subscriptions" },
  { label: "Staff", href: "/cms/staff" },
];

export default function CmsShell({ children, title }: CmsShellProps) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8f8f8",
        fontFamily: "var(--sans)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          background: "#1e1e1e",
          color: "#e8e8e8",
          display: "flex",
          flexDirection: "column",
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

        <nav style={{ flex: 1, padding: "0.75rem 0" }}>
          {navItems.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "block",
                padding: "0.6rem 1rem",
                color: "#ccc",
                textDecoration: "none",
                fontSize: "0.875rem",
                transition: "background 0.1s",
              }}
            >
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

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {title && (
          <header
            style={{
              background: "#fff",
              borderBottom: "1px solid #e0e0e0",
              padding: "1rem 1.5rem",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>{title}</h1>
          </header>
        )}
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
