import Link from "next/link";

import type { SectionSummary } from "@/lib/types";

export function SectionNav({ sections }: { sections: SectionSummary[] }) {
  if (sections.length === 0) return null;

  return (
    <div className="section-block-grid">
      {sections.map((section) => (
        <div className="section-block-item" key={section.slug}>
          <h3 className="section-block-title">
            <Link href={`/sections/${section.slug}`}>{section.name}</Link>
          </h3>
          {section.description && (
            <p className="meta" style={{ fontSize: "0.78rem", lineHeight: 1.4 }}>
              {section.description}
            </p>
          )}
          <Link
            className="section-block-more"
            href={`/sections/${section.slug}`}
          >
            {section.article_count ? `${section.article_count} stories →` : "View all →"}
          </Link>
        </div>
      ))}
    </div>
  );
}
