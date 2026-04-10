# Full SEO Audit Report — news.thegranite.co.zw
**Audited:** 10 April 2026  
**Auditor:** Claude Code SEO Audit  
**Business type:** Online news publisher (Zimbabwe, English-language)

---

## Executive Summary

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 28/100 | 25% | 7.0 |
| Content Quality | 62/100 | 25% | 15.5 |
| On-Page SEO | 52/100 | 20% | 10.4 |
| Schema / Structured Data | 22/100 | 10% | 2.2 |
| Performance (CWV signals) | 68/100 | 10% | 6.8 |
| Images | 72/100 | 5% | 3.6 |
| AI Search Readiness | 18/100 | 5% | 0.9 |
| **TOTAL** | | | **46 / 100** |

### Overall SEO Health Score: **46 / 100 — CRITICAL**

The site is live and publishing relevant Zimbabwean news, but a **single catastrophic bug is destroying all article SEO**: every article page has its canonical URL, `og:url`, and JSON-LD `url` field set to the hero image file URL instead of the article's own URL. This tells Google that every article's "real location" is a JPG file on `api.thegranite.co.zw`. Without fixing this, no article can rank or be indexed correctly. This is Priority Zero.

### Top 5 Critical Issues
1. **Canonical / og:url / JSON-LD URL = image file URL on all articles** (blocks indexing)
2. **robots.txt sitemap URLs point to wrong domain** (`thegranitepost.co.zw` ≠ `news.thegranite.co.zw`)
3. **Homepage missing og:image and twitter:image** (WhatsApp/social previews broken for homepage shares)
4. **About/footer pages have wrong canonical** (pointing to homepage, causes duplicate content signals)
5. **Homepage has no H1 and no JSON-LD** (misses WebSite + Organization entity establishment)

### Top 5 Quick Wins
1. Fix canonical URL in `generateMetadata` for article pages (1-line code fix, immediate Google impact)
2. Fix robots.txt sitemap URLs to use `news.thegranite.co.zw`
3. Add og:image to homepage metadata
4. Add H1 to homepage (e.g. "Zimbabwe News — The Granite Post")
5. Add publisher logo to NewsArticle JSON-LD

---

## 1. Technical SEO

### 1.1 Crawlability

**robots.txt** — Present and well-structured with appropriate disallows. However:

| Issue | Severity |
|---|---|
| Sitemap directive uses wrong domain: `https://thegranitepost.co.zw/sitemap.xml` (site is on `news.thegranite.co.zw`) | CRITICAL |
| Sitemap directive uses wrong domain: `https://thegranitepost.co.zw/news-sitemap.xml` | CRITICAL |
| AI bot blocking (GPTBot, Claude-Web, etc.) — acceptable but reduces AI citation potential | LOW |

**Correct robots.txt sitemap lines should be:**
```
Sitemap: https://news.thegranite.co.zw/sitemap.xml
Sitemap: https://news.thegranite.co.zw/news-sitemap.xml
```

The `Googlebot-News Allow:` rules are correctly structured.

### 1.2 Sitemaps

**sitemap.xml**
- Total URLs: 26 (homepage, 7 articles, 10 sections, authors, search, subscribe)
- Article URLs appear to be slugs without base URL in raw XML — need to verify full URLs are absolute
- Priority values are appropriate (1.0 homepage, 0.8 articles, 0.7 sections)
- `lastmod` dates present — good

**news-sitemap.xml**
- Format: Valid Google News sitemap with `xmlns:news` namespace ✓
- Language: `en` ✓
- Total articles: 8 (covers ~April 8–10 window — correct for 48h requirement)
- Missing `news:keywords` tags on all entries — Google News uses these for categorisation
- Missing `news:access` tags (not required but useful for paywalled content)

### 1.3 Indexability — CRITICAL BUG

**Every article page has its canonical URL set to the hero image URL.**

Verified on 3 separate articles:
- `iran-war-squeezes-zimbabwe...` → canonical = `https://api.thegranite.co.zw/media/uploads/2026/04/new_e4Xtd5R.jpg`
- `soldier-faces-murder-charge...` → canonical = `https://api.thegranite.co.zw/media/uploads/2026/04/new_eahng4w.jpg`
- `ed-biography-directive...` → canonical = `https://api.thegranite.co.zw/media/uploads/2026/04/new_kcm4qtc.jpg`

**Impact:**
- Google reads the canonical and indexes the JPG URL instead of the article URL
- The article URL is seen as a "duplicate" pointing to an image
- Articles cannot appear in Google Search or Google News
- `og:url` has the same bug → WhatsApp/Facebook/Twitter previews link to a JPG
- JSON-LD `NewsArticle.url` has the same bug → schema validation fails

