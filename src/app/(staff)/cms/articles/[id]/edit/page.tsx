import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import CmsShell from "@/components/cms/CmsShell";
import ArticleEditor from "@/components/cms/ArticleEditor";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleDetail, CategorySummary, TagSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Edit Article — CMS" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { id } = await params;
  const headers = { Authorization: `Bearer ${session.value}` };

  const [articleRes, catsRes, tagsRes] = await Promise.all([
    safeApiFetch<ArticleDetail>(`/api/v1/staff/articles/${id}/`, { headers, cache: "no-store" }),
    safeApiFetch<ApiListResponse<CategorySummary>>("/api/v1/categories/?page_size=200", { headers }),
    safeApiFetch<ApiListResponse<TagSummary>>("/api/v1/tags/?page_size=500", { headers }),
  ]);

  if (!articleRes.data) notFound();

  return (
    <CmsShell title="Edit Article">
      <ArticleEditor
        article={articleRes.data}
        categories={catsRes.data?.results ?? []}
        tags={tagsRes.data?.results ?? []}
      />
    </CmsShell>
  );
}
