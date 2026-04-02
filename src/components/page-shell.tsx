import Link from "next/link";

import { getSections } from "@/lib/api/articles";

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
  const sections = await getSections(true);
  const year = new Date().getFullYear();

  return (
    <div className="shell">
      {/* ── Sticky masthead ── */}
      <header className="masthead-wrap" role="banner">
        {/* Utility bar */}
        <div className="header-utility">
          <div className="header-utility-inner">
            <span>The Granite Post — Zimbabwe&apos;s journal of record</span>
            <div className="header-utility-links">
              <Link href="/search">Search</Link>
              <Link href="/login">Sign In</Link>
              <Link href="/subscribe">Subscribe</Link>
            </div>
          </div>
        </div>

        {/* Brand row */}
        <div className="masthead-brand-row">
          <Link
            className="masthead-wordmark"
            href="/"
            aria-label="The Granite Post — home"
          >
            The Granite <em>Post</em>
          </Link>
          <nav className="masthead-actions" aria-label="Primary actions">
            <Link className="btn-ghost" href="/search">
              Search
            </Link>
            <Link className="btn-ghost" href="/login">
              Sign In
            </Link>
            <Link className="btn-primary btn-sm" href="/subscribe">
              Subscribe
            </Link>
          </nav>
        </div>

        {/* Section navigation */}
        {sections.length > 0 && (
          <div className="nav-strip-wrap">
            <nav className="nav-sections-strip" aria-label="Sections">
              <Link className="nav-section-link" href="/">
                Home
              </Link>
              {sections.map((s) => (
                <Link
                  key={s.slug}
                  className="nav-section-link"
                  href={`/sections/${s.slug}`}
                >
                  {s.name}
                </Link>
              ))}
              <Link className="nav-section-link" href="/authors">
                Authors
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Page content */}
      <div className="page-content">{children}</div>

      {/* ── Footer ── */}
      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-grid">
          <div>
            <p className="footer-brand-name">The Granite Post</p>
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
