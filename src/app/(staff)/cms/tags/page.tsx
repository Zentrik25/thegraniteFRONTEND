import type { Metadata } from "next";
import CmsShell from "@/components/cms/CmsShell";
import { getTagDetailForCms, getTagsForCms } from "@/lib/api/taxonomy";
import { requireStaffRole } from "@/lib/auth/require-staff-role";
import TagTable from "./_components/TagTable";

export const metadata: Metadata = { title: "Tags — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsTagsPage() {
  const { accessToken } = await requireStaffRole("editor");
  const tags = await getTagsForCms(accessToken);

  const tagsWithCounts = await Promise.all(
    tags.map(async (tag) => {
      const detail = await getTagDetailForCms(tag.slug, 1, accessToken);
      return {
        ...tag,
        article_count: detail?.count ?? 0,
      };
    }),
  );

  return (
    <CmsShell title="Tags">
      <TagTable initialTags={tagsWithCounts} />
    </CmsShell>
  );
}
