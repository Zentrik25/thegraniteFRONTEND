import type { Metadata } from "next";
import Link from "next/link";

import { BreakingBanner } from "@/components/site/BreakingBanner";
import { FeaturedGrid } from "@/components/site/FeaturedGrid";
import { LatestFeed } from "@/components/site/LatestFeed";
import { SectionNav } from "@/components/site/SectionNav";
import { TopStoriesGrid } from "@/components/site/TopStoriesGrid";
import { NewsletterForm } from "@/components/newsletter-form";
import { getHomepageFeed } from "@/lib/api/articles";
import { pluralize } from "@/lib/format";

export const revalidate = 60;

const HOME_TITLE = "The Granite Post — Zimbabwe's Journal of Record";
const HOME_DESCRIPTION =
  "Authoritative news and analysis from Zimbabwe. Breaking news, politics, business, technology and sport.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default async function HomePage() {
  const feed = await getHomepageFeed();

  return (
    <>
      <BreakingBanner articles={feed.breaking} />

      <main className="container" id="main-content">
        {/* API offline notice */}
        {feed.apiUnavailable && (
          <div
            className="news-section"
            style={{ borderTopColor: "var(--accent)" }}
            role="status"
          >
            <p className="kicker" style={{ marginBottom: "0.4rem" }}>
              Backend offline
            </p>
            <p className="copy">
              The frontend is running but cannot reach the API at{" "}
              <strong>http://127.0.0.1:8000</strong>. Start the Django backend
              then refresh.
            </p>
          </div>
        )}

        {/* Top Stories */}
        <section className="news-section" aria-labelledby="top-stories-label">
          <div className="news-section-head">
            <h2 className="news-section-label" id="top-stories-label">
              Top stories
            </h2>
            <Link className="news-section-more" href="/search">
              All news →
            </Link>
          </div>
          {feed.topStories.filter((s) => s.article).length > 0 ? (
            <TopStoriesGrid slots={feed.topStories} />
          ) : (
            <p className="copy">
              {feed.apiUnavailable
                ? "Stories will appear once the backend is reachable."
                : "No top stories assigned yet."}
            </p>
          )}
        </section>

        {/* Featured */}
        {feed.featured.length > 0 && (
          <section className="news-section" aria-labelledby="featured-label">
            <div className="news-section-head">
              <h2 className="news-section-label" id="featured-label">
                Featured
              </h2>
            </div>
            <FeaturedGrid articles={feed.featured} />
          </section>
        )}

        {/* Latest + Sidebar */}
        <section className="news-section" aria-labelledby="latest-label">
          <div className="content-sidebar-layout">
            {/* Latest feed */}
            <div>
              <div className="news-section-head">
                <h2 className="news-section-label" id="latest-label">
                  Latest
                </h2>
                <Link className="news-section-more" href="/search">
                  More →
                </Link>
              </div>
              <LatestFeed articles={feed.latest} limit={14} />
            </div>

            {/* Sidebar */}
            <aside aria-label="Sidebar">
              {/* Trending */}
              {feed.trending.length > 0 && (
                <div className="sidebar-widget">
                  <p className="sidebar-widget-title">Trending</p>
                  <div className="trending-list">
                    {feed.trending.slice(0, 6).map((item) => (
                      <div className="trending-item" key={item.article.slug}>
                        <span className="trending-rank" aria-hidden="true">
                          {item.rank}
                        </span>
                        <div className="trending-title">
                          <Link href={`/articles/${item.article.slug}`}>
                            {item.article.title}
                          </Link>
                          <p className="meta" style={{ fontSize: "0.68rem", marginTop: "0.15rem" }}>
                            {pluralize(item.view_count, "view")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <NewsletterForm source="homepage" />
            </aside>
          </div>
        </section>

        {/* Sections navigation */}
        {feed.sections.length > 0 && (
          <section className="news-section" aria-labelledby="sections-label">
            <div className="news-section-head">
              <h2 className="news-section-label" id="sections-label">
                Sections
              </h2>
            </div>
            <SectionNav sections={feed.sections} />
          </section>
        )}
      </main>
    </>
  );
}
