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
  size_bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
  alt_text?: string;
  caption?: string;
  credit?: string;
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

  return (
    <CmsShell title="Media Library">
      <MediaManager initialItems={data?.results ?? []} />
    </CmsShell>
  );
}
