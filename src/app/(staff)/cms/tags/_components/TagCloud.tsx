"use client";

import Link from "next/link";
import type { TagSummary } from "@/lib/types";

interface TagCloudProps {
  tags: TagSummary[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  if (tags.length === 0) {
    return (
      <div
        style={{
          padding: "1rem 0",
          color: "#888",
          fontSize: "0.9rem",
        }}
      >
        No tags yet.
      </div>
    );
  }

  const maxCount = Math.max(...tags.map((tag) => tag.article_count ?? 0), 1);

  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
      {tags.map((tag) => {
        const weight = (tag.article_count ?? 0) / maxCount;
        return (
          <Link
            key={tag.slug}
            href={`/cms/tags/${tag.slug}`}
            style={{
              textDecoration: "none",
              padding: `${0.42 + weight * 0.18}rem ${0.7 + weight * 0.3}rem`,
              borderRadius: "999px",
              background: "#fff",
              border: "1px solid #e1d3c7",
              color: "#503d32",
              fontSize: `${0.8 + weight * 0.12}rem`,
              fontWeight: 700,
              boxShadow: weight > 0.5 ? "0 6px 18px rgba(152, 27, 30, 0.08)" : "none",
            }}
          >
            {tag.name}
            <span style={{ marginLeft: "0.35rem", color: "#9a6b58" }}>
              {tag.article_count ?? 0}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
