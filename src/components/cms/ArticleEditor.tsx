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

/**
 * Convert a backend media URL (http://127.0.0.1:8000/media/...)
 * to the browser-reachable proxy path (/api/media/...).
 * Non-media URLs (e.g. CDN, Unsplash) are returned unchanged.
 */
function toProxyUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/media/")) {
      // Strip leading "/media" — the proxy route at /api/media/[...path] adds it back.
      return `/api/media${parsed.pathname.slice("/media".length)}`;
    }
  } catch {
    // Relative path or already proxied — use as-is.
  }
  return url;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Recursively flatten DRF validation error dicts into a readable string. */
function flattenErrors(body: unknown): string {
  if (!body || typeof body !== "object") return String(body ?? "Save failed.");
  return Object.entries(body as Record<string, unknown>)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
      if (typeof v === "object") return `${k}: ${flattenErrors(v)}`;
      return `${k}: ${v}`;
    })
    .join(" | ");
}

// ArticleWriteSerializer accepted fields (for reference):
// title, excerpt, body, status, category (PK), tags (PK[]), is_breaking,
// top_story_rank, featured_rank, image_url, image_alt, image_caption,
// image_credit, og_title, og_description, og_image_url, canonical_url.
// Read-only: slug, published_at, seo_title, seo_description, is_featured.

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

    // Build a payload that matches ArticleWriteSerializer exactly.
    // - category: integer PK or null (the only nullable FK)
    // - tags: array of integer PKs
    // - all CharField/URLField fields must be "" not null (blank=True, no null=True on model)
    const payload: Record<string, unknown> = {
      title: fields.title,
      excerpt: fields.excerpt,
      body: fields.body,
      status: fields.status,
      category: fields.category ? Number(fields.category) : null,
      tags: Array.from(selectedTags).map(Number),
      is_breaking: fields.is_breaking,
      image_url: fields.image_url,
      image_alt: fields.image_alt,
      og_title: fields.og_title,
      og_description: fields.og_description,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        const msg = flattenErrors(body);
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
                style={inputStyle}
                placeholder="Article headline"
                onChange={(e) => update("title", e.target.value)}
              />
              {!isEdit && fields.title && (
                <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.2rem" }}>
                  Slug: {slugify(fields.title)}
                </div>
              )}
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
              src={toProxyUrl(fields.image_url)}
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
          <label
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
              checked={fields.is_breaking}
              onChange={(e) => update("is_breaking", e.target.checked)}
            />
            Breaking news
          </label>
        </div>

        {/* ── Open Graph (collapsible) ─────────────────────────────────── */}
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
            <span>{showSeo ? "▾" : "▸"}</span> Open Graph overrides
            <span style={{ fontWeight: 400, color: "#999", fontSize: "0.8rem" }}>
              (optional — falls back to title / excerpt)
            </span>
          </button>

          {showSeo && (
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={labelStyle}>OG title</label>
                <input
                  type="text"
                  value={fields.og_title}
                  onChange={(e) => update("og_title", e.target.value)}
                  style={inputStyle}
                  maxLength={95}
                  placeholder="Overrides headline in og:title / WhatsApp preview"
                />
              </div>
              <div>
                <label style={labelStyle}>OG description (≤160 chars)</label>
                <textarea
                  rows={2}
                  value={fields.og_description}
                  onChange={(e) => update("og_description", e.target.value)}
                  style={{ ...inputStyle, resize: "vertical" }}
                  maxLength={160}
                  placeholder="og:description shown in social previews"
                />
                <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "0.2rem" }}>
                  {fields.og_description.length}/160
                </div>
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
