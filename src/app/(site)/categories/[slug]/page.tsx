import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/site/EmptyState";
import { Pagination } from "@/components/site/Pagination";
import { getCategoryDetail } from "@/lib/api/articles";
import { SITE_URL } from "@/lib/env";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const data = await getCategoryDetail(slug);
  if (!data) return { title: "Category not found" };

  // Page 1 omits the query param; subsequent pages are self-canonical
  const canonical =
    page === 1
      ? `${SITE_URL}/categories/${slug}`
      : `${SITE_URL}/categories/${slug}?page=${page}`;

  const description =
    data.category.description ||
    `Latest ${data.category.name} news from Zimbabwe — The Granite Post`;

  return {
    title: data.category.name,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${data.category.name} — The Granite Post`,
      description,
      url: canonical,
      siteName: "The Granite Post",
      locale: "en_ZW",
      images: data.category.og_image_url
        ? [{ url: data.category.og_image_url, width: 1200, height: 630 }]
        : [{ url: "https://www.thegranite.co.zw/og-default.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      site: "@GranitePost",
      title: `${data.category.name} — The Granite Post`,
      description,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const data = await getCategoryDetail(slug, page);
  if (!data) notFound();

  const { category, articles, total_pages, current_page, count } = data;

  return (
    <main className="container" id="main-content">
      <header className="page-header">
        <p className="page-header-eyebrow">Category</p>
        <h1 className="page-header-title">{category.name}</h1>
        {category.description && (
          <p className="page-header-desc">{category.description}</p>
        )}
        <p className="page-header-count">{count} article{count !== 1 ? "s" : ""}</p>
      </header>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          copy="Check back soon — stories in this category will appear here."
          action={{ label: "Browse all news", href: "/search" }}
        />
      ) : (
        <>
          <ol className="section-article-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {articles.map((article) => {
              const imgSrc = article.image_url ? mediaProxyPath(article.image_url) : null;
              const ago = timeAgo(article.published_at);
              return (
                <li key={article.slug} className="section-article-row">
                  <Link href={`/articles/${article.slug}`} className="section-article-link">
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
                    <div className="section-article-body">
                      <h2 className="section-article-title">{article.title}</h2>
                      {ago && <span className="section-article-time">{ago}</span>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Pagination
            currentPage={current_page}
            totalPages={total_pages}
            buildHref={(p) => `/categories/${slug}?page=${p}`}
          />
        </>
      )}
    </main>
  );
}
