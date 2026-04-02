/**
 * RSS 2.0 feed — served at /feed.xml
 * Autodiscovered via <link rel="alternate"> in the root layout.
 *
 * Spec: https://www.rssboard.org/rss-specification
 * Media RSS: https://www.rssboard.org/media-rss
 */

import { type NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, SITE_URL } from "@/lib/env";
import { siteConfig } from "@/config/site";
import type { ApiListResponse, ArticleSummary } from "@/lib/types";

export const runtime = "nodejs";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Escape XML special characters for use in element content / attributes. */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Wrap content in CDATA — safe for arbitrary HTML or free text. */
function cdata(str: string): string {
  // Escape any CDATA end sequence that might appear in the content itself
  return `<![CDATA[${str.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/**
 * Format a date string as RFC 2822 for RSS <pubDate>.
 * Date.toUTCString() produces e.g. "Thu, 01 Feb 2024 09:30:00 GMT" which is
 * a valid RFC 2822 value.
 */
function toRFC2822(iso: string): string {
  return new Date(iso).toUTCString();
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest): Promise<NextResponse> {
  let articles: ArticleSummary[] = [];

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/articles/?page_size=20&ordering=-published_at`,
      { next: { revalidate: 900 } } // 15-minute server cache
    );
    if (res.ok) {
      const body: ApiListResponse<ArticleSummary> | ArticleSummary[] = await res.json();
      articles = Array.isArray(body) ? body : (body.results ?? []);
    }
  } catch {
    // If the API is unreachable return an empty but valid feed rather than 500
  }

  const feedUrl = `${SITE_URL}/feed.xml`;
  const now = new Date().toUTCString();

  // ── Channel ─────────────────────────────────────────────────────────────────

  const items = articles
    .filter((a) => a.published_at) // skip unpublished
    .map((a) => {
      const articleUrl = `${SITE_URL}/articles/${a.slug}`;
      const pubDate = toRFC2822(a.published_at!);

      const lines: string[] = [
        `    <item>`,
        `      <title>${esc(a.title)}</title>`,
        `      <link>${esc(articleUrl)}</link>`,
        `      <guid isPermaLink="true">${esc(articleUrl)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
      ];

      if (a.excerpt) {
        lines.push(`      <description>${cdata(a.excerpt)}</description>`);
      }

      if (a.author_name) {
        lines.push(`      <dc:creator>${cdata(a.author_name)}</dc:creator>`);
      }

      if (a.category?.name) {
        lines.push(`      <category>${esc(a.category.name)}</category>`);
      }

      if (a.image_url) {
        lines.push(`      <media:content url="${esc(a.image_url)}" medium="image" />`);
      }

      lines.push(`    </item>`);
      return lines.join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(siteConfig.name)}</title>
    <link>${esc(SITE_URL)}</link>
    <description>${esc(siteConfig.description)}</description>
    <language>en-zw</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>editorial@thegranitepost.co.zw (${esc(siteConfig.name)})</managingEditor>
    <webMaster>tech@thegranitepost.co.zw (${esc(siteConfig.name)})</webMaster>
    <ttl>15</ttl>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${esc(SITE_URL)}/og-default.jpg</url>
      <title>${esc(siteConfig.name)}</title>
      <link>${esc(SITE_URL)}</link>
      <width>144</width>
      <height>144</height>
    </image>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=900, stale-while-revalidate=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
