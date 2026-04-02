/**
 * Google News Sitemap — served at /news-sitemap.xml
 *
 * Google News requires articles published within the last 2 days.
 * Spec: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
 */

import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, SITE_URL } from "@/lib/env";
import type { ApiListResponse, ArticleSummary } from "@/lib/types";

export const runtime = "nodejs";

const PUBLICATION_NAME = "The Granite Post";
const PUBLICATION_LANGUAGE = "en";
const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  let articles: ArticleSummary[] = [];

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/articles/?page_size=100&ordering=-published_at`,
      { next: { revalidate: 900 } } // 15-min cache
    );

    if (res.ok) {
      const data: ApiListResponse<ArticleSummary> | ArticleSummary[] = await res.json();
      articles = Array.isArray(data) ? data : (data.results ?? []);
    }
  } catch {
    // If API is down return a valid but empty news sitemap rather than 500
  }

  const cutoff = Date.now() - TWO_DAYS_MS;
  const recent = articles.filter((a) => {
    if (!a.published_at) return false;
    return new Date(a.published_at).getTime() >= cutoff;
  });

  const urlEntries = recent
    .map((a) => {
      const loc = `${SITE_URL}/articles/${a.slug}`;
      const pubDate = new Date(a.published_at!).toISOString();
      const title = escapeXml(a.title);

      return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${PUBLICATION_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache at the CDN for 15 min, allow stale-while-revalidate for 5 min
      "Cache-Control": "public, max-age=900, stale-while-revalidate=300",
    },
  });
}
