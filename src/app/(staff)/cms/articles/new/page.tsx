import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CmsShell from "@/components/cms/CmsShell";
import ArticleEditor from "@/components/cms/ArticleEditor";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, CategorySummary, TagSummary, StaffMember } from "@/lib/types";

export const metadata: Metadata = { title: "New Article — CMS" };

export default async function NewArticlePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const headers = { Authorization: `Bearer ${session.value}` };

  const [catsRes, tagsRes, authorsRes] = await Promise.all([
    safeApiFetch<ApiListResponse<CategorySummary>>("/api/v1/categories/?page_size=200", { headers }),
    safeApiFetch<ApiListResponse<TagSummary>>("/api/v1/tags/?page_size=500", { headers }),
    safeApiFetch<ApiListResponse<StaffMember>>("/api/v1/staff/?page_size=100", { headers }),
  ]);

  return (
    <CmsShell title="New Article">
      <ArticleEditor
        categories={catsRes.data?.results ?? []}
        tags={tagsRes.data?.results ?? []}
        authors={authorsRes.data?.results ?? []}
      />
    </CmsShell>
  );
}
