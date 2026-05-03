import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ArticleViewTracker } from "@/components/article-view-tracker";
import { ArticleListSection } from "@/components/site/ArticleListSection";
import { CommentsPanel } from "@/components/comments-panel";
import { NewsletterForm } from "@/components/newsletter-form";
import BookmarkButton from "@/components/reader/BookmarkButton";
import HistoryTracker from "@/components/reader/HistoryTracker";
import { ShareRow } from "@/components/site/ShareRow";
import { AdSlot } from "@/components/site/AdSlot";
import { getArticleBySlug, getArticleComments } from "@/lib/api/articles";
import { formatDate, formatDateTime } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import { mediaProxyPath } from "@/lib/utils/media";

export const revalidate = 60;

function articleKey(article: {
  id?: number | string | null;
  slug?: string | null;
}): string | null {
  if (article.slug) return `slug:${article.slug}`;
  if (article.id != null) return `id:${article.id}`;
  return null;
}

function dedupeArticles
  T extends { id?: number | string | null; slug?: string | null }
>(
  articles: T[] | null | undefined,
  seen: Set<string>,
  excludeKey?: string | null
): T[] {
  if (!articles?.length) return [];

  const result: T[] = [];

  for (const article of articles) {
    const key = articleKey(article);
    if (!key) continue;
    if (key === excludeKey) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(article);
  }

  return result;
}

