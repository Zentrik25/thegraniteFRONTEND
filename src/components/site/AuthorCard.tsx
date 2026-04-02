import Image from "next/image";
import Link from "next/link";

import type { UserProfile } from "@/lib/types";

export function AuthorCard({ author }: { author: UserProfile }) {
  const initials = author.byline
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="author-card">
      {author.avatar_url ? (
        <Image
          className="author-avatar"
          src={author.avatar_url}
          alt={author.byline}
          width={64}
          height={64}
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="author-avatar-ph" aria-hidden="true">
          {initials}
        </div>
      )}
      <div className="author-card-body">
        <p className="author-card-name">
          <Link href={`/authors/${author.slug}`}>{author.byline}</Link>
        </p>
        {(author.title || author.beat) && (
          <p className="author-card-title">
            {[author.title, author.beat].filter(Boolean).join(" · ")}
          </p>
        )}
        {author.bio && <p className="author-card-bio">{author.bio}</p>}
        {author.article_count !== undefined && (
          <p className="meta" style={{ marginTop: "0.25rem" }}>
            {author.article_count} {author.article_count === 1 ? "article" : "articles"}
          </p>
        )}
      </div>
    </div>
  );
}
