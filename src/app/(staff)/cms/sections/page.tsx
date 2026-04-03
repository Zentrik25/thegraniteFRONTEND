import type { Metadata } from "next";
import CmsShell from "@/components/cms/CmsShell";
import { requireStaffRole } from "@/lib/auth/require-staff-role";
import { getSectionsForCms } from "@/lib/api/sections";
import SectionTable from "./_components/SectionTable";

export const metadata: Metadata = { title: "Sections — CMS" };
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ primary?: string }>;
}

export default async function CmsSectionsPage({ searchParams }: PageProps) {
  const { accessToken } = await requireStaffRole("editor");
  const sp = await searchParams;
  const primary =
    sp.primary === "true" ? true : sp.primary === "false" ? false : undefined;
  const filter =
    primary === true ? "primary" : primary === false ? "secondary" : "all";

  const sections = await getSectionsForCms(primary, accessToken);

  return (
    <CmsShell title="Sections">
      <SectionTable initialSections={sections} filter={filter} />
    </CmsShell>
  );
}