function resolveCanonical(
  rawCanonical: string | null | undefined,
  slug: string
): string {
  const isValid =
    rawCanonical &&
    !rawCanonical.match(/\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i) &&
    !rawCanonical.includes("/media/") &&
    !rawCanonical.includes("api.");
  return isValid ? rawCanonical : `${SITE_URL}/articles/${slug}`;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { article } = await getArticleBySlug(slug);

  if (!article) return { title: "Article not found" };

  const title = article.og_title || article.seo_title || article.title;
  const description =
    article.og_description || article.seo_description || article.excerpt;
  const imageUrl =
    article.resolved_og_image || article.og_image_url || article.image_url;
  const canonical = resolveCanonical(article.canonical_url, slug);

  // news_keywords: category + up to 9 tags (max 10 per Google News spec)
  const keywordParts: string[] = [];
  if (article.category?.name) keywordParts.push(article.category.name);
  if (article.tags?.length) {
    keywordParts.push(...article.tags.slice(0, 9).map((t) => t.name));
  }

  return {
    title,
    description,
    alternates: { canonical },
    ...(keywordParts.length && {
      other: { news_keywords: keywordParts.join(", ") },
    }),
    openGraph: {
      title,
      description: description ?? undefined,
      type: "article",
      url: canonical,
      siteName: "The Granite Post",
      locale: "en_ZW",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: title }]
        : [],
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: article.author_slug
        ? [`${SITE_URL}/authors/${article.author_slug}`]
        : article.author_name
        ? [article.author_name]
        : [],
      section: article.category?.name ?? undefined,
      tags: article.tags?.map((t) => t.name) ?? [],
    },
    twitter: {
      card: "summary_large_image",
      site: "@GranitePost",
      creator: "@GranitePost",
      title,
      description: description ?? undefined,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [{ article, paywalled, notFound: isNotFound }, commentsData] =
    await Promise.all([getArticleBySlug(slug), getArticleComments(slug)]);

  if (isNotFound) notFound();

  const seen = new Set<string>();
  const currentArticleKey = article ? articleKey(article) : null;

  const relatedArticles = dedupeArticles(
    article?.related_articles,
    seen,
    currentArticleKey
  );
  const latestArticles = dedupeArticles(
    article?.latest_articles,
    seen,
    currentArticleKey
  );
  const moreFromAuthor = dedupeArticles(
    article?.more_from_author,
    seen,
    currentArticleKey
  );

  // ── Structured data (@graph: NewsArticle + BreadcrumbList) ─────────────────
  const structuredData = article
    ? (() => {
        const articleUrl = resolveCanonical(article.canonical_url, slug);

        const crumbs: {
          "@type": "ListItem";
          position: number;
          name: string;
          item?: string;
        }[] = [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        ];

        if (article.category) {
          crumbs.push({
            "@type": "ListItem",
            position: 2,
            name: article.category.name,
            item: `${SITE_URL}/categories/${article.category.slug}`,
          });
        }

        crumbs.push({
          "@type": "ListItem",
          position: crumbs.length + 1,
          name: article.title,
          item: articleUrl,
        });

        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "NewsArticle",
              headline: article.title,
              description: article.excerpt ?? undefined,
              image: article.image_url ? [article.image_url] : [],
              datePublished: article.published_at,
              dateModified: article.updated_at || article.published_at,
              author: article.author_name
                ? [
                    {
                      "@type": "Person",
                      name: article.author_name,
                      ...(article.author_slug && {
                        url: `${SITE_URL}/authors/${article.author_slug}`,
                      }),
                      worksFor: {
                        "@type": "NewsMediaOrganization",
                        name: "The Granite Post",
                        url: SITE_URL,
                      },
                    },
                  ]
                : [],
              publisher: {
                "@type": "NewsMediaOrganization",
                name: "The Granite Post",
                url: SITE_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${SITE_URL}/logo.png`,
                  width: 600,
                  height: 60,
                },
              },
              url: articleUrl,
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": articleUrl,
              },
              ...(article.category?.name && {
                articleSection: article.category.name,
              }),
              ...(article.tags?.length && {
                keywords: article.tags.map((t) => t.name).join(", "),
              }),
              isAccessibleForFree: !article.is_premium,
              inLanguage: "en",
              copyrightHolder: {
                "@type": "NewsMediaOrganization",
                name: "The Granite Post",
              },
              copyrightYear: article.published_at
                ? new Date(article.published_at).getFullYear()
                : new Date().getFullYear(),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: crumbs,
            },
          ],
        };
      })()
    : null;

  return (
    <main className="gp-container gp-article-page" id="main-content">
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {article && <HistoryTracker articleSlug={slug} />}

      {!article ? (
        <div className="news-section" role="status">
          <p className="kicker">Unavailable</p>
          <p className="copy">
            This article could not be loaded. The backend may be offline.
          </p>
        </div>
      ) : (
        <div className="article-detail-wrap">
          {/* ── Main article column ── */}
          <div className="article-detail-main">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              style={{
                display: "flex",
                gap: "0.5rem",
                fontSize: "0.72rem",
                color: "var(--muted)",
                fontFamily: "var(--font-ui)",
                marginBottom: "0.5rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link href="/" className="article-breadcrumb-link">
                Home
              </Link>
              {article.category && (
                <>
                  <span aria-hidden="true">›</span>
                  <Link
                    href={`/categories/${article.category.slug}`}
                    className="article-breadcrumb-link"
                  >
                    {article.category.name}
                  </Link>
                </>
              )}
            </nav>

            {/* Article header */}
            <header className="article-detail-header">
              {article.is_breaking && (
                <p className="article-detail-kicker">Breaking</p>
              )}

              <h1 className="article-detail-headline">{article.title}</h1>

              {article.excerpt && (
                <p className="article-detail-dek">{article.excerpt}</p>
              )}

              {/* Meta bar + bookmark */}
              <div
                className="article-detail-meta"
                role="complementary"
                aria-label="Article info"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    flexWrap: "wrap",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {article.author_name && (
                    <span className="article-detail-author">
                      By{" "}
                      {article.author_slug ? (
                        <Link href={`/authors/${article.author_slug}`}>
                          {article.author_name}
                        </Link>
                      ) : (
                        article.author_name
                      )}
                    </span>
                  )}
                  {article.author_name && article.published_at && (
                    <span
                      className="article-detail-meta-sep"
                      aria-hidden="true"
                    >
                      ·
                    </span>
                  )}
                  {article.published_at && (
                    <time dateTime={article.published_at}>
                      {formatDateTime(article.published_at)}
                    </time>
                  )}
                  {article.updated_at &&
                    article.updated_at !== article.published_at &&
                    article.updated_at.slice(0, 10) !==
                      article.published_at?.slice(0, 10) && (
                      <>
                        <span
                          className="article-detail-meta-sep"
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <span>
                          Updated{" "}
                          <time dateTime={article.updated_at}>
                            {formatDate(article.updated_at)}
                          </time>
                        </span>
                      </>
                    )}
                  {article.is_premium && (
                    <>
                      <span
                        className="article-detail-meta-sep"
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          color: "var(--accent)",
                          fontFamily: "var(--font-ui)",
                        }}
                      >
                        Premium
                      </span>
                    </>
                  )}
                  <ArticleViewTracker
                    slug={slug}
                    initialCount={article.view_count}
                  />
                </div>
                <BookmarkButton articleSlug={slug} compact />
              </div>

              {/* Share buttons */}
              <ShareRow
                title={article.title}
                url={`${SITE_URL}/articles/${slug}`}
                excerpt={article.excerpt || undefined}
              />
            </header>

            {/* Hero image — next/image for LCP optimisation */}
            {article.image_url && (
              <figure style={{ margin: "0 0 1.5rem" }}>
                <Image
                  className="article-hero-img"
                  src={mediaProxyPath(article.image_url) ?? ""}
                  alt={article.image_alt || article.title}
                  width={1200}
                  height={675}
                  priority={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  style={{ width: "100%", height: "auto" }}
                />
                {(article.image_caption || article.image_credit) && (
                  <figcaption className="article-img-caption">
                    {article.image_caption}
                    {article.image_caption && article.image_credit ? " — " : ""}
                    {article.image_credit && (
                      <span style={{ fontStyle: "italic" }}>
                        {article.image_credit}
                      </span>
                    )}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Paywall gate */}
            {paywalled ? (
              <div className="paywall-banner">
                <h2>This article is for subscribers</h2>
                <p>
                  Subscribe to The Granite Post for unlimited access to premium
                  journalism.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    justifyContent: "center",
                  }}
                >
                  <Link className="btn-primary" href="/subscribe">
                    Subscribe now
                  </Link>
                  <Link className="btn-outline" href="/login">
                    Sign in
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Article body */}
                {article.body ? (
                  <div
                    className="article-body"
                    dangerouslySetInnerHTML={{ __html: article.body }}
                  />
                ) : (
                  <p className="copy">Full article text is not available.</p>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="article-tags-row">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.slug}
                        className="tag-chip"
                        href={`/tags/${tag.slug}`}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Comments */}
                <CommentsPanel
                  slug={slug}
                  initialComments={commentsData?.results ?? []}
                  totalCount={commentsData?.count ?? 0}
                />
              </>
            )}

            {/* ── Related article lists ── */}
            <ArticleListSection
              heading="Related articles"
              articles={relatedArticles}
            />
            <ArticleListSection
              heading="Latest updates"
              articles={latestArticles}
            />
            {moreFromAuthor.length > 0 && (
              <ArticleListSection
                heading={`More from ${article.author_name ?? "this author"}`}
                articles={moreFromAuthor}
              />
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside aria-label="Article sidebar">
            <NewsletterForm source={`article-${slug}`} />
            <div style={{ marginTop: "1.5rem" }}>
              <AdSlot zone={null} />
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}