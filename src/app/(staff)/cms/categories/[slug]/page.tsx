import type { Metadata } from "next";
import Link from "next/link";
import CmsShell from "@/components/cms/CmsShell";
import TaxonomyArticleTable from "@/components/cms/TaxonomyArticleTable";
import { getCategoryDetailForCms } from "@/lib/api/taxonomy";
import { requireStaffRole } from "@/lib/auth/require-staff-role";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} — Categories — CMS` };
}

function buildCategoryHref(slug: string, page: number) {
  return page > 1 ? `/cms/categories/${slug}?page=${page}` : `/cms/categories/${slug}`;
}

export default async function CmsCategoryDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { accessToken } = await requireStaffRole("editor");
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const data = await getCategoryDetailForCms(slug, page, accessToken);

  if (!data) {
    return (
      <CmsShell title="Category not found">
        <p style={{ color: "#777" }}>This category could not be loaded.</p>
      </CmsShell>
    );
  }

  const previousHref = data.previous ? buildCategoryHref(slug, page - 1) : null;
  const nextHref = data.next ? buildCategoryHref(slug, page + 1) : null;

  return (
    <CmsShell title={data.category.name}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <Link href="/cms/categories" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>
            ← Back to categories
          </Link>
          {data.category.description ? (
            <p style={{ margin: "0.55rem 0 0", color: "#666", maxWidth: "780px", lineHeight: 1.6 }}>
              {data.category.description}
            </p>
          ) : null}
        </div>

        <TaxonomyArticleTable
          articles={data.articles}
          totalCount={data.count}
          currentPage={data.current_page}
          totalPages={data.total_pages}
          previousHref={previousHref}
          nextHref={nextHref}
          emptyTitle="No articles in this category"
          emptyCopy="Articles assigned to this category will appear here."
        />
      </div>
    </CmsShell>
  );
}
