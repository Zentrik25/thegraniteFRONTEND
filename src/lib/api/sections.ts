import { safeApiFetch } from "@/lib/api/fetcher";
import type {
  SectionArticlesResponse,
  SectionDetail,
  SectionListResponse,
} from "@/lib/types";

function sectionHeaders(accessToken?: string): HeadersInit | undefined {
  if (!accessToken) return undefined;
  return { Authorization: `Bearer ${accessToken}` };
}

export async function getSectionsForCms(
  primary?: boolean,
  accessToken?: string,
) {
  const params = new URLSearchParams();
  if (typeof primary === "boolean") {
    params.set("primary", String(primary));
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const result = await safeApiFetch<SectionListResponse>(
    `/api/v1/sections/${suffix}`,
    {
      headers: sectionHeaders(accessToken),
      cache: "no-store",
    },
  );

  return result.data?.results ?? [];
}

export async function getSectionForCms(slug: string, accessToken?: string) {
  const result = await safeApiFetch<SectionDetail>(`/api/v1/sections/${slug}/`, {
    headers: sectionHeaders(accessToken),
    cache: "no-store",
  });

  return result.data;
}

export async function getSectionArticlesForCms(
  slug: string,
  options?: {
    page?: number;
    category?: string;
    accessToken?: string;
  },
) {
  const params = new URLSearchParams();
  if (options?.page && options.page > 1) {
    params.set("page", String(options.page));
  }
  if (options?.category) {
    params.set("category", options.category);
  }

  const suffix = params.toString() ? `?${params.toString()}` : "";
  const result = await safeApiFetch<SectionArticlesResponse>(
    `/api/v1/sections/${slug}/articles/${suffix}`,
    {
      headers: sectionHeaders(options?.accessToken),
      cache: "no-store",
    },
  );

  return result.data;
}
