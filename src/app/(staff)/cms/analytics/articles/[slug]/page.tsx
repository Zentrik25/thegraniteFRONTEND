import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { safeApiFetch } from "@/lib/api/fetcher";
import CmsShell from "@/components/cms/CmsShell";
import { ArticleStatsChart } from "@/components/cms/ArticleStatsChart";
import type { ArticleSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Stats: ${slug} — CMS` };
}

export default async function ArticleStatsPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { slug } = await params;

  // Fetch article metadata to display the title
  const { data: article } = await safeApiFetch<ArticleSummary>(
    `/api/v1/articles/${slug}/`,
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    },
  );

  if (!article) notFound();

  return (
    <CmsShell>
      {/* Back link + title */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/cms/analytics"
          style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
        >
          ← Back to Analytics
        </Link>
        <h1 style={{
          margin: "0.5rem 0 0",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#111",
          lineHeight: 1.3,
        }}>
          {article.title}
        </h1>
        {article.category && (
          <span style={{ fontSize: "0.75rem", color: "#999" }}>{article.category.name}</span>
        )}
      </div>

      {/* Client chart component */}
      <ArticleStatsChart slug={slug} />
    </CmsShell>
  );
}
