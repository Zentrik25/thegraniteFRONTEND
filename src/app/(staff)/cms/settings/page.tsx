import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { SettingsClient } from "@/components/cms/settings/SettingsClient";

export const metadata: Metadata = { title: "Settings — CMS" };
export const dynamic = "force-dynamic";

interface StaffProfile {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
  can_manage_staff?: boolean;
}

interface StaffMemberRow {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
}

export default async function CmsSettingsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  // Fetch own profile
  const { data: profile } = await safeApiFetch<StaffProfile>(
    "/api/v1/auth/me/",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    },
  );

  if (!profile) redirect("/cms/login");

  const canManageStaff =
    profile.can_manage_staff === true ||
    profile.role === "ADMIN" ||
    profile.role === "EDITOR";

  // Fetch staff list only if user can manage staff
  let members: StaffMemberRow[] = [];
  if (canManageStaff) {
    const { data: staffData } = await safeApiFetch<ApiListResponse<StaffMemberRow>>(
      "/api/v1/staff/?page_size=100",
      {
        headers: { Authorization: `Bearer ${session.value}` },
        cache: "no-store",
      },
    );
    members = staffData?.results ?? [];
  }

  return (
    <CmsShell title="Settings">
      <SettingsClient
        profile={profile}
        members={members}
        canManageStaff={canManageStaff}
      />
    </CmsShell>
  );
}
