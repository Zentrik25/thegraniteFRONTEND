import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { safeApiFetch } from "@/lib/api/fetcher";
import type {
  ApiListResponse,
  ArticleSummary,
  CategorySummary,
  SectionSummary,
  TagSummary,
  UserProfile,
} from "@/lib/types";

const CACHE = { next: { revalidate: 3600 } } as const;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/authors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Fetch all dynamic data in parallel — failures return null, not a crash
  const [articlesRes, categoriesRes, sectionsRes, tagsRes, authorsRes] =
    await Promise.all([
      safeApiFetch<ApiListResponse<ArticleSummary>>(
        "/api/v1/articles/?status=published&page_size=1000&ordering=-published_at",
        CACHE
      ),
      safeApiFetch<ApiListResponse<CategorySummary>>(
        "/api/v1/categories/?page_size=200",
        CACHE
      ),
      safeApiFetch<ApiListResponse<SectionSummary>>(
        "/api/v1/sections/?page_size=100",
        CACHE
      ),
      safeApiFetch<ApiListResponse<TagSummary>>(
        "/api/v1/tags/?page_size=500",
        CACHE
      ),
      safeApiFetch<ApiListResponse<UserProfile>>(
        "/api/v1/users/?page_size=200",
        CACHE
      ),
    ]);

  // ── Articles ──────────────────────────────────────────────────────────────
  const articles: MetadataRoute.Sitemap =
    articlesRes.data?.results?.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  // ── Categories ────────────────────────────────────────────────────────────
  const categories: MetadataRoute.Sitemap =
    categoriesRes.data?.results?.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })) ?? [];

  // ── Sections ──────────────────────────────────────────────────────────────
  const sections: MetadataRoute.Sitemap =
    sectionsRes.data?.results?.map((s) => ({
      url: `${base}/sections/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })) ?? [];

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tags: MetadataRoute.Sitemap =
    tagsRes.data?.results?.map((t) => ({
      url: `${base}/tags/${t.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.4,
    })) ?? [];

  // ── Authors ───────────────────────────────────────────────────────────────
  const authors: MetadataRoute.Sitemap =
    authorsRes.data?.results?.map((a) => ({
      url: `${base}/authors/${a.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })) ?? [];

  return [...staticRoutes, ...articles, ...categories, ...sections, ...authors, ...tags];
}
