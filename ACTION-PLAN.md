# SEO Action Plan — news.thegranite.co.zw
**Generated:** 10 April 2026

---

## 🔴 CRITICAL — Fix Immediately (blocks indexing)

### C1 — Fix canonical URL on all article pages
**Impact:** All articles are currently un-indexable. Google sees every article as a duplicate pointing to a JPG file.  
**File:** `src/app/(site)/articles/[slug]/page.tsx`  
**Fix:** In `generateMetadata`, build the canonical from the slug, not from the article's `image_url`.

```ts
// src/app/(site)/articles/[slug]/page.tsx
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug); // however you fetch it
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`;

  return {
    title: `${article.title} | The Granite Post`,
    description: article.excerpt,
    alternates: { canonical: articleUrl },              // ← FIX
    openGraph: {
      type: "article",
      url: articleUrl,                                  // ← FIX
      title: article.og_title || article.title,
      description: article.og_description || article.excerpt,
      images: article.image_url ? [{ url: article.image_url, width: 1200, height: 630 }] : [],
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: article.author?.display_name ? [article.author.display_name] : [],
      section: article.category?.name,
    },
    twitter: {
      card: "summary_large_image",
      site: "@GranitePost",
      title: article.og_title || article.title,
      description: article.og_description || article.excerpt,
      images: article.image_url ? [article.image_url] : [],
    },
  };
}
```

Also fix JSON-LD in the same file — the `url` field in `NewsArticle` and breadcrumb item 3:

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NewsArticle",
      "@id": `${articleUrl}#article`,
      "headline": article.title,
      "url": articleUrl,                                // ← FIX (was image_url)
      "description": article.excerpt,
      "image": [article.image_url].filter(Boolean),
      "datePublished": article.published_at,
      "dateModified": article.updated_at || article.published_at,
      "author": [{
        "@type": "Person",
        "name": article.author?.display_name || "The Granite Post",
        "url": article.author?.slug
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/authors/${article.author.slug}`
          : undefined,
      }],
      "publisher": {
        "@type": "Organization",
        "name": "The Granite Post",
        "url": "https://news.thegranite.co.zw",
        "logo": {
          "@type": "ImageObject",
          "url": "https://news.thegranite.co.zw/logo.png",
          "width": 600,
          "height": 60,
        },
      },
      "isAccessibleForFree": true,
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://news.thegranite.co.zw" },
        ...(article.category ? [{ "@type": "ListItem", "position": 2, "name": article.category.name, "item": `https://news.thegranite.co.zw/categories/${article.category.slug}` }] : []),
        { "@type": "ListItem", "position": article.category ? 3 : 2, "name": article.title, "item": articleUrl }, // ← FIX
      ],
    },
  ],
};
```

---

### C2 — Fix robots.txt sitemap domain
**File:** `src/app/robots.ts` or `public/robots.txt`  
**Fix:** Change both sitemap lines:

```
# WRONG:
Sitemap: https://thegranitepost.co.zw/sitemap.xml

