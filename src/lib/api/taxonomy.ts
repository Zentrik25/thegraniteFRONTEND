import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import type {
  ApiListResponse,
  CategoryDetailResponse,
  CategorySummary,
  SectionDetail,
  SectionSummary,
  TagDetailResponse,
  TagSummary,
} from "@/lib/types";

function authHeaders(accessToken?: string): HeadersInit | undefined {
  if (!accessToken) return undefined;
  return { Authorization: `Bearer ${accessToken}` };
}

export async function getCategoriesForCms(accessToken?: string) {
  const result = await safeApiFetch<CategorySummary[] | ApiListResponse<CategorySummary>>(
    "/api/v1/categories/",
    {
      headers: authHeaders(accessToken),
      cache: "no-store",
    },
  );

  return result.data ? unwrapList(result.data) : [];
}

export async function getCategoryDetailForCms(
  slug: string,
  page = 1,
  accessToken?: string,
) {
  const suffix = page > 1 ? `?page=${page}` : "";
  const result = await safeApiFetch<CategoryDetailResponse>(
    `/api/v1/categories/${slug}/${suffix}`,
    {
      headers: authHeaders(accessToken),
      cache: "no-store",
    },
  );

  return result.data;
}

export async function getTagsForCms(accessToken?: string) {
  const result = await safeApiFetch<TagSummary[] | ApiListResponse<TagSummary>>(
    "/api/v1/tags/",
    {
      headers: authHeaders(accessToken),
      cache: "no-store",
    },
  );

  return result.data ? unwrapList(result.data) : [];
}

export async function getTagDetailForCms(
  slug: string,
  page = 1,
  accessToken?: string,
) {
  const suffix = page > 1 ? `?page=${page}` : "";
  const result = await safeApiFetch<TagDetailResponse>(
    `/api/v1/tags/${slug}/${suffix}`,
    {
      headers: authHeaders(accessToken),
      cache: "no-store",
    },
  );

  return result.data;
}

export async function getCategorySectionMapForCms(accessToken?: string) {
  const [sectionsResult, categories] = await Promise.all([
    safeApiFetch<{ status?: string; count: number; results: SectionSummary[] }>(
      "/api/v1/sections/",
      {
        headers: authHeaders(accessToken),
        cache: "no-store",
      },
    ),
    getCategoriesForCms(accessToken),
  ]);

  const sectionDetails = await Promise.all(
    (sectionsResult.data?.results ?? []).map(async (section) => {
      const detail = await safeApiFetch<SectionDetail>(
        `/api/v1/sections/${section.slug}/`,
        {
          headers: authHeaders(accessToken),
          cache: "no-store",
        },
      );

      return {
        section,
        detail: detail.data,
      };
    }),
  );

  const lookup = new Map<
    string,
    { sectionId: string | number; sectionName: string; sectionSlug: string }
  >();

  for (const sectionDetail of sectionDetails) {
    for (const category of sectionDetail.detail?.categories ?? []) {
      lookup.set(category.slug, {
        sectionId: sectionDetail.section.id,
        sectionName: sectionDetail.section.name,
        sectionSlug: sectionDetail.section.slug,
      });
    }
  }

  return categories.map((category) => {
    const section = lookup.get(category.slug);
    const sectionId = section?.sectionId ?? null;
    return {
      ...category,
      section: sectionId !== null ? Number(sectionId) : null,
      section_name: section?.sectionName ?? null,
      section_slug: section?.sectionSlug ?? null,
    };
  });
}
