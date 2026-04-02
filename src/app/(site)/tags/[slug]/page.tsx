import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/site/ArticleCard";
import { EmptyState } from "@/components/site/EmptyState";
import { Pagination } from "@/components/site/Pagination";
import { getTagDetail } from "@/lib/api/articles";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTagDetail(slug);
  if (!data) return { title: "Tag not found" };
  return {
    title: `#${data.tag.name}`,
    description: `Stories tagged with "${data.tag.name}" from The Granite Post.`,
  };
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const data = await getTagDetail(slug, page);
  if (!data) notFound();

  const { tag, articles, total_pages, current_page, count } = data;

  return (
    <main className="container" id="main-content">
      <header className="page-header">
        <p className="page-header-eyebrow">Topic</p>
        <h1 className="page-header-title">#{tag.name}</h1>
        <p className="page-header-count">{count} article{count !== 1 ? "s" : ""}</p>
      </header>

      {articles.length === 0 ? (
        <EmptyState
          title="No articles with this tag"
          copy="Stories tagged with this topic will appear here."
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
            buildHref={(p) => `/tags/${slug}?page=${p}`}
          />
        </>
      )}
    </main>
  );
}
