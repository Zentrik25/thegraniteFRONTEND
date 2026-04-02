import type { Metadata } from "next";

import { BreakingBanner } from "@/components/site/BreakingBanner";
import { HeroZone } from "@/components/site/HeroZone";
import { HomeTopStories } from "@/components/site/HomeTopStories";
import { HomeLatestSidebar } from "@/components/site/HomeLatestSidebar";
import { HomeSections } from "@/components/site/HomeSections";
import { HomeNewsletterBand } from "@/components/site/HomeNewsletterBand";
import { getHomepageFeed } from "@/lib/api/articles";

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

  // Hero: top 4 ranked slots
  const heroSlots = feed.topStories.slice(0, 4);

  // "More stories" row: slots 4–7, fallback to featured
  const moreStories =
    feed.topStories.slice(4, 8).filter((s) => s.article !== null).length >= 2
      ? feed.topStories.slice(4, 8).map((s) => s.article!)
      : feed.featured.slice(0, 4);

  return (
    <>
      {/* Breaking strip */}
      <BreakingBanner articles={feed.breaking} />

      {/* Single centered page wrapper — consistent 1rem side padding, max 1200px */}
      <div className="hp-page-wrap">

        {/* Backend offline notice */}
        {feed.apiUnavailable && (
          <div className="hp-offline-notice" role="status">
            <p className="hp-offline-label">Backend offline</p>
            <p className="hp-offline-body">
              Cannot reach the API at <strong>http://127.0.0.1:8000</strong>. Start the Django backend then refresh.
            </p>
          </div>
        )}

        {/* Hero zone: lead + secondaries */}
        {heroSlots.some((s) => s.article !== null) && (
          <HeroZone slots={heroSlots} />
        )}

        {/* More stories row */}
        {moreStories.length > 0 && (
          <HomeTopStories articles={moreStories} />
        )}

        {/* Latest + sidebar */}
        <HomeLatestSidebar articles={feed.latest} trending={feed.trending} />

        {/* Section blocks */}
        {feed.sectionDetails.length > 0 && (
          <HomeSections sections={feed.sectionDetails} />
        )}

      </div>

      {/* Newsletter band — full-width with its own inner centering */}
      <HomeNewsletterBand />
    </>
  );
}
