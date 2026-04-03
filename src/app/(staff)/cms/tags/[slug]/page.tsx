import type { Metadata } from "next";
import Link from "next/link";
import CmsShell from "@/components/cms/CmsShell";
import TaxonomyArticleTable from "@/components/cms/TaxonomyArticleTable";
import { InlineBadge } from "@/components/cms/taxonomy-shared";
import { getTagDetailForCms } from "@/lib/api/taxonomy";
import { requireStaffRole } from "@/lib/auth/require-staff-role";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} — Tags — CMS` };
}

function buildTagHref(slug: string, page: number) {
  return page > 1 ? `/cms/tags/${slug}?page=${page}` : `/cms/tags/${slug}`;
}

export default async function CmsTagDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { accessToken } = await requireStaffRole("editor");
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const data = await getTagDetailForCms(slug, page, accessToken);

  if (!data) {
    return (
      <CmsShell title="Tag not found">
        <p style={{ color: "#777" }}>This tag could not be loaded.</p>
      </CmsShell>
    );
  }

  const previousHref = data.previous ? buildTagHref(slug, page - 1) : null;
  const nextHref = data.next ? buildTagHref(slug, page + 1) : null;

  return (
    <CmsShell title={`#${data.tag.name}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <Link href="/cms/tags" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 700 }}>
              ← Back to tags
            </Link>
            <div style={{ marginTop: "0.6rem" }}>
              <InlineBadge tone="accent">{data.tag.name}</InlineBadge>
            </div>
          </div>
        </div>

        <TaxonomyArticleTable
          articles={data.articles}
          totalCount={data.count}
          currentPage={data.current_page}
          totalPages={data.total_pages}
          previousHref={previousHref}
          nextHref={nextHref}
          emptyTitle="No articles with this tag"
          emptyCopy="Articles carrying this tag will appear here."
        />
      </div>
    </CmsShell>
  );
}
