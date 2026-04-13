"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import CmsToast from "@/components/cms/CmsToast";
import { InlineBadge, primaryButtonStyle } from "@/components/cms/taxonomy-shared";
import type { TagSummary } from "@/lib/types";
import TagCloud from "./TagCloud";
import TagDeleteDialog from "./TagDeleteDialog";
import TagFormModal from "./TagFormModal";

interface TagTableProps {
  initialTags: TagSummary[];
}

export default function TagTable({ initialTags }: TagTableProps) {
  const [tags, setTags] = useState(initialTags);
  const [editingTag, setEditingTag] = useState<TagSummary | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagSummary | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  function sortTags(nextTags: TagSummary[]) {
    return [...nextTags].sort((left, right) => left.name.localeCompare(right.name));
  }

  function handleSaved(tag: TagSummary, message: string) {
    setTags((prev) => {
      const index = prev.findIndex((item) => item.slug === tag.slug);
      if (index === -1) return sortTags([tag, ...prev]);
      const next = [...prev];
      next[index] = { ...next[index], ...tag };
      return sortTags(next);
    });
    setEditingTag(null);
    setShowCreate(false);
    setToast(message);
  }

  function handleDeleted(tagSlug: string, message: string) {
    setTags((prev) => prev.filter((item) => item.slug !== tagSlug));
    setDeletingTag(null);
    setToast(message);
  }

  async function handleBulkCreate(e: FormEvent) {
    e.preventDefault();
    const names = bulkInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    setBulkSaving(true);
    setBulkError(null);

    const created: TagSummary[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    await Promise.all(
      names.map(async (name) => {
        try {
          const res = await fetch("/api/staff/tags/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });
          const body = (await res.json().catch(() => ({}))) as TagSummary & { detail?: string };
          if (res.ok) {
            created.push({ ...body, article_count: 0 });
          } else if (res.status === 400) {
            // Likely a duplicate — treat as skipped
            skipped.push(name);
          } else {
            failed.push(name);
          }
        } catch {
          failed.push(name);
        }
      }),
    );

    if (created.length > 0) {
      setTags((prev) => sortTags([...prev, ...created]));
    }

    setBulkSaving(false);
    setBulkInput("");
    bulkInputRef.current?.focus();

    const parts: string[] = [];
    if (created.length) parts.push(`${created.length} tag${created.length !== 1 ? "s" : ""} created`);
    if (skipped.length) parts.push(`${skipped.length} already existed`);
    if (failed.length) {
      setBulkError(`Failed to create: ${failed.join(", ")}`);
    } else {
      setToast(parts.join(", ") + ".");
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <section
          style={{
            background: "linear-gradient(180deg, #fff9f5 0%, #fff 100%)",
            border: "1px solid #eddccf",
            borderRadius: "10px",
            padding: "1.1rem 1.15rem",
          }}
        >
          <div style={{ marginBottom: "0.9rem" }}>
            <h2 style={{ margin: 0, fontSize: "0.88rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#77584b" }}>
              Tag Cloud
            </h2>
            <p style={{ margin: "0.35rem 0 0.75rem", color: "#8c6b5d", fontSize: "0.82rem" }}>
              Click any tag to inspect its article feed.
            </p>
            {/* Bulk create */}
            <form onSubmit={handleBulkCreate} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                ref={bulkInputRef}
                type="text"
                value={bulkInput}
                onChange={(e) => { setBulkInput(e.target.value); setBulkError(null); }}
                placeholder="e.g. elections, harare, economy"
                style={{
                  flex: "1 1 200px",
                  padding: "0.4rem 0.65rem",
                  border: "1px solid #d4b9ad",
                  borderRadius: "6px",
                  fontSize: "0.84rem",
                  background: "#fff",
                  color: "#222",
                  minWidth: 0,
                }}
              />
              <button
                type="submit"
                disabled={bulkSaving || bulkInput.trim() === ""}
                style={{ ...primaryButtonStyle, opacity: bulkSaving ? 0.7 : 1, whiteSpace: "nowrap" }}
              >
                {bulkSaving ? "Adding…" : "Add tags"}
              </button>
            </form>
            {bulkError && (
              <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem", color: "#8e1e20" }}>{bulkError}</p>
            )}
            <p style={{ margin: "0.3rem 0 0", fontSize: "0.73rem", color: "#9b7260" }}>
              Separate multiple tags with commas. Duplicates are skipped automatically.
            </p>
          </div>
          <TagCloud tags={tags} />
        </section>

        <section>
          <h2
            style={{
              margin: "0 0 0.75rem",
              fontSize: "0.82rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#666",
            }}
          >
            Tag Management
          </h2>
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
                  <th style={headerStyle}>Articles</th>
                  <th style={headerStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "2.5rem", textAlign: "center", color: "#888" }}>
                      No tags yet.
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.slug} style={{ borderBottom: "1px solid #f2f2f2" }}>
                      <td style={{ padding: "0.8rem 1rem" }}>
                        <Link
                          href={`/cms/tags/${tag.slug}`}
                          style={{ textDecoration: "none" }}
                        >
                          <InlineBadge tone="accent">{tag.name}</InlineBadge>
                        </Link>
                      </td>
                      <td style={{ padding: "0.8rem 0.75rem" }}>
                        <InlineBadge tone="muted">{tag.slug}</InlineBadge>
                      </td>
                      <td style={{ padding: "0.8rem 0.75rem", color: "#555" }}>
                        {(tag.article_count ?? 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.8rem 0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                          <button
                            type="button"
                            onClick={() => setEditingTag(tag)}
                            style={linkButtonStyle}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingTag(tag)}
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
        </section>
      </div>

      {showCreate ? (
        <TagFormModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      ) : null}

      {editingTag ? (
        <TagFormModal
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSaved={handleSaved}
        />
      ) : null}

      {deletingTag ? (
        <TagDeleteDialog
          tag={deletingTag}
          onClose={() => setDeletingTag(null)}
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
