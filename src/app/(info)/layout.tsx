import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "The Granite Post", template: "%s — The Granite Post" },
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff", fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Minimal header */}
      <header style={{ borderBottom: "1px solid #e8e8e8", padding: "0.85rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.2rem", fontWeight: 900, color: "#181411", letterSpacing: "-0.02em" }}>
            The Granite <em style={{ fontStyle: "italic", color: "#981b1e" }}>Post</em>
          </span>
        </Link>
        <Link href="/" style={{ fontSize: "0.78rem", color: "#666", textDecoration: "none" }}>← Back to site</Link>
      </header>

      {/* Page content */}
      <main style={{ flex: 1, maxWidth: 780, margin: "0 auto", width: "100%", padding: "2.5rem 1.5rem" }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e8e8e8", padding: "1.25rem 1.5rem", display: "flex", flexWrap: "wrap", gap: "0.5rem 1.5rem", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#888" }}>
        <span>© {new Date().getFullYear()} The Granite Post. All rights reserved.</span>
        <nav style={{ display: "flex", gap: "1rem" }}>
          {[
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Cookies", href: "/cookies" },
            { label: "Contact", href: "/contact" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "#888", textDecoration: "none" }}>{l.label}</Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
