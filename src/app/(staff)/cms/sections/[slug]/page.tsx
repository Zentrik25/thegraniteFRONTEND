import type { Metadata } from "next";
import Link from "next/link";
import CmsShell from "@/components/cms/CmsShell";
import TaxonomyArticleTable from "@/components/cms/TaxonomyArticleTable";
import { FormSection } from "@/components/staff/FormSection";
import { getSectionArticlesForCms, getSectionForCms } from "@/lib/api/sections";
import { requireStaffRole } from "@/lib/auth/require-staff-role";
import { InlineBadge } from "@/components/cms/taxonomy-shared";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} — Sections — CMS` };
}

function buildSectionHref(slug: string, page: number, category?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (category) params.set("category", category);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return `/cms/sections/${slug}${suffix}`;
}

export default async function CmsSectionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { accessToken } = await requireStaffRole("editor");
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category = sp.category?.trim() || undefined;

  const [section, articleFeed] = await Promise.all([
    getSectionForCms(slug, accessToken),
    getSectionArticlesForCms(slug, {
      page,
      category,
      accessToken,
    }),
  ]);

  if (!section) {
    return (
      <CmsShell title="Section not found">
        <p style={{ color: "#777" }}>This section could not be loaded.</p>
      </CmsShell>
    );
  }

  const previousHref =
    articleFeed?.previous != null ? buildSectionHref(slug, page - 1, category) : null;
  const nextHref =
    articleFeed?.next != null ? buildSectionHref(slug, page + 1, category) : null;

  return (
    <CmsShell title={section.name}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <Link href="/cms/sections" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>
              ← Back to sections
            </Link>
            {section.description ? (
              <p style={{ margin: "0.55rem 0 0", color: "#666", maxWidth: "780px", lineHeight: 1.6 }}>
                {section.description}
              </p>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            <InlineBadge tone={section.is_primary ? "accent" : "neutral"}>
              {section.is_primary ? "Primary nav" : "Secondary nav"}
            </InlineBadge>
            <InlineBadge tone="success">
              {(section.article_count ?? 0).toLocaleString()} articles
            </InlineBadge>
            <InlineBadge tone="neutral">
              {(section.category_count ?? 0).toLocaleString()} categories
            </InlineBadge>
          </div>
        </div>

        {section.hero_article ? (
          <FormSection title="Hero Article">
            <div>
              <Link
                href={`/cms/articles/${section.hero_article.slug}/edit`}
                style={{ color: "#111", fontWeight: 700, textDecoration: "none", fontSize: "1rem" }}
              >
                {section.hero_article.title}
              </Link>
              <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "0.25rem" }}>
                {section.hero_article.slug}
              </div>
              {section.hero_article.excerpt ? (
                <p style={{ margin: "0.55rem 0 0", color: "#666", lineHeight: 1.55 }}>
                  {section.hero_article.excerpt}
                </p>
              ) : null}
            </div>
          </FormSection>
        ) : null}

        <FormSection title="Categories" hint="Filter the article feed below by category">
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link
              href={`/cms/sections/${slug}`}
              style={{
                padding: "0.38rem 0.68rem",
                borderRadius: "999px",
                textDecoration: "none",
                background: !category ? "#1f2937" : "#fff",
                color: !category ? "#fff" : "#444",
                border: !category ? "none" : "1px solid #ddd",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              All
            </Link>
            {section.categories.map((item) => {
              const active = category === item.slug;
              return (
                <Link
                  key={item.slug}
                  href={`/cms/sections/${slug}?category=${item.slug}`}
                  style={{
                    padding: "0.38rem 0.68rem",
                    borderRadius: "999px",
                    textDecoration: "none",
                    background: active ? "#1f2937" : "#fff",
                    color: active ? "#fff" : "#444",
                    border: active ? "none" : "1px solid #ddd",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </FormSection>

        <div>
          <h2
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.82rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#666",
            }}
          >
            Section Articles
          </h2>
          <TaxonomyArticleTable
            articles={articleFeed?.results ?? section.articles}
            totalCount={articleFeed?.count ?? section.article_count ?? section.articles.length}
            currentPage={articleFeed?.current_page ?? page}
            totalPages={articleFeed?.total_pages ?? 1}
            previousHref={previousHref}
            nextHref={nextHref}
            emptyTitle="No articles in this section"
            emptyCopy="Published articles assigned to this section will appear here."
          />
        </div>
      </div>
    </CmsShell>
  );
}
