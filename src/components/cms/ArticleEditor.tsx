"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ArticleDetail, CategorySummary, TagSummary } from "@/lib/types";

interface ArticleEditorProps {
  article?: ArticleDetail;
  categories: CategorySummary[];
  tags: TagSummary[];
}

export default function ArticleEditor({ article, categories, tags }: ArticleEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(article?.id);

  const [fields, setFields] = useState({
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    body: article?.body ?? "",
    category: article?.category?.id?.toString() ?? "",
    status: article?.status ?? "draft",
    is_breaking: article?.is_breaking ?? false,
    is_premium: article?.is_premium ?? false,
    is_featured: article?.is_featured ?? false,
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const url = isEdit
      ? `/api/staff/articles/${article!.id}/`
      : "/api/staff/articles/";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          category: fields.category || null,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        const msg =
          typeof body === "object"
            ? Object.entries(body)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ")
            : body.error ?? "Save failed.";
        setError(msg);
        return;
      }

      router.push("/cms/articles");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.9rem",
    boxSizing: "border-box",
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "0.8rem",
    display: "block",
    marginBottom: "0.3rem",
    color: "#444",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "900px" }}
    >
      {error && (
        <div
          role="alert"
          style={{
            background: "#fff0f0",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label style={labelStyle}>Title *</label>
        <input
          type="text"
          required
          value={fields.title}
          onChange={(e) => {
            update("title", e.target.value);
            if (!isEdit) {
              update(
                "slug",
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")
              );
            }
          }}
          style={inputStyle}
          placeholder="Article headline"
        />
      </div>

      <div>
        <label style={labelStyle}>Slug *</label>
        <input
          type="text"
          required
          value={fields.slug}
          onChange={(e) => update("slug", e.target.value)}
          style={inputStyle}
          pattern="[a-z0-9-]+"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={fields.category}
            onChange={(e) => update("category", e.target.value)}
            style={{ ...inputStyle }}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={fields.status}
            onChange={(e) => update("status", e.target.value)}
            style={{ ...inputStyle }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Excerpt</label>
        <textarea
          rows={3}
          value={fields.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          style={{ ...inputStyle, resize: "vertical" }}
          placeholder="Short summary shown in article listings"
        />
      </div>

      <div>
        <label style={labelStyle}>Body (HTML) *</label>
        <textarea
          rows={20}
          required
          value={fields.body}
          onChange={(e) => update("body", e.target.value)}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.85rem", resize: "vertical" }}
          placeholder="<p>Article content…</p>"
        />
      </div>

      {/* Flags */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {(
          [
            ["is_breaking", "Breaking news"],
            ["is_premium", "Premium (paywalled)"],
            ["is_featured", "Featured"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={fields[key] as boolean}
              onChange={(e) => update(key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.625rem 1.5rem",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "0.9rem",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create article"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/cms/articles")}
          style={{
            background: "transparent",
            border: "1px solid #ddd",
            padding: "0.625rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
