"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import type { SectionDetail } from "@/lib/types";

interface SiteHeaderProps {
  sections: SectionDetail[];
}

export function SiteHeader({ sections }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function close() {
    setMenuOpen(false);
    setOpenSection(null);
  }

  function toggleSection(slug: string) {
    setOpenSection((prev) => (prev === slug ? null : slug));
  }

  return (
    <header className="bbc-header" role="banner">
      {/* Brand bar */}
      <div className="bbc-brand-bar">
        <div className="bbc-brand-inner">
          <button
            className="bbc-hamburger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="bbc-nav-drawer"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="bbc-hamburger-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <Link className="bbc-wordmark" href="/" aria-label="The Granite Post — home">
            The Granite <em>Post</em>
          </Link>

          <nav className="bbc-actions" aria-label="Primary actions">
            <Link className="bbc-action-link" href="/search">Search</Link>
            <Link className="bbc-action-link" href="/login">Sign In</Link>
            <Link className="bbc-btn-subscribe" href="/subscribe">Subscribe</Link>
          </nav>

          <Link className="bbc-mobile-search" href="/search" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Section nav — desktop only */}
      <div className="bbc-section-nav-wrap" aria-label="Sections navigation">
        <nav className="bbc-section-nav">
          <Link className="bbc-section-link" href="/">Home</Link>
          {sections.map((s) => (
            <Link key={s.slug} className="bbc-section-link" href={`/sections/${s.slug}`}>
              {s.name}
            </Link>
          ))}
          <Link className="bbc-section-link" href="/authors">Authors</Link>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div className="bbc-drawer-overlay" onClick={close} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div
        id="bbc-nav-drawer"
        className={`bbc-drawer${menuOpen ? " bbc-drawer--open" : ""}`}
        aria-hidden={!menuOpen}
        aria-label="Navigation menu"
      >
        <div className="bbc-drawer-header">
          <span className="bbc-drawer-title">Menu</span>
          <button className="bbc-drawer-close" onClick={close} aria-label="Close menu">✕</button>
        </div>

        <nav aria-label="Main navigation">
          <Link className="bbc-drawer-link" href="/" onClick={close}>Home</Link>

          {sections.map((s) => {
            const hasCategories = s.categories && s.categories.length > 0;
            const isOpen = openSection === s.slug;

            return (
              <div key={s.slug} className="bbc-drawer-section-group">
                {/* Section row */}
                <div className="bbc-drawer-section-row">
                  <Link
                    className="bbc-drawer-link bbc-drawer-section-link"
                    href={`/sections/${s.slug}`}
                    onClick={close}
                  >
                    {s.name}
                  </Link>
                  {hasCategories && (
                    <button
                      className={`bbc-drawer-chevron${isOpen ? " bbc-drawer-chevron--open" : ""}`}
                      onClick={() => toggleSection(s.slug)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Collapse" : "Expand"} ${s.name} categories`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Category sub-items */}
                {hasCategories && isOpen && (
                  <div className="bbc-drawer-categories">
                    {s.categories.map((c) => (
                      <Link
                        key={c.slug}
                        className="bbc-drawer-category-link"
                        href={`/categories/${c.slug}`}
                        onClick={close}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link className="bbc-drawer-link" href="/authors" onClick={close}>Authors</Link>
        </nav>

        <div className="bbc-drawer-footer">
          <Link className="bbc-drawer-link" href="/search" onClick={close}>Search</Link>
          <Link className="bbc-drawer-link" href="/login" onClick={close}>Sign In</Link>
          <Link className="bbc-drawer-link" href="/subscribe" onClick={close}>Subscribe</Link>
        </div>
      </div>
    </header>
  );
}
