import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/site/EmptyState";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleSummary, SectionDetail } from "@/lib/types";
import { SITE_URL } from "@/lib/env";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await safeApiFetch<SectionDetail>(`/api/v1/sections/${slug}/`, {
    next: { revalidate: 60 },
  });
  const section = res.data;
  if (!section) return { title: "Section not found" };

  const canonical = `${SITE_URL}/sections/${slug}`;
  const description =
    section.description ||
    `Latest ${section.name} news and analysis from Zimbabwe — The Granite Post`;

  return {
    title: section.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${section.name} — The Granite Post`,
      description,
      url: canonical,
      siteName: "The Granite Post",
      locale: "en_ZW",
      images: section.og_image_url
        ? [{ url: section.og_image_url, width: 1200, height: 630 }]
        : [{ url: "https://www.thegranite.co.zw/og-default.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      site: "@GranitePost",
      title: `${section.name} — The Granite Post`,
      description,
    },
  };
}

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const pageSize = 20;

  // Fetch section info first to get the list of categories.
  const sectionRes = await safeApiFetch<SectionDetail>(`/api/v1/sections/${slug}/`, {
    cache: "no-store",
  });

  if (!sectionRes.data) notFound();

  const section = sectionRes.data;

  // Fetch articles per category in the section — this uses the same endpoint
  // that works when clicking a category directly. Merge, deduplicate, and sort.
  let articles: ArticleSummary[] = [];
  let totalCount = 0;
  let totalPages = 1;

  if (section.categories.length > 0) {
    const categoryResults = await Promise.all(
      section.categories.map((cat) =>
        safeApiFetch<ApiListResponse<ArticleSummary> | ArticleSummary[]>(
          `/api/v1/articles/?category=${cat.slug}&status=published&page=${page}&page_size=${pageSize}&ordering=-published_at`,
          { cache: "no-store" },
        )
      )
    );

    const seen = new Set<string>();
    const merged: ArticleSummary[] = [];

    for (const res of categoryResults) {
      if (!res.data) continue;
      const list = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      for (const a of list) {
        if (!seen.has(a.slug)) {
          seen.add(a.slug);
          merged.push(a);
        }
      }
      // Sum up counts for display
      if (!Array.isArray(res.data) && res.data.count) {
        totalCount += res.data.count;
      }
    }

    // Sort merged list by published_at descending
    merged.sort((a, b) => {
      const da = a.published_at ? new Date(a.published_at).getTime() : 0;
      const db = b.published_at ? new Date(b.published_at).getTime() : 0;
      return db - da;
    });

    articles = merged;
    totalPages = Math.ceil(totalCount / pageSize) || 1;
  } else {
    // No categories on section — fall back to articles embedded in the section detail
    articles = section.articles.filter((a) => !a.status || a.status === "published");
    totalCount = articles.length;
  }

  const hasCategories = section.categories.length > 0;

  return (
    <main className="container" id="main-content" style={{ maxWidth: "900px" }}>
      {/* Section header */}
      <header className="page-header">
        <p className="page-header-eyebrow">Section</p>
        <h1 className="page-header-title">{section.name}</h1>
        {section.description && (
          <p className="page-header-desc">{section.description}</p>
        )}
        {hasCategories && (
          <nav
            aria-label="Section categories"
            style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.75rem" }}
          >
            {section.categories.map((cat) => (
              <Link key={cat.slug} className="tag-chip" href={`/categories/${cat.slug}`}>
                {cat.name}
              </Link>
            ))}
          </nav>
        )}
        {totalCount > 0 && (
          <p className="page-header-count">{totalCount.toLocaleString()} articles</p>
        )}
      </header>

      {/* Article list */}
      {articles.length > 0 ? (
        <section aria-label={`${section.name} articles`}>
          <ol className="section-article-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {articles.map((article) => {
              const imgSrc = article.image_url ? mediaProxyPath(article.image_url) : null;
              const ago = timeAgo(article.published_at);

              return (
                <li key={article.slug} className="section-article-row">
                  <Link href={`/articles/${article.slug}`} className="section-article-link">
                    {/* Thumbnail */}
                    <div className="section-article-thumb">
                      {imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgSrc}
                          alt={article.image_alt || article.title}
                          className="section-article-img"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="section-article-img-ph" aria-hidden="true" />
                      )}
                    </div>

                    {/* Text */}
                    <div className="section-article-body">
                      {article.category && (
                        <span className="section-article-cat">{article.category.name}</span>
                      )}
                      <h2 className="section-article-title">{article.title}</h2>
                      {ago && (
                        <span className="section-article-time">{ago}</span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Page navigation"
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                padding: "2rem 0 1rem",
                flexWrap: "wrap",
              }}
            >
              {page > 1 && (
                <Link
                  href={`/sections/${slug}?page=${page - 1}`}
                  className="tag-chip"
                  style={{ fontWeight: 600 }}
                >
                  ← Previous
                </Link>
              )}
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 0.5rem",
                }}
              >
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/sections/${slug}?page=${page + 1}`}
                  className="tag-chip"
                  style={{ fontWeight: 600 }}
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </section>
      ) : (
        <EmptyState
          title="No stories in this section yet"
          copy="Check back soon — the editorial team is working on it."
          action={{ label: "Browse all news", href: "/search" }}
        />
      )}
    </main>
  );
}