# CORRECT:
Sitemap: https://news.thegranite.co.zw/sitemap.xml
Sitemap: https://news.thegranite.co.zw/news-sitemap.xml
```

---

### C3 — Fix canonical on About/footer pages
**Issue:** `/about`, and likely all `(info)` route group pages, have canonical = homepage URL  
**File:** `src/app/(info)/layout.tsx` or individual page files  
**Fix:** Each page must set its own canonical. In `(info)/layout.tsx`, do NOT set a canonical (Next.js will auto-use the current URL), or pass it per-page:

```ts
// src/app/(info)/about/page.tsx
export const metadata: Metadata = {
  title: "About Us — The Granite Post",
  alternates: { canonical: "https://news.thegranite.co.zw/about" },
  openGraph: {
    url: "https://news.thegranite.co.zw/about",
    title: "About Us — The Granite Post",
    description: "Learn about The Granite Post...",
    images: [{ url: "https://news.thegranite.co.zw/og-default.jpg" }],
  },
};
```

---

## 🟠 HIGH — Fix within 1 week

### H1 — Add OG image to homepage
**File:** `src/app/(site)/page.tsx` or root layout  
**Fix:**
```ts
openGraph: {
  images: [{ url: "https://news.thegranite.co.zw/og-default.jpg", width: 1200, height: 630, alt: "The Granite Post" }],
  url: "https://news.thegranite.co.zw",
},
twitter: {
  images: ["https://news.thegranite.co.zw/og-default.jpg"],
},
```

### H2 — Add H1 to homepage
**File:** `src/components/NewsSiteShell.tsx` or homepage component  
**Fix:** Add a visually hidden or styled H1 above the hero zone:
```tsx
<h1 className="sr-only">The Granite Post — Zimbabwe News</h1>
```
Or incorporate it visibly into the Masthead component as a proper heading.

### H3 — Add WebSite + Organization JSON-LD to homepage
**File:** `src/app/(site)/page.tsx`

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://news.thegranite.co.zw/#website",
      "url": "https://news.thegranite.co.zw",
      "name": "The Granite Post",
      "description": "Authoritative news and analysis from Zimbabwe.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://news.thegranite.co.zw/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://news.thegranite.co.zw/#organization",
      "name": "The Granite Post",
      "url": "https://news.thegranite.co.zw",
      "logo": {
        "@type": "ImageObject",
        "url": "https://news.thegranite.co.zw/logo.png",
        "width": 600,
        "height": 60,
      },
      "sameAs": [
        "https://twitter.com/GranitePost",
        "https://facebook.com/GranitePost",
      ],
      "contactPoint": { "@type": "ContactPoint", "email": "editor@thegranitepost.co.zw", "contactType": "editorial" },
    },
  ],
};
```

### H4 — Fix homepage title duplication
**File:** `src/app/(site)/page.tsx` or `src/app/layout.tsx`  
**Current:** `"The Granite Post — Zimbabwe's Journal of Record | The Granite Post"`  
**Fix:** `"The Granite Post — Zimbabwe's Journal of Record"` (remove the `| The Granite Post` suffix on homepage only)

### H5 — Add meta descriptions to all section pages
**File:** `src/app/(site)/sections/[slug]/page.tsx` in `generateMetadata`  
**Fix:** Use the section's description from the API, or generate:
```ts
description: section.description || `Latest ${section.name} news from Zimbabwe — The Granite Post`
```

### H6 — Add twitter:site to article pages
**File:** `src/app/(site)/articles/[slug]/page.tsx` `generateMetadata`  
**Fix:** Add to twitter card metadata:
```ts
twitter: {
  site: "@GranitePost",
  // ... other fields
}
```

### H7 — Add news:keywords to news-sitemap.xml
**File:** `src/app/news-sitemap.xml/route.ts` (or wherever news-sitemap is generated)  
**Fix:** Add keywords from article tags/category:
```xml
<news:keywords>Zimbabwe, politics, ZANU-PF</news:keywords>
```

---

## 🟡 MEDIUM — Fix within 1 month

### M1 — Real author names and author profiles
**Impact:** Major E-E-A-T improvement; Google News authority signal  
**Fix:**
- Ensure staff members have display names set in the CMS (`/cms/staff`)
- Update article templates to show real author bylines
- Create proper author profile pages at `/authors/[slug]` with bio and photo
- Add `author.url` to NewsArticle JSON-LD schema

### M2 — Add contextual internal links in article bodies
**Fix:** When writing/editing articles, add hyperlinks in the body text to related articles, section pages, and topic pages. This distributes page authority and improves crawl depth.

