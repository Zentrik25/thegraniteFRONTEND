/**
 * NewsSiteShell — public (site) shell.
 *
 * Replaces the old PageShell for the (site) route group.
 * Loads Playfair Display + Inter via next/font/google and injects
 * them as CSS variables on the root wrapper so all child components
 * can reference --font-playfair and --font-inter.
 *
 * Chrome order (top → bottom):
 *   1. TickerBar   — scrolling breaking-news (scrolls away)
 *   2. Masthead    — nameplate + date + pill CTAs (scrolls away)
 *   3. SiteNav     — frosted-glass sticky nav
 *   4. {children}  — page content
 *   5. Footer      — black, Apple Blue top border, 4-col grid
 */

import Link from "next/link";
import { Playfair_Display, Inter } from "next/font/google";

import { getSectionDetails } from "@/lib/api/articles";
import { TickerBar } from "@/components/site/TickerBar";
import { Masthead } from "@/components/site/Masthead";
import { SiteNav } from "@/components/site/SiteNav";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const FOOTER_COLS = [
  {
    title: "Coverage",
    links: [
      { label: "Politics", href: "/sections/politics" },
      { label: "Business", href: "/sections/business" },
      { label: "Technology", href: "/sections/technology" },
      { label: "Sport", href: "/sections/sport" },
      { label: "Opinion", href: "/sections/opinion" },
      { label: "Africa", href: "/sections/africa" },
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
  {
    title: "Follow",
    links: [
      { label: "Twitter / X", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "WhatsApp Channel", href: "#" },
      { label: "RSS Feed", href: "/feed.xml" },
    ],
  },
];

export async function NewsSiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = await getSectionDetails(true);
  const year = new Date().getFullYear();

  return (
    <div className={`gp-shell ${playfair.variable} ${inter.variable}`}>
      {/* ── Top chrome (scrolls away) ── */}
      <TickerBar />
      <Masthead />

      {/* ── Sticky frosted nav ── */}
      <SiteNav sections={sections} />

      {/* ── Page content ── */}
      <div className="gp-page-content">{children}</div>

      {/* ── Footer ── */}
      <footer className="gp-footer" role="contentinfo">
        <div className="gp-footer-inner">
          {/* Brand column */}
          <div>
            <p className="gp-footer-nameplate">
              The Granite <em>Post</em>
            </p>
            <p className="gp-footer-tagline">
              Independent Zimbabwean journalism. A free press for a free
              people.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="gp-footer-col-title">{col.title}</p>
              <ul className="gp-footer-links" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="gp-footer-bottom">
          <span>© {year} The Granite Post. All rights reserved.</span>
          <nav className="gp-footer-legal" aria-label="Legal links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
