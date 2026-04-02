import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Media — CMS" };
export const dynamic = "force-dynamic";

interface MediaItem {
  id: string | number;
  url: string;
  thumbnail_url?: string;
  filename: string;
  file_size?: number;
  width?: number;
  height?: number;
  uploaded_at: string;
  alt_text?: string;
}

export default async function CmsMediaPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  const { data } = await safeApiFetch<ApiListResponse<MediaItem>>(
    "/api/v1/staff/media/?page_size=48",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const items = data?.results ?? [];

  return (
    <CmsShell title="Media Library">
      <div style={{ marginBottom: "1.25rem" }}>
        <a
          href="/api/staff/media/upload"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            padding: "0.5rem 1.25rem",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          + Upload media
        </a>
      </div>

      {items.length === 0 && (
        <p style={{ color: "#888" }}>No media uploaded yet.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                background: "#f0f0f0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail_url ?? item.url}
                alt={item.alt_text ?? item.filename}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
            <div style={{ padding: "0.5rem 0.6rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#333",
                }}
              >
                {item.filename}
              </div>
              {item.width && item.height && (
                <div style={{ fontSize: "0.7rem", color: "#999" }}>
                  {item.width}×{item.height}
                </div>
              )}
              <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "0.1rem" }}>
                {formatDate(item.uploaded_at)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </CmsShell>
  );
}
