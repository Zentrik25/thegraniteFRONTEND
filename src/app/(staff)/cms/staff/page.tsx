import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { formatDate } from "@/lib/format";
import RoleBadge from "@/components/cms/RoleBadge";
import StaffActions from "@/components/cms/StaffActions";

export const metadata: Metadata = { title: "Staff — CMS" };
export const dynamic = "force-dynamic";

export interface StaffMember {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined: string;
}

export default async function CmsStaffPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { data, error } = await safeApiFetch<ApiListResponse<StaffMember>>(
    "/api/v1/staff/?page_size=100",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const members = data?.results ?? [];

  return (
    <CmsShell title="Staff Management">
      <StaffActions initialMembers={members} fetchError={error ?? null} />
    </CmsShell>
  );
}
