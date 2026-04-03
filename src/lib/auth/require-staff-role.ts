import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";
import { hasMinimumStaffRole, type StaffRoleName } from "@/lib/auth/staff-roles";
import type { StaffProfile } from "@/lib/types";

export async function requireStaffRole(minimum: StaffRoleName = "author") {
  const cookieStore = await cookies();
  const session = cookieStore.get(STAFF_ACCESS_COOKIE)?.value;

  if (!session) {
    redirect("/cms/login");
  }

  const accessToken = session;

  const profileRes = await safeApiFetch<StaffProfile>("/api/v1/auth/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const profile = profileRes.data;
  if (!profile || profileRes.status === 401) {
    redirect("/cms/login");
  }

  if (!hasMinimumStaffRole(profile.role, minimum)) {
    redirect("/cms");
  }

  return {
    accessToken,
    profile,
  };
}
