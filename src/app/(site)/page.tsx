import type { Metadata } from "next";

import { getHomepageFeed } from "@/lib/api/articles";
import { safeApiFetch } from "@/lib/api/fetcher";
import type {
  ArticleSummary,
  CategoryDetailResponse,
  SectionDetail,
} from "@/lib/types";

import { HeroCarousel } from "@/components/site/HeroCarousel";
import { HomeTopStoriesBlock } from "@/components/site/HomeTopStoriesBlock";
import { HomeNewsGrid } from "@/components/site/HomeNewsGrid";
import { HomeMainSidebar } from "@/components/site/HomeMainSidebar";
import { CategorySection } from "@/components/site/CategorySection";
import { HomeAfricaBand } from "@/components/site/HomeAfricaBand";
import { HomeOpinionRow } from "@/components/site/HomeOpinionRow";
import { HomeNewsletterBand } from "@/components/site/HomeNewsletterBand";

export const revalidate = 60;

const TITLE = "The Granite Post — Zimbabwe's Journal of Record";
const DESCRIPTION =
  "Authoritative news and analysis from Zimbabwe. Breaking news, politics, business, technology and sport.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default async function HomePage() {
  // ── Parallel data fetching ─────────────────────────────────────────────────
  // All fetches fire simultaneously; category fetches use the CategoryDetailResponse
  // endpoint: GET /api/v1/categories/<slug>/?page_size=3 → { category, articles[] }
  const [
    feed,
    politicsRes,
    businessRes,
    technologyRes,
    crimeRes,
  ] = await Promise.all([
    getHomepageFeed(),
    safeApiFetch<CategoryDetailResponse>(
      "/api/v1/categories/politics/?page_size=3",
      { next: { revalidate: 120 } },
    ),
    safeApiFetch<CategoryDetailResponse>(
      "/api/v1/categories/business/?page_size=3",
      { next: { revalidate: 120 } },
    ),
    safeApiFetch<CategoryDetailResponse>(
      "/api/v1/categories/technology/?page_size=3",
      { next: { revalidate: 120 } },
    ),
    safeApiFetch<CategoryDetailResponse>(
      "/api/v1/categories/crime-courts/?page_size=3",
      { next: { revalidate: 120 } },
    ),
  ]);

  // ── Deduplication ─────────────────────────────────────────────────────────
  // `seen` is the single source of truth — every slug added here is never shown again.
  const seen = new Set<string>();

  /** Take up to `max` articles from `pool`, skipping any slug already in `seen`. */
  function pick(pool: ArticleSummary[], max: number): ArticleSummary[] {
    const result: ArticleSummary[] = [];
    for (const a of pool) {
      if (result.length >= max) break;
      if (!seen.has(a.slug)) {
        seen.add(a.slug);
        result.push(a);
      }
    }
    return result;
  }

  /** Filter an arbitrary pool, removing seen slugs and registering each kept slug. */
  function dedupePool(pool: ArticleSummary[]): ArticleSummary[] {
    return pool.filter((a) => {
      if (seen.has(a.slug)) return false;
      seen.add(a.slug);
      return true;
    });
  }

  function dedupeSection(section: SectionDetail): SectionDetail {
    const hero =
      section.hero_article && !seen.has(section.hero_article.slug)
        ? (seen.add(section.hero_article.slug), section.hero_article)
        : null;
    const articles = dedupePool(section.articles);
    return { ...section, hero_article: hero, articles };
  }

  // ── Zone allocation ────────────────────────────────────────────────────────

  // 1. Hero carousel — all featured articles are reserved for the carousel
  feed.featured.forEach((a) => seen.add(a.slug));

  // 2. Top stories — reserve curated top-story slugs before latest grid picks
  for (const s of feed.topStories) {
    if (s.article) seen.add(s.article.slug);
  }

  // 3. News grid — latest articles (up to 9, after dedup)
  const gridArticles = pick(feed.latest, 9);

  // 4. Category sections — deduplicated AFTER lead/secondaries/grid are registered
  //    Runs in declaration order so Politics gets first pick, then Business, etc.
  const politicsArticles   = dedupePool(politicsRes.data?.articles   ?? []);
  const businessArticles   = dedupePool(businessRes.data?.articles   ?? []);
  const technologyArticles = dedupePool(technologyRes.data?.articles ?? []);
  const crimeArticles      = dedupePool(crimeRes.data?.articles      ?? []);

  // 5. Sections (deduplicated)
  const sectionDetails = feed.sectionDetails.map(dedupeSection);

  const africaSection =
    sectionDetails.find((s) => s.slug === "africa") ?? null;

  const opinionSection =
    sectionDetails.find((s) => s.slug === "opinion") ?? null;

  return (
    <div className="gp-hp-wrap">

      {/* Maintenance banner */}
      {feed.apiUnavailable && (
        <div className="gp-container">
          <div className="gp-offline-notice" role="status">
            <p className="gp-offline-label">Service Under Maintenance</p>
            <p className="gp-offline-body">
              We are currently unavailable. Thank you for your support — we
              will be back shortly.
            </p>
          </div>
        </div>
      )}

      {/* ── 1. Hero carousel + sidebar (sidebar desktop-only here) ── */}
      <div className="gp-container">
        <div className="gp-hero-zone">
          <HeroCarousel articles={feed.featured} />
          <aside className="gp-hero-sidebar-desktop" aria-label="Sidebar">
            <HomeMainSidebar trending={feed.trending} />
          </aside>
        </div>
      </div>

      {/* ── 2. Top stories — curator-ranked slots ── */}
      {feed.topStories.length > 0 && (
        <div className="gp-container">
          <HomeTopStoriesBlock slots={feed.topStories} />
        </div>
      )}

      {/* ── 3. Latest news grid ── */}
      <div className="gp-container">
        <HomeNewsGrid articles={gridArticles} />
      </div>

      {/* ── 4. Politics ── */}
      <CategorySection
        title="Politics"
        slug="politics"
        articles={politicsArticles}
      />

      {/* ── 5. Business ── */}
      <CategorySection
        title="Business"
        slug="business"
        articles={businessArticles}
      />

      {/* ── 6. Technology ── */}
      <CategorySection
        title="Technology"
        slug="technology"
        articles={technologyArticles}
      />

      {/* ── 7. Crime & Courts ── */}
      <CategorySection
        title="Crime & Courts"
        slug="crime-courts"
        articles={crimeArticles}
      />

      {/* ── Mobile sidebar — Most Read + Newsletter, after categories ── */}
      <div className="gp-container gp-hero-sidebar-mobile">
        <HomeMainSidebar trending={feed.trending} />
      </div>

      {/* ── 8. Africa dark band — full-width, 4 dark cards ── */}
      {africaSection && <HomeAfricaBand section={africaSection} />}

      {/* ── 9. Opinion row — 3 cards on #f5f5f7 ── */}
      {opinionSection && <HomeOpinionRow section={opinionSection} />}

      {/* ── 10. Newsletter band ── */}
      <HomeNewsletterBand />

    </div>
  );
}
