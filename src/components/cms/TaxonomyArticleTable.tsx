import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { EmptyState } from "@/components/site/EmptyState";
import { formatRelativeTime } from "@/lib/format";
import type { ArticleSummary } from "@/lib/types";
import { mediaProxyPath } from "@/lib/utils/media";

interface TaxonomyArticleTableProps {
  articles: ArticleSummary[];
  emptyTitle: string;
  emptyCopy: string;
  totalCount?: number;
  currentPage?: number;
  totalPages?: number;
  previousHref?: string | null;
  nextHref?: string | null;
}

export default function TaxonomyArticleTable({
  articles,
  emptyTitle,
  emptyCopy,
  totalCount,
  currentPage,
  totalPages,
  previousHref,
  nextHref,
}: TaxonomyArticleTableProps) {
  if (articles.length === 0) {
    return <EmptyState title={emptyTitle} copy={emptyCopy} />;
  }

  return (
    <div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #e3e3e3" }}>
              <th style={headerStyle}>Article</th>
              <th style={headerStyle}>Category</th>
              <th style={headerStyle}>Status</th>
              <th style={headerStyle}>Published</th>
              <th style={{ ...headerStyle, textAlign: "right" }}>Views</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const imageSrc = mediaProxyPath(article.image_url);
              return (
                <tr key={article.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                      <div
                        style={{
                          position: "relative",
                          width: "108px",
                          minWidth: "108px",
                          aspectRatio: "16 / 9",
                          borderRadius: "6px",
                          overflow: "hidden",
                          background: "#efefef",
                        }}
                      >
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={article.image_alt || article.title}
                            fill
                            sizes="108px"
                            style={{ objectFit: "cover" }}
                          />
                        ) : null}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Link
                          href={`/cms/articles/${article.slug}/edit`}
                          style={{
                            display: "block",
                            fontWeight: 700,
                            color: "#111",
                            textDecoration: "none",
                            lineHeight: 1.3,
                          }}
                        >
                          {article.title}
                        </Link>
                        <div style={{ fontSize: "0.76rem", color: "#888", marginTop: "0.2rem" }}>
                          {article.slug}
                        </div>
                        {article.excerpt && (
                          <p
                            style={{
                              margin: "0.4rem 0 0",
                              color: "#666",
                              fontSize: "0.78rem",
                              lineHeight: 1.45,
                            }}
                          >
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                    {article.category?.name ?? "—"}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.18rem 0.55rem",
                        borderRadius: "999px",
                        background: "#f3f3f3",
                        color: "#444",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                      }}
                    >
                      {article.status ?? "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#666", whiteSpace: "nowrap" }}>
                    {formatRelativeTime(article.published_at ?? article.created_at)}
                  </td>
                  <td
                    style={{
                      padding: "0.8rem 1rem 0.8rem 0.75rem",
                      textAlign: "right",
                      color: "#555",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {(article.view_count ?? 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {currentPage && totalPages && totalPages > 1 ? (
        <div
          style={{
            marginTop: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.82rem", color: "#777" }}>
            {totalCount ?? articles.length} article{(totalCount ?? articles.length) === 1 ? "" : "s"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            {previousHref ? (
              <Link href={previousHref} style={pagerLinkStyle}>
                ← Prev
              </Link>
            ) : (
              <span style={{ ...pagerLinkStyle, opacity: 0.45 }}>← Prev</span>
            )}
            <span
              style={{
                padding: "0.38rem 0.7rem",
                borderRadius: "4px",
                background: "#f4f4f4",
                fontSize: "0.8rem",
                color: "#555",
              }}
            >
              {currentPage} / {totalPages}
            </span>
            {nextHref ? (
              <Link href={nextHref} style={pagerLinkStyle}>
                Next →
              </Link>
            ) : (
              <span style={{ ...pagerLinkStyle, opacity: 0.45 }}>Next →</span>
            )}
          </div>
        </div>
      ) : totalCount ? (
        <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: "#777" }}>
          {totalCount} article{totalCount === 1 ? "" : "s"}
        </div>
      ) : null}
    </div>
  );
}

const headerStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.65rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#666",
};

const pagerLinkStyle: CSSProperties = {
  padding: "0.38rem 0.72rem",
  borderRadius: "4px",
  border: "1px solid #ddd",
  color: "#333",
  textDecoration: "none",
  fontSize: "0.8rem",
};
