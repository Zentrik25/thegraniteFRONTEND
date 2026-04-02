import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { SearchForm } from "@/components/search-form";
import { Pagination } from "@/components/site/Pagination";
import { StoryMeta } from "@/components/site/StoryMeta";
import { searchArticles } from "@/lib/api/articles";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Search results for "${q}" on The Granite Post.`
      : "Search The Granite Post — breaking news, politics, business and more.",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const results = q.trim() ? await searchArticles(q.trim(), page) : null;

  return (
    <main className="container" id="main-content">
      <header className="page-header">
        <p className="page-header-eyebrow">Search</p>
        <h1 className="page-header-title">
          {q ? `Results for "${q}"` : "Search The Granite Post"}
        </h1>
      </header>

      <SearchForm initialQuery={q} autoFocus={!q} />

      {/* Results */}
      {results === null && !q && (
        <p className="copy" style={{ marginTop: "0.5rem" }}>
          Enter a search term above to find stories.
        </p>
      )}

      {q && results === null && (
        <p className="copy">Could not retrieve search results. Try again shortly.</p>
      )}

      {results && (
        <>
          <p className="search-count">
            {results.count === 0 ? (
              "No results found."
            ) : (
              <>
                <strong>{results.count}</strong>{" "}
                result{results.count !== 1 ? "s" : ""}
                {results.total_pages > 1 && ` — page ${page} of ${results.total_pages}`}
              </>
            )}
          </p>

          {results.results.length === 0 ? (
            <div style={{ marginTop: "1rem" }}>
              <p className="copy" style={{ marginBottom: "0.65rem" }}>
                No stories matched <strong>{q}</strong>. Try a different search
                term, or browse recent coverage below.
              </p>
              <Link className="btn-outline" href="/">
                ← Back to homepage
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: "0.5rem" }}>
              {results.results.map((result) => (
                <div className="search-result-item" key={result.article.slug}>
                  {result.article.image_url && (
                    <Image
                      className="latest-thumb"
                      src={result.article.image_url}
                      alt={result.article.image_alt || result.article.title}
                      width={96}
                      height={72}
                      style={{ objectFit: "cover", flexShrink: 0 }}
                    />
                  )}
                  <div className="search-result-body">
                    <h2 className="search-result-headline">
                      <Link href={`/articles/${result.article.slug}`}>
                        {result.headline || result.article.title}
                      </Link>
                    </h2>
                    {result.article.excerpt && (
                      <p className="search-result-excerpt">
                        {result.article.excerpt}
                      </p>
                    )}
                    <StoryMeta article={result.article} />
                  </div>
                </div>
              ))}

              <Pagination
                currentPage={page}
                totalPages={results.total_pages}
                buildHref={(p) =>
                  `/search?q=${encodeURIComponent(q)}&page=${p}`
                }
              />
            </div>
          )}
        </>
      )}
    </main>
  );
}
