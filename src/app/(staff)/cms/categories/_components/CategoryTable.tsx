"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import CmsToast from "@/components/cms/CmsToast";
import { InlineBadge, primaryButtonStyle } from "@/components/cms/taxonomy-shared";
import type { CategorySummary, SectionSummary } from "@/lib/types";
import CategoryDeleteDialog from "./CategoryDeleteDialog";
import CategoryFormModal from "./CategoryFormModal";

interface CategoryTableProps {
  initialCategories: CategorySummary[];
  sections: SectionSummary[];
}

function truncate(text?: string, length = 60) {
  if (!text) return "—";
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

export default function CategoryTable({
  initialCategories,
  sections,
}: CategoryTableProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategorySummary | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  function handleSaved(category: CategorySummary, message: string) {
    setCategories((prev) => {
      const index = prev.findIndex((item) => item.slug === category.slug);
      if (index === -1) return [category, ...prev];
      const next = [...prev];
      next[index] = { ...next[index], ...category };
      return next;
    });

    setEditingCategory(null);
    setShowCreate(false);
    setToast(message);
  }

  function handleDeleted(categorySlug: string, message: string) {
    setCategories((prev) => prev.filter((item) => item.slug !== categorySlug));
    setDeletingCategory(null);
    setToast(message);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button type="button" onClick={() => setShowCreate(true)} style={primaryButtonStyle}>
          Create category
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
              <th style={headerStyle}>Section</th>
              <th style={headerStyle}>Description</th>
              <th style={headerStyle}>OG Image</th>
              <th style={headerStyle}>Articles</th>
              <th style={headerStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "#888" }}>
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.slug} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: "0.8rem 1rem" }}>
                    <Link
                      href={`/cms/categories/${category.slug}`}
                      style={{ fontWeight: 700, color: "#111", textDecoration: "none" }}
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <InlineBadge tone="muted">{category.slug}</InlineBadge>
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    {category.section_name ? (
                      <InlineBadge tone="accent">{category.section_name}</InlineBadge>
                    ) : (
                      <span style={{ color: "#999" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555", maxWidth: "320px" }}>
                    {truncate(category.description)}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                    {category.og_image_url ? "✓" : "—"}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                    {(category.article_count ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "0.8rem 0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(category)}
                        style={linkButtonStyle}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(category)}
                        style={{ ...linkButtonStyle, color: "#8e1e20" }}
                      >
                        Delete
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
        <CategoryFormModal
          sections={sections}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      ) : null}

      {editingCategory ? (
        <CategoryFormModal
          category={editingCategory}
          sections={sections}
          onClose={() => setEditingCategory(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {deletingCategory ? (
        <CategoryDeleteDialog
          category={deletingCategory}
          onClose={() => setDeletingCategory(null)}
          onDeleted={handleDeleted}
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
