import type { Metadata } from "next";

import { BreakingBanner } from "@/components/site/BreakingBanner";
import { HeroZone } from "@/components/site/HeroZone";
import { HomeTopStoriesBlock } from "@/components/site/HomeTopStoriesBlock";
import { HomeTopStories } from "@/components/site/HomeTopStories";
import { HomeLatestSidebar } from "@/components/site/HomeLatestSidebar";
import { HomeSections } from "@/components/site/HomeSections";
import { HomeNewsletterBand } from "@/components/site/HomeNewsletterBand";
import { getHomepageFeed } from "@/lib/api/articles";
import type { ArticleSummary, SectionDetail, TopStorySlot } from "@/lib/types";

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
  const feed = await getHomepageFeed();

  // ── Deduplication ─────────────────────────────────────────────────────────
  // Each article slug is tracked globally. Zones are allocated in priority order:
  // Hero → Top Stories → More Stories → Latest → Section blocks
  const seen = new Set<string>();

  function pickArticles(pool: ArticleSummary[], max: number): ArticleSummary[] {
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

  function pickSlots(pool: TopStorySlot[], max: number): TopStorySlot[] {
    const result: TopStorySlot[] = [];
    for (const s of pool) {
      if (result.length >= max) break;
      if (!s.article) continue;
      if (!seen.has(s.article.slug)) {
        seen.add(s.article.slug);
        result.push(s);
      }
    }
    return result;
  }

  function dedupeSection(section: SectionDetail): SectionDetail {
    const hero =
      section.hero_article && !seen.has(section.hero_article.slug)
        ? (seen.add(section.hero_article.slug), section.hero_article)
        : null;
    const articles = section.articles.filter((a) => {
      if (seen.has(a.slug)) return false;
      seen.add(a.slug);
      return true;
    });
    return { ...section, hero_article: hero, articles };
  }

  // 1. Hero — up to 4 featured articles
  const heroArticles = pickArticles(feed.featured, 4);

  // 2. Top Stories — backend-ranked, up to 5, no repeats from hero
  const topStorySlots = pickSlots(feed.topStories, 5);

  // 3. More stories row — next 4 featured not yet shown
  const moreStories = pickArticles(feed.featured, 4);

  // 4. Latest feed — exclude anything already shown
  const latestArticles = pickArticles(feed.latest, 10);

  // 5. Section blocks — filter out seen articles from each section
  const sectionDetails = feed.sectionDetails
    .map(dedupeSection)
    .filter((s) => s.hero_article !== null || s.articles.length > 0);

  return (
    <>
      <BreakingBanner articles={feed.breaking} />

      <div className="hp-page-wrap">

        {feed.apiUnavailable && (
          <div className="hp-offline-notice" role="status">
            <p className="hp-offline-label">Service Under Maintenance</p>
            <p className="hp-offline-body">
              We are currently unavailable. Thank you for your support — we will be back shortly.
            </p>
          </div>
        )}

        {heroArticles.length > 0 && (
          <HeroZone articles={heroArticles} />
        )}

        {topStorySlots.length > 0 && (
          <HomeTopStoriesBlock slots={topStorySlots} />
        )}

        {moreStories.length > 0 && (
          <HomeTopStories articles={moreStories} />
        )}

        <HomeLatestSidebar articles={latestArticles} trending={feed.trending} />

        {sectionDetails.length > 0 && (
          <HomeSections sections={sectionDetails} />
        )}

      </div>

      <HomeNewsletterBand />
    </>
  );
}
