/**
 * HomeAfricaBand — full-width pure-black band with 4-column dark cards.
 * Background: #000000  |  Card surface: #272729 (Apple dark)
 * Category labels in #2997ff (Apple Bright Blue).
 * Playfair Display headlines on dark.
 */

import Image from "next/image";
import Link from "next/link";

import type { SectionDetail } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";
import { formatRelativeTime } from "@/lib/format";

interface HomeAfricaBandProps {
  section: SectionDetail;
}

export function HomeAfricaBand({ section }: HomeAfricaBandProps) {
  const articles = [
    ...(section.hero_article ? [section.hero_article] : []),
    ...section.articles,
  ].slice(0, 4);

  if (articles.length === 0) return null;

  const sectionHref = `/sections/${section.slug}`;

  return (
    <section className="gp-africa-band" aria-labelledby="gp-africa-label">
      <div className="gp-africa-inner">
        <div className="gp-africa-head">
          <Link href={sectionHref} className="gp-africa-title" id="gp-africa-label">
            {section.name}
          </Link>
          <Link href={sectionHref} className="gp-africa-more">
            More {section.name} →
          </Link>
        </div>

        <div className="gp-africa-grid">
          {articles.map((article) => (
            <article key={article.slug} className="gp-africa-card">
              {article.image_url && (
                <div className="gp-africa-card-img relative overflow-hidden">
                  <Image
                    src={mediaProxyPath(article.image_url) ?? ""}
                    alt={article.image_alt || article.title}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="gp-africa-card-body">
                {article.category && (
                  <span className="gp-africa-card-cat">
                    {article.category.name}
                  </span>
                )}
                <h3 className="gp-africa-card-title">
                  <Link href={`/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h3>
                {article.published_at && (
                  <p className="gp-africa-card-time">
                    {formatRelativeTime(article.published_at)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
