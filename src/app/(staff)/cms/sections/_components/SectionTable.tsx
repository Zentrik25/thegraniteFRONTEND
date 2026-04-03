"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import CmsToast from "@/components/cms/CmsToast";
import { InlineBadge, primaryButtonStyle } from "@/components/cms/taxonomy-shared";
import type { SectionSummary } from "@/lib/types";
import SectionDeactivateDialog from "./SectionDeactivateDialog";
import SectionFormModal from "./SectionFormModal";

interface SectionTableProps {
  initialSections: SectionSummary[];
  filter: "all" | "primary" | "secondary";
}

export default function SectionTable({ initialSections, filter }: SectionTableProps) {
  const [sections, setSections] = useState(initialSections);
  const [editingSection, setEditingSection] = useState<SectionSummary | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deactivatingSection, setDeactivatingSection] = useState<SectionSummary | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const filterLinks = useMemo(
    () => [
      { key: "all", label: "All", href: "/cms/sections" },
      { key: "primary", label: "Primary", href: "/cms/sections?primary=true" },
      { key: "secondary", label: "Secondary", href: "/cms/sections?primary=false" },
    ],
    [],
  );

  function handleSaved(savedSection: SectionSummary, message: string) {
    setToast(message);
    setSections((prev) => {
      const index = prev.findIndex((item) => item.slug === savedSection.slug);
      if (index === -1) {
        return [savedSection, ...prev].sort(
          (left, right) => (left.display_order ?? 0) - (right.display_order ?? 0),
        );
      }

      const next = [...prev];
      next[index] = {
        ...next[index],
        ...savedSection,
      };
      return next.sort(
        (left, right) => (left.display_order ?? 0) - (right.display_order ?? 0),
      );
    });
    setEditingSection(null);
    setShowCreate(false);
  }

  function handleDeactivated(sectionSlug: string, message: string) {
    setSections((prev) => prev.filter((item) => item.slug !== sectionSlug));
    setDeactivatingSection(null);
    setToast(message);
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {filterLinks.map((item) => {
            const active = item.key === filter;
            return (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  padding: "0.42rem 0.78rem",
                  borderRadius: "999px",
                  textDecoration: "none",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  border: active ? "none" : "1px solid #ddd",
                  background: active ? "#1f2937" : "#fff",
                  color: active ? "#fff" : "#555",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <button type="button" onClick={() => setShowCreate(true)} style={primaryButtonStyle}>
          Create section
        </button>
      </div>

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
            <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #e6e6e6" }}>
              <th style={headerStyle}>Name</th>
              <th style={headerStyle}>Slug</th>
              <th style={headerStyle}>Display Order</th>
              <th style={headerStyle}>Primary</th>
              <th style={headerStyle}>Categories</th>
              <th style={headerStyle}>Articles</th>
              <th style={headerStyle}>Active</th>
              <th style={headerStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: "2.5rem", textAlign: "center", color: "#888" }}>
                  No sections found for this filter.
                </td>
              </tr>
            ) : (
              sections.map((section) => (
                <tr key={section.slug} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <Link
                      href={`/cms/sections/${section.slug}`}
                      style={{
                        fontWeight: 700,
                        color: "#111",
                        textDecoration: "none",
                      }}
                    >
                      {section.name}
                    </Link>
                    {section.description ? (
                      <div style={{ fontSize: "0.77rem", color: "#888", marginTop: "0.18rem" }}>
                        {section.description}
                      </div>
                    ) : null}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <InlineBadge tone="muted">{section.slug}</InlineBadge>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                    {section.display_order ?? 0}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <InlineBadge tone={section.is_primary ? "accent" : "neutral"}>
                      {section.is_primary ? "Primary" : "Secondary"}
                    </InlineBadge>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                    {(section.category_count ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                    {(section.article_count ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <InlineBadge tone={section.is_active === false ? "muted" : "success"}>
                      {section.is_active === false ? "Inactive" : "Active"}
                    </InlineBadge>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setEditingSection(section)}
                        style={linkButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeactivatingSection(section)}
                        style={{ ...linkButtonStyle, color: "#8e1e20" }}
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreate ? (
        <SectionFormModal
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      ) : null}

      {editingSection ? (
        <SectionFormModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {deactivatingSection ? (
        <SectionDeactivateDialog
          section={deactivatingSection}
          onClose={() => setDeactivatingSection(null)}
          onDeactivated={handleDeactivated}
        />
      ) : null}

      {toast ? <CmsToast message={toast} onDismiss={() => setToast(null)} /> : null}
    </>
  );
}

const headerStyle: CSSProperties = {
  textAlign: "left",
  padding: "0.7rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#666",
};

const linkButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  fontSize: "0.82rem",
  fontWeight: 700,
  color: "var(--accent)",
};
