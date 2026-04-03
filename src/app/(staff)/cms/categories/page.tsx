import type { Metadata } from "next";
import CmsShell from "@/components/cms/CmsShell";
import { getSectionsForCms } from "@/lib/api/sections";
import {
  getCategoryDetailForCms,
  getCategorySectionMapForCms,
} from "@/lib/api/taxonomy";
import { requireStaffRole } from "@/lib/auth/require-staff-role";
import CategoryTable from "./_components/CategoryTable";

export const metadata: Metadata = { title: "Categories — CMS" };
export const dynamic = "force-dynamic";

export default async function CmsCategoriesPage() {
  const { accessToken } = await requireStaffRole("editor");

  const [sections, categories] = await Promise.all([
    getSectionsForCms(undefined, accessToken),
    getCategorySectionMapForCms(accessToken),
  ]);

  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      const detail = await getCategoryDetailForCms(category.slug, 1, accessToken);
      return {
        ...category,
        article_count: detail?.count ?? 0,
      };
    }),
  );

  return (
    <CmsShell title="Categories">
      <CategoryTable initialCategories={categoriesWithCounts} sections={sections} />
    </CmsShell>
  );
}