### M3 — Add JSON-LD to section/category pages
**File:** `src/app/(site)/sections/[slug]/page.tsx`
```ts
const jsonLd = {
  "@type": "CollectionPage",
  "name": `${section.name} | The Granite Post`,
  "url": `https://news.thegranite.co.zw/sections/${section.slug}`,
  "description": section.description,
};
```

### M4 — Add rel="alternate" RSS discovery link in HTML head
**File:** `src/app/layout.tsx`
```ts
// In Next.js metadata:
alternates: {
  types: { "application/rss+xml": "https://news.thegranite.co.zw/feed.xml" }
}
```

### M5 — Add pagination rel=next/prev to section pages
**File:** `src/app/(site)/sections/[slug]/page.tsx`  
When section pages have multiple pages of results, add:
```ts
alternates: {
  canonical: `https://news.thegranite.co.zw/sections/${slug}`,
  // For page 2+: include prev/next signals
}
```

### M6 — Consistent og:locale across all pages
Ensure all pages include `og:locale: "en_ZW"` in their metadata.

### M7 — Image format optimisation
Current images served as JPEG from `api.thegranite.co.zw`. Request WebP conversion from the backend/CDN for 25-40% size reduction. Verify CDN serves proper `Cache-Control` headers.

### M8 — Sitemap coverage
Only 26 URLs in sitemap. As article count grows, ensure sitemap auto-generates all published article URLs. Verify no articles are missing.

---

## 🟢 LOW — Backlog

### L1 — Consider hreflang for diaspora audiences
The site targets Zimbabwe + diaspora (UK, South Africa, USA, Australia). Consider:
```html
<link rel="alternate" hreflang="en-zw" href="https://news.thegranite.co.zw/articles/..." />
<link rel="alternate" hreflang="en" href="https://news.thegranite.co.zw/articles/..." />
```

### L2 — Consider ChatGPT-User in robots.txt
`ChatGPT-User` is the live browsing agent (not just training crawler). Allowing it lets ChatGPT cite your articles in live responses, which drives referral traffic. Separate from `GPTBot` (training).

### L3 — Article word count
Several articles are 400-500 words. For topics that warrant it (policy analysis, investigations), longer-form pieces (800-1500 words) rank better and improve dwell time.

### L4 — Add `dateModified` tracking
When articles are updated, ensure `dateModified` in both JSON-LD and `og:article:modified_time` reflects the actual edit time. Currently both timestamps are identical (created = modified).

### L5 — Publisher logo image
Ensure `https://news.thegranite.co.zw/logo.png` (or equivalent) exists as a proper PNG, 600×60px, white background, used in schema publisher.logo. Add this file to `/public/` if not present.

### L6 — Structured data for author pages
Add `Person` schema to `/authors/[slug]` pages once real author profiles exist.

---

## Fix Priority Matrix

| Fix | Effort | Impact | Do First? |
|---|---|---|---|
| C1: Article canonical/og:url/JSON-LD | Low (code fix) | Catastrophic | **YES — TODAY** |
| C2: robots.txt sitemap domain | Minutes | High | **YES — TODAY** |
| C3: Info page canonicals | Low | Medium | This week |
| H1: Homepage OG image | Minutes | High | This week |
| H2: Homepage H1 | Minutes | Medium | This week |
| H3: Homepage JSON-LD | 30 min | Medium | This week |
| H4: Title dedup | Minutes | Low | This week |
| H5: Section meta descriptions | 1 hour | Medium | This week |
| M1: Real author names | Days (editorial process) | High (E-E-A-T) | Next sprint |
| M2: Internal links in articles | Ongoing editorial | High | Ongoing |

---

## After Fixing Critical Issues

Once C1 (canonical bug) is deployed:
1. Submit both sitemaps to Google Search Console
2. Request indexing for the 8 most recent articles
3. Monitor Google News inclusion under Search Console → News
4. Verify WhatsApp previews work correctly using the WhatsApp Link Preview tool
5. Use `<https://search.google.com/test/rich-results>` to validate NewsArticle schema
