"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ArticleDetail, CategorySummary, TagSummary } from "@/lib/types";
import MediaPicker from "@/components/cms/MediaPicker";

interface ArticleEditorProps {
  article?: ArticleDetail;
  categories: CategorySummary[];
  tags: TagSummary[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ArticleEditor({ article, categories, tags }: ArticleEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(article?.id);

  // Only fields accepted by ArticleWriteSerializer on the backend.
  // Excluded: slug (read-only), is_premium/is_featured (computed), seo_title/seo_description (read-only),
  // scheduled_at (not a model field).
  const [fields, setFields] = useState({
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    body: article?.body ?? "",
    category: article?.category?.id?.toString() ?? "",
    status: article?.status ?? "draft",
    image_url: article?.image_url ?? "",
    image_alt: article?.image_alt ?? "",
    is_breaking: article?.is_breaking ?? false,
    og_title: article?.og_title ?? "",
    og_description: article?.og_description ?? "",
  });

  const initialTagIds = new Set(
    (article?.tags ?? []).map((t) => String(t.id)),
  );
  const [selectedTags, setSelectedTags] = useState<Set<string>>(initialTagIds);

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showSeo, setShowSeo] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const url = isEdit
      ? `/api/staff/articles/${article!.slug}/`
      : "/api/staff/articles/";
    const method = isEdit ? "PATCH" : "POST";

    const payload: Record<string, unknown> = {
      ...fields,
      category: fields.category || null,
      tags: Array.from(selectedTags),
      scheduled_at: fields.status === "scheduled" && fields.scheduled_at
        ? fields.scheduled_at
        : null,
    };

    // Remove empty SEO strings so the backend uses its own defaults.
    (["og_title", "og_description", "seo_title", "seo_description"] as const).forEach((k) => {
      if (!payload[k]) payload[k] = null;
    });
    if (!payload.image_url) payload.image_url = null;
    if (!payload.image_alt) payload.image_alt = null;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        const msg =
          typeof body === "object"
            ? Object.entries(body)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ")
            : String(body.error ?? "Save failed.");
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

  const sectionStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    padding: "1.25rem",
  };

  return (
    <>
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

        {/* ── Core fields ─────────────────────────────────────────────── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input
                type="text"
                required
                value={fields.title}
                onChange={(e) => {
                  update("title", e.target.value);
                  if (!isEdit) update("slug", slugify(e.target.value));
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
                title="Lowercase letters, numbers, and hyphens only"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={fields.category}
                  onChange={(e) => update("category", e.target.value)}
                  style={inputStyle}
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
                  style={inputStyle}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {fields.status === "scheduled" && (
              <div>
                <label style={labelStyle}>Publish at *</label>
                <input
                  type="datetime-local"
                  required
                  value={fields.scheduled_at}
                  onChange={(e) => update("scheduled_at", e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

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
          </div>
        </div>

        {/* ── Hero image ──────────────────────────────────────────────── */}
        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Hero image</span>
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              style={{
                background: "var(--ink)",
                color: "#fff",
                border: "none",
                padding: "0.35rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Browse media
            </button>
          </div>

          {fields.image_url && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={fields.image_url}
              alt={fields.image_alt || "Hero preview"}
              style={{
                width: "100%",
                maxHeight: "240px",
                objectFit: "cover",
                borderRadius: "4px",
                marginBottom: "0.75rem",
                border: "1px solid #e0e0e0",
              }}
            />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Image URL</label>
              <input
                type="url"
                value={fields.image_url}
                onChange={(e) => update("image_url", e.target.value)}
                style={inputStyle}
                placeholder="https://…"
              />
            </div>
            <div>
              <label style={labelStyle}>Alt text</label>
              <input
                type="text"
                value={fields.image_alt}
                onChange={(e) => update("image_alt", e.target.value)}
                style={inputStyle}
                placeholder="Describe the image for screen readers"
              />
            </div>
          </div>
        </div>

        {/* ── Tags ────────────────────────────────────────────────────── */}
        {tags.length > 0 && (
          <div style={sectionStyle}>
            <label style={{ ...labelStyle, marginBottom: "0.6rem" }}>Tags</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {tags.map((t) => {
                const checked = selectedTags.has(String(t.id));
                return (
                  <label
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "999px",
                      border: `1px solid ${checked ? "var(--accent)" : "#ddd"}`,
                      background: checked ? "#ffe8e8" : "#fafafa",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTag(String(t.id))}
                      style={{ display: "none" }}
                    />
                    {t.name}
                  </label>
                );
              })}
            </div>
            {selectedTags.size > 0 && (
              <div style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "#888" }}>
                {selectedTags.size} tag{selectedTags.size !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        {/* ── Flags ───────────────────────────────────────────────────── */}
        <div style={sectionStyle}>
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
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
        </div>

        {/* ── SEO (collapsible) ────────────────────────────────────────── */}
        <div style={sectionStyle}>
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "#333",
            }}
          >
            <span>{showSeo ? "▾" : "▸"}</span> SEO &amp; Open Graph
            <span style={{ fontWeight: 400, color: "#999", fontSize: "0.8rem" }}>
              (optional — falls back to title / excerpt)
            </span>
          </button>

          {showSeo && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>SEO title</label>
                  <input
                    type="text"
                    value={fields.seo_title}
                    onChange={(e) => update("seo_title", e.target.value)}
                    style={inputStyle}
                    maxLength={70}
                    placeholder="Overrides headline in &lt;title&gt;"
                  />
                </div>
                <div>
                  <label style={labelStyle}>OG title</label>
                  <input
                    type="text"
                    value={fields.og_title}
                    onChange={(e) => update("og_title", e.target.value)}
                    style={inputStyle}
                    maxLength={95}
                    placeholder="Overrides headline in og:title"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>SEO description</label>
                <textarea
                  rows={2}
                  value={fields.seo_description}
                  onChange={(e) => update("seo_description", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  maxLength={160}
                  placeholder="Meta description (≤160 chars)"
                />
              </div>
              <div>
                <label style={labelStyle}>OG description</label>
                <textarea
                  rows={2}
                  value={fields.og_description}
                  onChange={(e) => update("og_description", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  maxLength={200}
                  placeholder="og:description shown in social previews"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ─────────────────────────────────────────────────── */}
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

          {isEdit && fields.status !== "draft" && (
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError(null);
                try {
                  const res = await fetch(`/api/staff/articles/${article!.slug}/`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "draft" }),
                  });
                  if (res.ok) {
                    update("status", "draft");
                    router.refresh();
                  } else {
                    setError("Could not revert to draft.");
                  }
                } catch {
                  setError("Network error.");
                } finally {
                  setSaving(false);
                }
              }}
              style={{
                background: "#fff3cd",
                color: "#856404",
                border: "1px solid #ffc107",
                padding: "0.625rem 1rem",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              Revert to draft
            </button>
          )}

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

      {/* Media picker modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => {
            update("image_url", url);
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