**Root cause (Next.js code):** In `src/app/(site)/articles/[slug]/page.tsx`, the `generateMetadata` function is almost certainly mapping the `article.image_url` field to both `alternates.canonical` and `openGraph.url` instead of the article's own URL. The fix is:

```ts
// generateMetadata in articles/[slug]/page.tsx
const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`;
return {
  alternates: { canonical: articleUrl },
  openGraph: { url: articleUrl },
  // ... rest of metadata
};
```

### 1.4 Redirect & Domain Consistency

- Site is served on `news.thegranite.co.zw` — consistent across all pages ✓
- robots.txt, however, references `thegranitepost.co.zw` — mismatch
- No `www` redirect issues detected

### 1.5 Security & Headers

- HTTPS enforced ✓
- Viewport meta present ✓
- Lang attribute `en` present on HTML element ✓

---

## 2. Content Quality

### 2.1 Article Quality

| Metric | Finding |
|---|---|
| Average article length | 420–900 words (acceptable for news briefs) |
| Heading structure within articles | Good — H2 subheadings used correctly |
| Meta descriptions on articles | Present and unique ✓ |
| Article titles (title tags) | Well-written, specific, informative ✓ |
| Publication date visible | Yes ✓ |
| Byline visible | Yes ("The Granite Reporter") |

### 2.2 E-E-A-T Signals

E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is critical for news sites.

| Signal | Status | Issue |
|---|---|---|
| Named authors | ✗ MISSING | All articles bylined "The Granite Reporter" — no individual journalist names |
| Author pages | `/authors` exists but needs real profiles | Generic author only |
| Author schema `url` | Missing in JSON-LD | No author profile URL |
| About page | ✓ Present and well-written | |
| Editorial standards page | ✓ Present | |
| Contact page | ✓ Present with real email addresses | |
| Publisher organization schema | Present but missing `logo` | |

**The most damaging E-E-A-T issue is the generic "The Granite Reporter" byline.** Google's Quality Rater Guidelines specifically flag news sites where content lacks identifiable authors. Real journalist names with author pages significantly improve trust scores.

### 2.3 Internal Linking

| Issue | Severity |
|---|---|
| No contextual internal links within article body text | HIGH |
| "Related articles" widget exists but is automated | LOW |
| No links to section/category pages from article body | MEDIUM |

Article bodies contain zero inline hyperlinks to related content. This is a missed opportunity for both users and crawlers.

### 2.4 Thin Content Risk

- Search page (`/search`) is disallowed in robots.txt ✓
- Subscribe/checkout pages are disallowed ✓
- Section pages with very few articles (e.g. Politics showing only 2 articles) may be flagged as thin

---

## 3. On-Page SEO

### 3.1 Title Tags

| Page | Title | Issue |
|---|---|---|
| Homepage | "The Granite Post — Zimbabwe's Journal of Record \| The Granite Post" | Brand name repeated twice |
| Article pages | "Iran war is now hitting Zimbabwe through fuel... \| The Granite Post" | ✓ Good format |
| Section pages | "Politics \| The Granite Post" | Acceptable but generic |
| About | "About Us — The Granite Post" | ✓ Good |

**Homepage title fix:** Remove the trailing `| The Granite Post` → `"The Granite Post — Zimbabwe's Journal of Record"`

### 3.2 Meta Descriptions

| Page | Meta Description | Issue |
|---|---|---|
| Homepage | "Authoritative news and analysis from Zimbabwe..." | ✓ Present, 88 chars |
| Articles | Unique per article | ✓ Present |
| Section pages | **MISSING** | Politics section has no meta description |
| About | "Learn about The Granite Post..." | ✓ Present |

Section pages (politics, business, sport, etc.) need unique meta descriptions.

### 3.3 Heading Structure

| Page | H1 | H2s | Issue |
|---|---|---|---|
| Homepage | **MISSING** | Not detected | Critical — no heading hierarchy |
| Article pages | ✓ Present (article title) | ✓ Good subheadings | Correct |
| Section pages | ✓ Present (section name) | Article titles as headings | OK |
| About page | ✓ "About Us" | Section headings | ✓ Good |

### 3.4 Open Graph & Twitter Cards

| Page | og:image | og:url | twitter:site |
|---|---|---|---|
| Homepage | ✗ MISSING | ✓ | Not checked |
| Articles | ✓ Present | ✗ WRONG (image URL) | ✗ Missing |
| Section pages | ✓ (default OG image) | ✓ | `@GranitePost` ✓ |
| About | ✓ (default OG image) | ✗ WRONG (homepage URL) | |

### 3.5 Language & Regional Signals

| Signal | Status |
|---|---|
| `lang="en"` on HTML | ✓ Present |
| `og:locale` | `en_ZW` on some pages (about) |
| `og:locale` consistency | Not consistent across all pages |
| `hreflang` for diaspora audiences | ✗ Missing |
| RSS feed language | `en-zw` ✓ Correct |

---

## 4. Schema / Structured Data

### 4.1 Article Pages

```
✓ NewsArticle schema present
✓ BreadcrumbList schema present  
✗ NewsArticle.url = image URL (CRITICAL BUG — same as canonical bug)
✗ NewsArticle.publisher.logo = MISSING
✗ Author.url = MISSING
✗ @id fields = MISSING
✗ twitter:site tag = MISSING
```

**Required fixes for valid Google News schema:**
```json
{
  "@type": "NewsArticle",
  "url": "https://news.thegranite.co.zw/articles/{slug}",
  "publisher": {
    "@type": "Organization",
    "name": "The Granite Post",
    "url": "https://news.thegranite.co.zw",
    "logo": {
      "@type": "ImageObject",
      "url": "https://news.thegranite.co.zw/logo.png",
      "width": 600,
      "height": 60
    }
  },
  "author": {
    "@type": "Person",
    "name": "Reporter Name",
    "url": "https://news.thegranite.co.zw/authors/{author-slug}"
  }
}
```

### 4.2 Homepage

| Schema type | Status |
|---|---|
| WebSite (with SearchAction for Sitelinks Searchbox) | ✗ Missing |
| Organization | ✗ Missing |
| BreadcrumbList | N/A |

### 4.3 Section Pages

No JSON-LD present on any section page. Consider adding `CollectionPage` or `ItemList` schema.

---

## 5. Performance (Signal-Based Assessment)

Direct Lighthouse/CWV measurement requires a headless browser. Based on architecture analysis:

| Signal | Assessment |
|---|---|
| Framework | Next.js 15 App Router — strong performance baseline |
| Server Components | Used — reduces client JS bundle, good for LCP |
| Images | `next/image` with fill + proper sizing |
| Font loading | `next/font` with `display: swap` ✓ |
| ISR / Static | Used on public pages — fast TTFB |
| Image CDN | `api.thegranite.co.zw` — external CDN, needs headers audit |
| JS bundle | No heavy client-side libraries detected (recharts on CMS only) |
| CSS | Tailwind CSS v4 — minimal unused CSS |

**Estimated CWV status:** LCP likely good (SSR + ISR), CLS risk moderate (font/image shifts), INP likely good.

---

## 6. Images

| Metric | Finding |
|---|---|
| Alt text coverage (homepage) | 23/23 images have alt text (100%) ✓ |
| Alt text quality | Descriptive, article-specific ✓ |
| Image dimensions | 16:9 enforced via CSS aspect-ratio ✓ |
| OG image on homepage | ✗ Missing |
| OG image on articles | ✓ Present (1200px+ images) |
| Default OG image (`/og-default.jpg`) | ✓ Present for section/info pages |
| Hero image in JSON-LD | ✓ Present as array |
| Image format | JPEG from CDN — consider WebP conversion |

---

## 7. AI Search Readiness

| Signal | Status |
|---|---|
| GPTBot / ChatGPT blocked | Yes (intentional) |
| anthropic-ai blocked | Yes |
| Structured data for AI extraction | NewsArticle present (but broken URL) |
| Named authors (citability) | ✗ Generic bylines reduce citability |
| AboutPage / Organization entity | Present (about page exists) |
| Fact-checkable claims | Moderate — news articles with sources |
| Internal topic authority links | ✗ Missing |

**Note:** Blocking AI training crawlers is a legitimate business choice. However, `ChatGPT-User` is the live browsing bot (not just training) — blocking it prevents ChatGPT from citing or linking to articles in live responses.

---

## 8. RSS Feed & Syndication

| Check | Status |
|---|---|
| RSS 2.0 valid structure | ✓ |
| Atom self-reference | ✓ |
| Language tag (`en-zw`) | ✓ |
| Item count | 8 (recent articles) |
| media:content images | ✓ |
| dc:creator (author) | ✓ |
| Category tags | ✓ |
| Discoverable from HTML (`<link rel="alternate">`) | Not verified |

---

## Pages Crawled

| URL | Status |
|---|---|
| https://news.thegranite.co.zw/ | ✓ 200 |
| https://news.thegranite.co.zw/articles/iran-war-squeezes-zimbabwe... | ✓ 200 |
| https://news.thegranite.co.zw/articles/soldier-faces-murder-charge... | ✓ 200 |
| https://news.thegranite.co.zw/articles/ed-biography-directive... | ✓ 200 |
| https://news.thegranite.co.zw/sections/politics | ✓ 200 |
| https://news.thegranite.co.zw/about | ✓ 200 |
| https://news.thegranite.co.zw/robots.txt | ✓ 200 |
| https://news.thegranite.co.zw/sitemap.xml | ✓ 200 |
| https://news.thegranite.co.zw/news-sitemap.xml | ✓ 200 |
| https://news.thegranite.co.zw/feed.xml | ✓ 200 |
