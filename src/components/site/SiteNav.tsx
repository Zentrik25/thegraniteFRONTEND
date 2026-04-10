"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { SectionDetail } from "@/lib/types";

interface SiteNavProps {
  sections: SectionDetail[];
}

export function SiteNav({ sections }: SiteNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  function close() {
    setMenuOpen(false);
    setOpenSection(null);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setQuery("");
    }
  }

  const homeLink = { label: "Home", href: "/", categories: [] };
  const sectionLinks = sections.map((s) => ({
    label: s.name,
    href: `/sections/${s.slug}`,
    categories: s.categories ?? [],
  }));
  const authorsLink = { label: "Authors", href: "/authors", categories: [] };
  const navLinks = [homeLink, ...sectionLinks, authorsLink];

  return (
    <nav className="gp-nav" role="navigation" aria-label="Primary navigation">
      <div className="gp-nav-inner">
        {/* Hamburger (mobile) */}
        <button
          className="gp-nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="gp-nav-drawer"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="gp-nav-bars" aria-hidden="true">
            <span /><span /><span />
          </span>
        </button>

        {/* Mobile wordmark */}
        <Link href="/" className="gp-nav-wordmark" aria-label="The Granite Post — home">
          <span className="gp-nav-tgp" aria-hidden="true">
            <span>T</span><span>G</span><span>P</span>
          </span>
        </Link>

        {/* Desktop links with dropdowns */}
        <ul className="gp-nav-links" role="list">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const hasDropdown = link.categories.length > 0;

            return (
              <li key={link.href} className={hasDropdown ? "gp-nav-item" : undefined}>
                <Link
                  href={link.href}
                  className={`gp-nav-link${isActive ? " gp-nav-link--active" : ""}`}
                >
                  {link.label}
                  {hasDropdown && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: "3px", opacity: 0.6 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </Link>

                {hasDropdown && (
                  <div className="gp-nav-dropdown" role="menu" aria-label={`${link.label} categories`}>
                    {link.categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="gp-nav-dropdown-link"
                        role="menuitem"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Desktop search */}
        <form className="gp-nav-search-form" onSubmit={handleSearchSubmit} role="search" aria-label="Site search">
          <input
            className="gp-nav-search"
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            aria-label="Search articles"
            autoComplete="off"
          />
        </form>

        {/* Mobile search icon */}
        <Link href="/search" className="gp-nav-search-icon" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Link>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="gp-nav-overlay" onClick={close} aria-hidden="true" />}

      {/* Mobile drawer */}
      <div
        id="gp-nav-drawer"
        className={`gp-nav-drawer${menuOpen ? " gp-nav-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Navigation menu"
      >
        <div className="gp-nav-drawer-header">
          <span className="gp-nav-drawer-title">Menu</span>
          <button className="gp-nav-drawer-close" onClick={close} aria-label="Close menu">✕</button>
        </div>

        <div className="gp-nav-drawer-links">
          <Link href="/" className="gp-nav-drawer-link" onClick={close}>Home</Link>

          {sectionLinks.map((link) => {
            const hasCategories = link.categories.length > 0;
            const isOpen = openSection === link.href;

            return (
              <div key={link.href} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", alignItems: "stretch" }}>
                  <Link
                    href={link.href}
                    className="gp-nav-drawer-link"
                    style={{ flex: 1, borderBottom: "none" }}
                    onClick={close}
                  >
                    {link.label}
                  </Link>
                  {hasCategories && (
                    <button
                      onClick={() => setOpenSection(isOpen ? null : link.href)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${link.label}`}
                      style={{
                        width: 44, flexShrink: 0, background: "transparent",
                        border: "none", borderLeft: "1px solid rgba(255,255,255,0.07)",
                        color: "rgba(255,255,255,0.5)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.12s",
                      }}
                    >
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {hasCategories && isOpen && (
                  <div style={{ background: "rgba(255,255,255,0.04)", paddingBottom: "0.25rem" }}>
                    {link.categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="gp-nav-drawer-link"
                        style={{
                          paddingLeft: "2rem", fontSize: "0.82rem",
                          fontWeight: 500, borderBottom: "none",
                          borderLeft: "3px solid transparent",
                          color: "rgba(255,255,255,0.65)",
                        }}
                        onClick={close}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link href="/authors" className="gp-nav-drawer-link" onClick={close}>Authors</Link>
        </div>

        <div className="gp-nav-drawer-footer">
          <Link href="/subscribe" className="gp-nav-drawer-link" onClick={close}>Subscribe</Link>
        </div>
      </div>
    </nav>
  );
}
