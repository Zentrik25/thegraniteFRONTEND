import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ApiListResponse, ArticleSummary, CategorySummary, SectionSummary } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/subscribe`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/authors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // ── Articles ──────────────────────────────────────────────────────────────
  const articlesRes = await safeApiFetch<ApiListResponse<ArticleSummary>>(
    "/api/v1/articles/?status=published&page_size=1000&ordering=-published_at"
  );
  const articles: MetadataRoute.Sitemap =
    articlesRes.data?.results.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) ?? [];

  // ── Categories ────────────────────────────────────────────────────────────
  const categoriesRes = await safeApiFetch<ApiListResponse<CategorySummary>>(
    "/api/v1/categories/?page_size=200"
  );
  const categories: MetadataRoute.Sitemap =
    categoriesRes.data?.results.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })) ?? [];

  // ── Sections ──────────────────────────────────────────────────────────────
  const sectionsRes = await safeApiFetch<ApiListResponse<SectionSummary>>(
    "/api/v1/sections/?page_size=100"
  );
  const sections: MetadataRoute.Sitemap =
    sectionsRes.data?.results.map((s) => ({
      url: `${base}/sections/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })) ?? [];

  return [...staticRoutes, ...articles, ...categories, ...sections];
}
