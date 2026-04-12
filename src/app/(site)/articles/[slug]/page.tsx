import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArticleViewTracker } from "@/components/article-view-tracker";
import { ArticleListSection } from "@/components/site/ArticleListSection";
import { CommentsPanel } from "@/components/comments-panel";
import { NewsletterForm } from "@/components/newsletter-form";
import BookmarkButton from "@/components/reader/BookmarkButton";
import HistoryTracker from "@/components/reader/HistoryTracker";
import { ShareRow } from "@/components/site/ShareRow";
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

function dedupeArticles<
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

  // Only accept a backend-supplied canonical if it looks like a real article URL.
  // Guard against backend returning image_url in this field (known DB data issue).
  const rawCanonical = article.canonical_url;
  const isValidCanonical =
    rawCanonical &&
    !rawCanonical.match(/\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i) &&
    !rawCanonical.includes("/media/") &&
    !rawCanonical.includes("api.");
  const canonical = (isValidCanonical ? rawCanonical : null) ?? `${SITE_URL}/articles/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description: description ?? undefined,
      type: "article",
      url: canonical,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: article.author_name ? [article.author_name] : [],
    },
    twitter: {
      card: "summary_large_image",
      site: "@GranitePost",
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

  // ── Structured data (@graph combines NewsArticle + BreadcrumbList) ──────────
  const structuredData = article
    ? (() => {
        const rawUrl = article.canonical_url;
        const validUrl =
          rawUrl &&
          !rawUrl.match(/\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i) &&
          !rawUrl.includes("/media/") &&
          !rawUrl.includes("api.");
        const articleUrl = (validUrl ? rawUrl : null) ?? `${SITE_URL}/articles/${slug}`;

        // Build breadcrumb: Home [> Category] > Article
        const crumbs: {
          "@type": "ListItem";
          position: number;
          name: string;
          item?: string;
        }[] = [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }];

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
              description: article.excerpt,
              image: article.image_url ? [article.image_url] : [],
              datePublished: article.published_at,
              dateModified: article.updated_at || article.published_at,
              author: article.author_name
                ? [{ "@type": "Person", name: article.author_name }]
                : [],
              publisher: {
                "@type": "Organization",
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
                    <span className="article-detail-meta-sep" aria-hidden="true">
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
                    article.updated_at.slice(0, 10) !== article.published_at?.slice(0, 10) && (
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
                  <ArticleViewTracker slug={slug} initialCount={article.view_count} />
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

            {/* Hero image */}
            {article.image_url && (
              <figure style={{ margin: "0 0 1.5rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="article-hero-img"
                  src={mediaProxyPath(article.image_url) ?? ""}
                  alt={article.image_alt || article.title}
                  fetchPriority="high"
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
          </aside>
        </div>
      )}
    </main>
  );
}