"use client";

/**
 * HeroCarousel — full-width auto-swiping hero for the homepage.
 * Cycles through featured articles every 5 s; pauses on hover.
 * When articles is empty, renders a static branded fallback.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HeroCarouselProps {
  articles: ArticleSummary[];
}

const INTERVAL_MS = 5000;

export function HeroCarousel({ articles }: HeroCarouselProps) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = articles.length;

  const goTo = useCallback(
    (index: number) => {
      setVisible(false);
      setTimeout(() => {
        setActive(index);
        setVisible(true);
      }, 250);
    },
    [],
  );

  const next = useCallback(() => {
    goTo((active + 1) % count);
  }, [active, count, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + count) % count);
  }, [active, count, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, paused, count, next]);

  // Empty state — branded fallback hero
  if (count === 0) {
    return (
      <div className="gp-hero-carousel gp-hero-carousel--empty">
        <div className="gp-hero-fallback">
          <div className="gp-hero-overlay" aria-hidden="true" />
          <div className="gp-hero-content">
            <div className="gp-container">
              <p className="gp-hero-cat">Zimbabwe&apos;s Journal of Record</p>
              <h2 className="gp-hero-headline">The Granite Post</h2>
              <p className="gp-hero-excerpt">
                Authoritative news and analysis from Zimbabwe — breaking news,
                politics, business, technology and sport.
              </p>
              <Link href="/search" className="gp-hero-cta">
                Browse all stories →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const article = articles[active];

  return (
    <div
      className="gp-hero-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured stories"
      aria-roledescription="carousel"
    >
      {/* ── Slide ── */}
      <div
        className="gp-hero-slide"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 0.25s ease",
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {/* Background image */}
        <div className="gp-hero-img-wrap">
          {article.image_url ? (
            <Image
              src={mediaProxyPath(article.image_url) ?? ""}
              alt={article.image_alt || article.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="gp-hero-img-ph" aria-hidden="true" />
          )}
          {/* Gradient overlay so text is readable over any photo */}
          <div className="gp-hero-overlay" aria-hidden="true" />
        </div>

        {/* Category badge — top left */}
        {(article.is_breaking || article.category) && (
          <span className="gp-hero-cat">
            {article.is_breaking ? "Breaking" : article.category?.name}
          </span>
        )}

        {/* Text content — bottom */}
        <div className="gp-hero-content">
          <div className="gp-container">
            <h2 className="gp-hero-headline">
              <Link href={`/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h2>

            <p className="gp-hero-meta">
              {article.author_name && (
                <span>{article.author_name}</span>
              )}
              {article.author_name && article.published_at && (
                <span aria-hidden="true"> · </span>
              )}
              {article.published_at && (
                <span>{formatRelativeTime(article.published_at)}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Controls (only when more than one article) ── */}
      {count > 1 && (
        <>
          <button
            className="gp-hero-arrow gp-hero-arrow--prev"
            onClick={prev}
            aria-label="Previous featured story"
            type="button"
          >
            &#8249;
          </button>

          <button
            className="gp-hero-arrow gp-hero-arrow--next"
            onClick={next}
            aria-label="Next featured story"
            type="button"
          >
            &#8250;
          </button>

          <div
            className="gp-hero-dots"
            role="tablist"
            aria-label="Featured stories navigation"
          >
            {articles.map((a, i) => (
              <button
                key={a.slug}
                role="tab"
                type="button"
                aria-selected={i === active}
                aria-label={`Story ${i + 1} of ${count}: ${a.title}`}
                className={`gp-hero-dot${i === active ? " gp-hero-dot--active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
