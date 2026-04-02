import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/site/ArticleCard";
import { EmptyState } from "@/components/site/EmptyState";
import { Pagination } from "@/components/site/Pagination";
import { getCategoryDetail } from "@/lib/api/articles";
import { SITE_URL } from "@/lib/env";

export const revalidate = 120;

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

  return {
    title: data.category.name,
    description: data.category.description,
    alternates: { canonical },
    openGraph: {
      title: `${data.category.name} | The Granite Post`,
      url: canonical,
      images: data.category.og_image_url ? [data.category.og_image_url] : [],
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
          <div className="article-grid-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
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
