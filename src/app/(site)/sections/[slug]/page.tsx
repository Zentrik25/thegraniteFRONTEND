import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/site/EmptyState";
import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleSummary, SectionDetail } from "@/lib/types";
import { SITE_URL } from "@/lib/env";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatDistanceToNow } from "date-fns";

export const revalidate = 30;

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

  // Fetch section info and published articles in parallel.
  // Articles are fetched directly with section + status filters so only
  // published articles appear — preventing 401s from draft articles slipping
  // through the section's article list.
  const [sectionRes, articlesRes] = await Promise.all([
    safeApiFetch<SectionDetail>(`/api/v1/sections/${slug}/`, {
      next: { revalidate: 30 },
    }),
    safeApiFetch<ApiListResponse<ArticleSummary> | ArticleSummary[]>(
      `/api/v1/articles/?section=${slug}&status=published&page=${page}&page_size=${pageSize}&ordering=-published_at`,
      { next: { revalidate: 30 } },
    ),
  ]);

  if (!sectionRes.data) notFound();

  const section = sectionRes.data;

  // Prefer the paginated published-only list; fall back to SectionDetail.articles
  // filtered to published status if the query param isn't supported by the backend.
  let articles: ArticleSummary[] = [];
  let totalPages = 1;
  let totalCount = 0;

  if (articlesRes.data) {
    const raw = articlesRes.data;
    if (Array.isArray(raw)) {
      articles = raw.filter((a) => !a.status || a.status === "published");
    } else {
      articles = (raw.results ?? []).filter((a) => !a.status || a.status === "published");
      totalCount = raw.count ?? 0;
      totalPages = Math.ceil(totalCount / pageSize) || 1;
    }
  } else {
    // Fallback: use articles embedded in section detail, published only
    articles = section.articles.filter((a) => !a.status || a.status === "published");
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
