import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse } from "@/lib/types";
import CmsShell from "@/components/cms/CmsShell";
import MediaManager from "@/components/cms/MediaManager";

export const metadata: Metadata = { title: "Media — CMS" };
export const dynamic = "force-dynamic";

interface MediaItem {
  id: string | number;
  url: string;
  proxy_url?: string;
  thumbnail_url?: string;
  original_filename?: string;
  filename?: string;
  size_bytes?: number;
  file_size?: number;
  width?: number;
  height?: number;
  created_at?: string;
  uploaded_at?: string;
  alt_text?: string;
  caption?: string;
  credit?: string;
}

/**
 * Convert Django absolute media URL → browser-reachable proxy path.
 * Mirrors the withProxyUrl logic in the /api/staff/media route handler.
 */
function withProxyUrl(item: MediaItem): MediaItem {
  try {
    const parsed = new URL(item.url);
    if (parsed.pathname.startsWith("/media/")) {
      return { ...item, proxy_url: `/api/media${parsed.pathname.slice("/media".length)}` };
    }
  } catch { /* relative or already proxied */ }
  return item;
}

export default async function CmsMediaPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_staff_session");
  if (!session?.value) redirect("/cms/login");

  // Correct Django endpoint is /api/v1/media/ (staff-scoped, not /staff/media/)
  const { data } = await safeApiFetch<ApiListResponse<MediaItem>>(
    "/api/v1/media/?page_size=48",
    {
      headers: { Authorization: `Bearer ${session.value}` },
      cache: "no-store",
    }
  );

  const items = (data?.results ?? []).map(withProxyUrl);

  return (
    <CmsShell title="Media Library">
      <MediaManager initialItems={items} />
    </CmsShell>
  );
}
