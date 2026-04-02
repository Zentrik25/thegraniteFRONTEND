import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArticleCard } from "@/components/site/ArticleCard";
import { EmptyState } from "@/components/site/EmptyState";
import { getAuthor } from "@/lib/api/users";
import { mediaProxyPath } from "@/lib/utils/media";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthor(slug);
  if (!data) return { title: "Author not found" };
  return {
    title: data.user.byline,
    description: data.user.bio,
    openGraph: {
      title: `${data.user.byline} | The Granite Post`,
      images: data.user.avatar_url ? [data.user.avatar_url] : [],
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const data = await getAuthor(slug);

  if (!data) notFound();

  const { user, articles } = data;
  const initials = user.byline
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="container" id="main-content">
      {/* Author hero */}
      <div className="author-hero">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="author-hero-avatar"
            src={mediaProxyPath(user.avatar_url) ?? ""}
            alt={user.byline}
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div className="author-hero-avatar-ph" aria-hidden="true">
            {initials}
          </div>
        )}
        <div>
          <h1 className="author-hero-name">{user.byline}</h1>
          {(user.title || user.beat) && (
            <p className="author-hero-title">
              {[user.title, user.beat].filter(Boolean).join(" · ")}
            </p>
          )}
          {user.bio && <p className="author-hero-bio">{user.bio}</p>}
          <div className="author-hero-links">
            {user.twitter_handle && (
              <a
                className="author-social-link"
                href={`https://twitter.com/${user.twitter_handle.replace(/^@/, "")}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                @{user.twitter_handle.replace(/^@/, "")}
              </a>
            )}
            {user.linkedin_url && (
              <a
                className="author-social-link"
                href={user.linkedin_url}
                rel="noopener noreferrer"
                target="_blank"
              >
                LinkedIn
              </a>
            )}
            {user.email_public && (
              <a
                className="author-social-link"
                href={`mailto:${user.email_public}`}
              >
                {user.email_public}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Articles by author */}
      <section aria-labelledby="author-articles-label">
        <div className="news-section-head" style={{ borderTop: "2px solid var(--ink)", paddingTop: "1rem" }}>
          <h2 className="news-section-label" id="author-articles-label">
            Stories by {user.byline}
          </h2>
          {data.count > 0 && (
            <span className="meta">{data.count} article{data.count !== 1 ? "s" : ""}</span>
          )}
        </div>

        {articles.length === 0 ? (
          <EmptyState
            title="No published articles yet"
            copy="This author's stories will appear here when published."
          />
        ) : (
          <div className="article-grid-3" style={{ marginTop: "1rem" }}>
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}

        {data.total_pages > 1 && (
          <p className="meta" style={{ marginTop: "1rem" }}>
            Showing page 1 of {data.total_pages}.{" "}
            <Link
              className="story-cat-link"
              href={`/search?author=${slug}`}
            >
              View all stories →
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
