import Link from "next/link";

import { getSectionDetails } from "@/lib/api/articles";
import { SiteHeader } from "@/components/site/SiteHeader";

const FOOTER_COLS = [
  {
    title: "Coverage",
    links: [
      { label: "Politics", href: "/sections/politics" },
      { label: "Business", href: "/sections/business" },
      { label: "Technology", href: "/sections/technology" },
      { label: "Sport", href: "/sections/sport" },
      { label: "Opinion", href: "/sections/opinion" },
    ],
  },
  {
    title: "Reader",
    links: [
      { label: "Sign In", href: "/login" },
      { label: "Create Account", href: "/register" },
      { label: "My Account", href: "/account" },
      { label: "Subscriptions", href: "/subscribe" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Advertise", href: "/advertise" },
      { label: "Editorial Standards", href: "/editorial-standards" },
    ],
  },
];

export async function PageShell({ children }: { children: React.ReactNode }) {
  const sections = await getSectionDetails(true);
  const year = new Date().getFullYear();

  return (
    <div className="shell">
      {/* ── BBC-style sticky header with hamburger ── */}
      <SiteHeader sections={sections} />

      {/* Page content */}
      <div className="page-content">{children}</div>

      {/* ── Footer ── */}
      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" aria-hidden="true" width="40" height="40" style={{ borderRadius: "4px", flexShrink: 0 }} />
              <p className="footer-brand-name" style={{ margin: 0 }}>The Granite Post</p>
            </div>
            <p className="footer-tagline">
              Authoritative Zimbabwean journalism. Independent reporting and a
              free press for a free people.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="footer-col-title">{col.title}</p>
              <ul className="footer-links-list" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom-bar">
          <span>© {year} The Granite Post. All rights reserved.</span>
          <nav className="footer-legal-links" aria-label="Legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/cookies">Cookie Policy</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
