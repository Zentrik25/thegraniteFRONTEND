import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CmsShell from "@/components/cms/CmsShell";
import ArticleEditor from "@/components/cms/ArticleEditor";
import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import { hasMinimumStaffRole } from "@/lib/auth/staff-roles";
import type {
  ApiListResponse,
  CategorySummary,
  TagSummary,
  StaffMember,
  StaffProfile,
} from "@/lib/types";

export const metadata: Metadata = { title: "New Article — CMS" };

export default async function NewArticlePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const headers = { Authorization: `Bearer ${session.value}` };

  const [catsRes, tagsRes, authorsRes, profileRes] = await Promise.all([
    safeApiFetch<ApiListResponse<CategorySummary> | CategorySummary[]>("/api/v1/categories/?page_size=200", { headers }),
    safeApiFetch<ApiListResponse<TagSummary> | TagSummary[]>("/api/v1/tags/?page_size=500", { headers }),
    safeApiFetch<ApiListResponse<StaffMember> | StaffMember[]>("/api/v1/staff/?page_size=100", { headers }),
    safeApiFetch<StaffProfile>("/api/v1/auth/me/", { headers, cache: "no-store" }),
  ]);
  const profile = profileRes.data;
  const canPublish = profile
    ? Boolean(profile.can_publish ?? hasMinimumStaffRole(profile.role, "editor"))
    : true;

  return (
    <CmsShell title="New Article">
      <ArticleEditor
        categories={catsRes.data ? unwrapList(catsRes.data) : []}
        tags={tagsRes.data ? unwrapList(tagsRes.data) : []}
        authors={authorsRes.data ? unwrapList(authorsRes.data) : []}
        canPublish={canPublish}
      />
    </CmsShell>
  );
}
