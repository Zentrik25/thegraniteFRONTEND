"use client";

/**
 * SiteNav — frosted-glass sticky primary navigation.
 * rgba(0,0,0,0.82) + backdrop-filter blur(20px).
 * Apple Blue (#0071e3) active underline; search pill input.
 */

import { useState, useEffect, useRef } from "react";
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
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function close() {
    setMenuOpen(false);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setQuery("");
    }
  }

  const navLinks = [
    { label: "Home", href: "/" },
    ...sections.map((s) => ({ label: s.name, href: `/sections/${s.slug}` })),
    { label: "Authors", href: "/authors" },
  ];

  return (
    <nav className="gp-nav" role="navigation" aria-label="Primary navigation">
      <div className="gp-nav-inner">
        {/* Hamburger (mobile only) */}
        <button
          className="gp-nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="gp-nav-drawer"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="gp-nav-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        {/* TGP — BBC-style three boxed letters, mobile only */}
        <Link href="/" className="gp-nav-wordmark" aria-label="The Granite Post — home">
          <span className="gp-nav-tgp" aria-hidden="true">
            <span>T</span><span>G</span><span>P</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="gp-nav-links" role="list">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`gp-nav-link${isActive ? " gp-nav-link--active" : ""}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop search input */}
        <form
          className="gp-nav-search-form"
          onSubmit={handleSearchSubmit}
          role="search"
          aria-label="Site search"
        >
          <input
            ref={searchRef}
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

        {/* Mobile search icon — links to /search page */}
        <Link href="/search" className="gp-nav-search-icon" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Link>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="gp-nav-overlay"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        id="gp-nav-drawer"
        className={`gp-nav-drawer${menuOpen ? " gp-nav-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Navigation menu"
      >
        <div className="gp-nav-drawer-header">
          <span className="gp-nav-drawer-title">Menu</span>
          <button
            className="gp-nav-drawer-close"
            onClick={close}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="gp-nav-drawer-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="gp-nav-drawer-link"
              onClick={close}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="gp-nav-drawer-footer">
          <Link href="/login" className="gp-nav-drawer-link" onClick={close}>
            Sign In
          </Link>
          <Link href="/subscribe" className="gp-nav-drawer-link" onClick={close}>
            Subscribe
          </Link>
        </div>
      </div>
    </nav>
  );
}
