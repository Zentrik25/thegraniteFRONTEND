import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Staff — CMS" };
export const dynamic = "force-dynamic";

interface StaffMember {
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

  const { data } = await safeApiFetch<ApiListResponse<StaffMember>>(
    "/api/v1/staff/members/?page_size=100",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const members = data?.results ?? [];

  const roleColor: Record<string, { bg: string; color: string }> = {
    ADMIN: { bg: "#f8d7da", color: "#721c24" },
    EDITOR: { bg: "#d1ecf1", color: "#0c5460" },
    AUTHOR: { bg: "#d4edda", color: "#155724" },
    MODERATOR: { bg: "#fff3cd", color: "#856404" },
  };

  return (
    <CmsShell title="Staff Management">
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Email</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Role</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#999" }}>
                  No staff members found.
                </td>
              </tr>
            )}
            {members.map((m) => {
              const badge = roleColor[m.role] ?? { bg: "#eee", color: "#333" };
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#555" }}>{m.email}</td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span
                      style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem" }}>
                    <span
                      style={{
                        color: m.is_active ? "#155724" : "#721c24",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {m.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 0.5rem", color: "#888" }}>
                    {formatDate(m.date_joined)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </CmsShell>
  );
}
