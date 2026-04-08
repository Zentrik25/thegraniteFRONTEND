/**
 * TickerBar — pure-black scrolling breaking-news bar.
 * Server component; fetches directly so it can live in the shell
 * and appear on every public page without lifting state.
 */

import Link from "next/link";

interface BreakingItem {
  slug: string;
  title: string;
  category?: { name: string; slug: string } | null;
}

async function fetchBreaking(): Promise<BreakingItem[]> {
  const base = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${base}/api/v1/articles/breaking/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: { results?: BreakingItem[] } = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function TickerBar() {
  const articles = await fetchBreaking();
  if (articles.length === 0) return null;

  // Duplicate items so the CSS translateX(-50%) loop looks seamless
  const doubled = [...articles, ...articles];

  return (
    <div className="gp-ticker" role="marquee" aria-label="Breaking news ticker">
      <div className="gp-ticker-inner">
        <span className="gp-ticker-label" aria-hidden="true">Breaking</span>
        <div className="gp-ticker-track-wrap" aria-live="off">
          <div className="gp-ticker-track">
            {doubled.map((a, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
                {a.category && (
                  <span className="gp-ticker-dot" aria-hidden="true" style={{ marginRight: "0.5rem", color: "var(--apple-bright)" }}>
                    {a.category.name}
                  </span>
                )}
                <Link href={`/articles/${a.slug}`} className="gp-ticker-item">
                  {a.title}
                </Link>
                <span className="gp-ticker-dot" aria-hidden="true" style={{ padding: "0 0.75rem" }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
