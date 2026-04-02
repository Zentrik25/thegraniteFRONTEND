import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ArticleCard } from "@/components/site/ArticleCard";
import { EmptyState } from "@/components/site/EmptyState";
import { getSectionDetail } from "@/lib/api/articles";
import { SITE_URL } from "@/lib/env";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = await getSectionDetail(slug);
  if (!section) return { title: "Section not found" };

  const canonical = `${SITE_URL}/sections/${slug}`;

  return {
    title: section.name,
    description: section.description,
    alternates: { canonical },
    openGraph: {
      title: `${section.name} | The Granite Post`,
      url: canonical,
      images: section.og_image_url ? [section.og_image_url] : [],
    },
  };
}

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  const section = await getSectionDetail(slug);

  if (!section) notFound();

  const heroArticle = section.hero_article;
  const remainingArticles = section.articles.filter(
    (a) => a.slug !== heroArticle?.slug,
  );

  return (
    <main className="container" id="main-content">
      <header className="page-header">
        <p className="page-header-eyebrow">Section</p>
        <h1 className="page-header-title">{section.name}</h1>
        {section.description && (
          <p className="page-header-desc">{section.description}</p>
        )}
        {section.categories.length > 0 && (
          <nav
            aria-label="Section categories"
            style={{
              display: "flex",
              gap: "0.35rem",
              flexWrap: "wrap",
              marginTop: "0.75rem",
            }}
          >
            {section.categories.map((cat) => (
              <Link key={cat.slug} className="tag-chip" href={`/categories/${cat.slug}`}>
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Hero article */}
      {heroArticle && (
        <section className="news-section" aria-labelledby="hero-label">
          <div className="news-section-head">
            <h2 className="news-section-label" id="hero-label">
              Lead story
            </h2>
          </div>
          <div
            className="top-stories-layout"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <div className="lead-story-cell">
              {heroArticle.image_url ? (
                <div className="lead-story-img" style={{ position: "relative" }}>
                  <Image
                    src={heroArticle.image_url}
                    alt={heroArticle.image_alt || heroArticle.title}
                    fill
                    priority
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 870px"
                  />
                </div>
              ) : (
                <div className="lead-img-placeholder" aria-hidden="true" />
              )}
              {heroArticle.category && (
                <p className="lead-story-kicker">{heroArticle.category.name}</p>
              )}
              <h2 className="lead-story-title">
                <Link href={`/articles/${heroArticle.slug}`}>{heroArticle.title}</Link>
              </h2>
              {heroArticle.excerpt && (
                <p className="lead-story-excerpt">{heroArticle.excerpt}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Rest of articles */}
      {remainingArticles.length > 0 ? (
        <section className="news-section" aria-labelledby="section-articles-label">
          <div className="news-section-head">
            <h2 className="news-section-label" id="section-articles-label">
              Stories
            </h2>
          </div>
          <div className="article-grid-3">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : (
        !heroArticle && (
          <EmptyState
            title="No stories in this section yet"
            copy="Check back soon — the editorial team is working on it."
            action={{ label: "Browse all news", href: "/search" }}
          />
        )
      )}
    </main>
  );
}
