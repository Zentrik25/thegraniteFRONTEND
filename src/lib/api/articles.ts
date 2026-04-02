import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import type {
  AdZone,
  ApiListResponse,
  ArticleDetail,
  ArticleSummary,
  CategoryDetailResponse,
  CategorySummary,
  CommentListResponse,
  SearchResponse,
  SectionDetail,
  SectionSummary,
  TagDetailResponse,
  TagSummary,
  TopStorySlot,
  TrendingArticle,
} from "@/lib/types";

export async function getHomepageFeed() {
  const [latest, topStories, featured, breaking, sections, trending] = await Promise.all([
    safeApiFetch<ApiListResponse<ArticleSummary>>("/api/v1/articles/", {
      next: { revalidate: 60 },
    }),
    safeApiFetch<TopStorySlot[]>("/api/v1/articles/top-stories/", {
      next: { revalidate: 30 },
    }),
    safeApiFetch<ApiListResponse<ArticleSummary> | ArticleSummary[]>(
      "/api/v1/articles/featured/",
      { next: { revalidate: 30 } },
    ),
    safeApiFetch<ApiListResponse<ArticleSummary> | ArticleSummary[]>(
      "/api/v1/articles/breaking/",
      { next: { revalidate: 30 } },
    ),
    safeApiFetch<{ status: string; count: number; results: SectionSummary[] }>(
      "/api/v1/sections/?primary=true",
      { next: { revalidate: 300 } },
    ),
    safeApiFetch<TrendingArticle[]>("/api/v1/analytics/trending/?period=day", {
      next: { revalidate: 300 },
    }),
  ]);

  const apiUnavailable =
    latest.status >= 500 &&
    topStories.status >= 500 &&
    featured.status >= 500 &&
    breaking.status >= 500 &&
    sections.status >= 500;

  return {
    latest: latest.data ? unwrapList(latest.data) : [],
    topStories: topStories.data || [],
    featured: featured.data ? unwrapList(featured.data) : [],
    breaking: breaking.data ? unwrapList(breaking.data) : [],
    sections: sections.data?.results || [],
    trending: trending.data || [],
    apiUnavailable,
  };
}

export async function getArticleBySlug(slug: string) {
  const result = await safeApiFetch<ArticleDetail>(`/api/v1/articles/${slug}/`, {
    next: { revalidate: 30 },
  });
  return {
    article: result.data,
    paywalled: result.status === 402,
    notFound: result.status === 404,
  };
}

export async function getArticleComments(slug: string) {
  const result = await safeApiFetch<CommentListResponse>(
    `/api/v1/articles/${slug}/comments/`,
    { next: { revalidate: 30 } },
  );
  return result.data;
}

export async function getCategoryDetail(slug: string, page = 1) {
  const params = page > 1 ? `?page=${page}` : "";
  const result = await safeApiFetch<CategoryDetailResponse>(
    `/api/v1/categories/${slug}/${params}`,
    { next: { revalidate: 120 } },
  );
  return result.data;
}

export async function getTagDetail(slug: string, page = 1) {
  const params = page > 1 ? `?page=${page}` : "";
  const result = await safeApiFetch<TagDetailResponse>(
    `/api/v1/tags/${slug}/${params}`,
    { next: { revalidate: 120 } },
  );
  return result.data;
}

export async function getSectionDetail(slug: string) {
  const result = await safeApiFetch<SectionDetail>(`/api/v1/sections/${slug}/`, {
    next: { revalidate: 120 },
  });
  return result.data;
}

export async function getSections(primary?: boolean) {
  const params = new URLSearchParams();
  if (typeof primary === "boolean") params.set("primary", String(primary));
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const result = await safeApiFetch<{ status: string; count: number; results: SectionSummary[] }>(
    `/api/v1/sections/${suffix}`,
    { next: { revalidate: 300 } },
  );
  return result.data?.results || [];
}

export async function getCategories() {
  const result = await safeApiFetch<ApiListResponse<CategorySummary> | CategorySummary[]>(
    "/api/v1/categories/",
    { next: { revalidate: 300 } },
  );
  return result.data ? unwrapList(result.data) : [];
}

export async function getTags() {
  const result = await safeApiFetch<ApiListResponse<TagSummary> | TagSummary[]>(
    "/api/v1/tags/",
    { next: { revalidate: 300 } },
  );
  return result.data ? unwrapList(result.data) : [];
}

export async function searchArticles(query: string, page = 1, pageSize = 20) {
  if (!query.trim()) return null;
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    page_size: String(pageSize),
  });
  const result = await safeApiFetch<SearchResponse>(
    `/api/v1/search/?${params.toString()}`,
    { next: { revalidate: 30 } },
  );
  return result.data;
}

export async function getTrendingArticles(period: "day" | "week" = "day") {
  const result = await safeApiFetch<TrendingArticle[]>(
    `/api/v1/analytics/trending/?period=${period}`,
    { next: { revalidate: 300 } },
  );
  return result.data || [];
}

export async function getPublicAdZone(slug: string) {
  const result = await safeApiFetch<AdZone>(`/api/v1/ads/zones/${slug}/`, {
    next: { revalidate: 60 },
  });
  return result.data;
}

export async function getSubscriptionPlans() {
  const result = await safeApiFetch<ApiListResponse<import("@/lib/types").SubscriptionPlan>>(
    "/api/v1/subscriptions/plans/",
    { next: { revalidate: 600 } },
  );
  return result.data ? unwrapList(result.data) : [];
}
