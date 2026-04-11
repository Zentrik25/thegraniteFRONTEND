"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ArticleDetail, ArticleSummary, CategorySummary, TagSummary, StaffMember, TopStorySlot } from "@/lib/types";
import MediaPicker from "@/components/cms/MediaPicker";
import { RichTextEditor } from "@/components/staff/RichTextEditor";
import { FormSection } from "@/components/staff/FormSection";
import { revalidateAfterPublish } from "@/lib/actions/revalidate";

// ─── Slot picker helpers ────────────────────────────────────────────────────

type FeaturedSlot = { rank: number; article: ArticleSummary | null };

function SlotGrid({
  slots,
  selectedRank,
  onSelect,
  currentSlug,
}: {
  slots: { rank: number; article: ArticleSummary | null }[];
  selectedRank: string;
  onSelect: (rank: string) => void;
  currentSlug?: string;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.4rem", marginTop: "0.5rem" }}>
      {slots.map(({ rank, article }) => {
        const isMine = article?.slug === currentSlug;
        const isTaken = Boolean(article) && !isMine;
        const isSelected = selectedRank === String(rank);
        return (
          <button
            key={rank}
            type="button"
            onClick={() => onSelect(isSelected ? "" : String(rank))}
            title={article ? article.title : `Slot ${rank} — empty`}
            style={{
              padding: "0.45rem 0.3rem",
              borderRadius: "6px",
              border: `2px solid ${isSelected ? "#981b1e" : isMine ? "#2563eb" : isTaken ? "#e5a000" : "#d1d5db"}`,
              background: isSelected ? "#981b1e" : isMine ? "#eff6ff" : isTaken ? "#fffbeb" : "#f9fafb",
              color: isSelected ? "#fff" : isMine ? "#1d4ed8" : isTaken ? "#92400e" : "#374151",
              fontWeight: 700,
              fontSize: "0.75rem",
              cursor: "pointer",
              textAlign: "center",
              lineHeight: 1.2,
              transition: "all 0.12s",
            }}
          >
            <div style={{ fontSize: "1rem", marginBottom: "0.15rem" }}>#{rank}</div>
            <div style={{
              fontSize: "0.6rem",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              opacity: 0.85,
            }}>
              {isMine ? "this" : isTaken ? "taken" : "empty"}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface ArticleEditorProps {
  article?: ArticleDetail;
  categories: CategorySummary[];
  tags: TagSummary[];
  authors: StaffMember[];
}

function toProxyUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.pathname.startsWith("/media/")) {
      return `/api/media${parsed.pathname.slice("/media".length)}`;
    }
  } catch { /* relative or already proxied */ }
  return url;
}

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

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

function authorLabel(a: StaffMember): string {
  if (a.display_name) return a.display_name;
  const parts = [a.first_name, a.last_name].filter(Boolean).join(" ");
  return parts || (a.email ?? String(a.id));
}

// ─── Field state ───────────────────────────────────────────────────────────

type Fields = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: string;
  author: string;
  category: string;
  is_breaking: boolean;
  is_top_story: boolean;
  is_featured: boolean;
  top_story_rank: string;
  featured_rank: string;
  image_url: string;
  image_alt: string;
  image_caption: string;
  image_credit: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  canonical_url: string;
  seo_title: string;
  seo_description: string;
};

function initFields(article?: ArticleDetail): Fields {
  return {
    title:          article?.title          ?? "",
    slug:           article?.slug           ?? "",
    excerpt:        article?.excerpt        ?? "",
    body:           article?.body           ?? "",
    // Backend may return display value "Published" — always normalize to lowercase
    status:         (article?.status ?? "draft").toLowerCase(),
    author:         article?.author?.id?.toString() ?? "",
    category:       article?.category?.id?.toString() ?? "",
    is_breaking:    article?.is_breaking    ?? false,
    is_top_story:   article?.is_top_story   ?? false,
    is_featured:    article?.is_featured    ?? false,
    top_story_rank: article?.top_story_rank?.toString() ?? "",
    featured_rank:  article?.featured_rank?.toString()  ?? "",
    image_url:      article?.image_url      ?? "",
    image_alt:      article?.image_alt      ?? "",
    image_caption:  article?.image_caption  ?? "",
    image_credit:   article?.image_credit   ?? "",
    og_title:       article?.og_title       ?? "",
    og_description: article?.og_description ?? "",
    og_image_url:   article?.og_image_url   ?? "",
    canonical_url:  article?.canonical_url  ?? "",
    seo_title:      article?.seo_title      ?? "",
    seo_description:article?.seo_description ?? "",
  };
}

// ─── Shared styles ─────────────────────────────────────────────────────────

const inputS: React.CSSProperties = {
  width: "100%",
  padding: "0.45rem 0.65rem",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "0.85rem",
  background: "#fff",
  color: "#222",
  boxSizing: "border-box",
};

const labelS: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.75rem",
  display: "block",
  marginBottom: "0.25rem",
  color: "#444",
};

const hintS: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "#aaa",
  marginTop: "0.2rem",
  lineHeight: 1.4,
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <label style={labelS}>{label}</label>
      {children}
      {hint && <span style={hintS}>{hint}</span>}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
  accent,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent?: boolean;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        fontSize: "0.85rem",
        fontWeight: 600,
        color: accent && checked ? "#c00" : checked ? "#155724" : "#444",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 15, height: 15, cursor: "pointer" }}
      />
      {label}
    </label>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ArticleEditor({ article, categories, tags, authors }: ArticleEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(article?.id);

  const [fields, setFields] = useState<Fields>(() => initFields(article));
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    () => new Set((article?.tags ?? []).map((t) => String(t.id))),
  );
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Synchronous guard — prevents double-submit when React state update is not yet flushed
  const savingRef = useRef(false);
  // Track the current slug used in the PATCH URL — updates when backend confirms a slug change
  const currentSlugRef = useRef<string>(article?.slug ?? "");

  // Live slot data fetched from backend on mount
  const [featuredSlots, setFeaturedSlots] = useState<FeaturedSlot[]>(
    Array.from({ length: 5 }, (_, i) => ({ rank: i + 1, article: null }))
  );
  const [topStorySlots, setTopStorySlots] = useState<TopStorySlot[]>(
    Array.from({ length: 5 }, (_, i) => ({ rank: i + 1, article: null }))
  );
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    async function loadSlots() {
      setSlotsLoading(true);
      try {
        const [featRes, topRes] = await Promise.all([
          fetch("/api/staff/articles/featured/").then(r => r.ok ? r.json() : null).catch(() => null),
          fetch("/api/staff/articles/top-stories/").then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        // Build 5 featured slots
        const featArr: ArticleSummary[] = Array.isArray(featRes)
          ? featRes
          : Array.isArray(featRes?.results) ? featRes.results : [];
        const fSlots: FeaturedSlot[] = Array.from({ length: 5 }, (_, i) => {
          const rank = i + 1;
          const art = featArr.find((a) => a.featured_rank === rank || a.featured_rank === String(rank)) ?? null;
          return { rank, article: art };
        });
        setFeaturedSlots(fSlots);

        // Build 5 top story slots
        const topArr: TopStorySlot[] = Array.isArray(topRes)
          ? topRes
          : Array.isArray(topRes?.results) ? topRes.results : [];
        const tSlots: TopStorySlot[] = Array.from({ length: 5 }, (_, i) => {
          const rank = i + 1;
          const found = topArr.find((s) => s.rank === rank);
          return { rank, article: found?.article ?? null };
        });
        setTopStorySlots(tSlots);
      } catch {
        // best-effort — slots stay empty
      } finally {
        setSlotsLoading(false);
      }
    }
    void loadSlots();
  }, []);

  function set<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  const handleBodyChange = useCallback((html: string) => {
    setFields((p) => ({ ...p, body: html }));
    setSaved(false);
  }, []);

  function toggleTag(id: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSaved(false);
  }

  function buildPayload(overrideStatus?: string) {
    const status = (overrideStatus ?? fields.status).toLowerCase();
    return {
      title:          fields.title,
      slug:           fields.slug || slugify(fields.title),
      excerpt:        fields.excerpt,
      body:           fields.body,
      status,
      author:         fields.author ? Number(fields.author) : null,
      category:       fields.category ? Number(fields.category) : null,
      tags:           Array.from(selectedTags).map(Number),
      is_breaking:    fields.is_breaking,
      is_top_story:   fields.is_top_story,
      is_featured:    fields.is_featured,
      // If featured/top-story is enabled but user hasn't picked a slot,
      // default to rank 1 so the backend flag actually sticks.
      top_story_rank: fields.is_top_story
        ? (fields.top_story_rank !== "" ? Number(fields.top_story_rank) : 1)
        : null,
      featured_rank:  fields.is_featured
        ? (fields.featured_rank !== "" ? Number(fields.featured_rank) : 1)
        : null,
      image_url:      fields.image_url || null,
      image_alt:      fields.image_alt,
      image_caption:  fields.image_caption,
      image_credit:   fields.image_credit,
      og_title:       fields.og_title,
      og_description: fields.og_description,
      og_image_url:   fields.og_image_url || null,
      canonical_url:  fields.canonical_url || null,
      seo_title:      fields.seo_title,
      seo_description:fields.seo_description,
    };
  }

  async function save(overrideStatus?: string) {
    // Synchronous check — prevents concurrent saves regardless of React batching
    if (savingRef.current) return;
    savingRef.current = true;

    setError(null);
    setSaving(true);
    setSaved(false);

    // Use the ref so PATCH always targets the slug the backend currently knows about,
    // even if the user has already changed the slug field locally.
    const url    = isEdit ? `/api/staff/articles/${currentSlugRef.current}/` : "/api/staff/articles/";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(overrideStatus)),
      });
      const data = await res.json();

      if (!res.ok) { setError(flattenErrors(data)); return; }

      // Sync status AND slug from backend response so the form always reflects
      // what the backend actually saved (backend may normalize or reject the slug).
      const savedStatus = (overrideStatus ?? fields.status).toLowerCase();
      const backendSlug: string | undefined = typeof data.slug === "string" ? data.slug : undefined;

      setFields((p) => ({
        ...p,
        status: savedStatus,
        ...(backendSlug ? { slug: backendSlug } : {}),
      }));
      setSaved(true);

      // Keep the ref in sync so subsequent saves use the correct URL.
      if (backendSlug) currentSlugRef.current = backendSlug;

      // Purge ISR cache whenever article is published or unpublished so the
      // homepage and section pages reflect the change immediately.
      if (savedStatus === "published" || overrideStatus === "draft" || overrideStatus === "archived") {
        const cat = categories.find((c) => String(c.id) === fields.category);
        revalidateAfterPublish({
          articleSlug: backendSlug ?? currentSlugRef.current ?? null,
          categorySlug: cat?.slug ?? null,
        }).catch(() => {});
      }

      // Navigate to the new edit URL when slug changes (new article, or backend confirmed slug edit).
      const prevSlug = article?.slug ?? "";
      if (backendSlug && backendSlug !== prevSlug) {
        router.replace(`/cms/articles/${backendSlug}/edit`);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function handlePublish() {
    await save("published");
  }

  async function handleRevertDraft() {
    await save("draft");
  }

  async function handleArchive() {
    if (!isEdit || savingRef.current) return;
    if (!confirm("Archive this article? It will be unpublished and hidden from readers.")) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/articles/${article!.slug}/`, { method: "DELETE" });
      if (res.ok) { router.push("/cms/articles"); router.refresh(); }
      else setError("Could not archive article.");
    } catch { setError("Network error."); }
    finally { savingRef.current = false; setSaving(false); }
  }

  const isDraft     = fields.status === "draft";
  const isPublished = fields.status === "published";
  const isArchived  = fields.status === "archived";

  return (
    <>
      {/* ── Sticky top action bar ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: "1px solid #e0e0e0",
          padding: "0.6rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginLeft: "-1.5rem",
          marginRight: "-1.5rem",
          marginTop: "-1.5rem",
          marginBottom: "1.25rem",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/cms/articles")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", color: "#888", padding: "0.25rem 0", display: "flex", alignItems: "center", gap: "0.3rem" }}
        >
          ← Articles
        </button>

        <span style={{ flex: 1, fontSize: "0.8rem", color: "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {fields.title || (isEdit ? "Editing article" : "New article")}
        </span>

        {saved && <span style={{ fontSize: "0.78rem", color: "#28a745" }}>✓ Saved</span>}

        {isEdit && !isArchived && (
          <button type="button" onClick={handleArchive} disabled={saving}
            style={{ background: "transparent", border: "1px solid #e0e0e0", color: "#c00", padding: "0.38rem 0.8rem", borderRadius: "4px", fontSize: "0.8rem", cursor: saving ? "not-allowed" : "pointer" }}>
            Archive
          </button>
        )}

        {isEdit && isPublished && (
          <button type="button" onClick={handleRevertDraft} disabled={saving}
            style={{ background: "#fff3cd", border: "1px solid #ffc107", color: "#856404", padding: "0.38rem 0.8rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.8rem", cursor: saving ? "not-allowed" : "pointer" }}>
            Revert to draft
          </button>
        )}

        <button type="button" onClick={() => save()} disabled={saving}
          style={{ background: "#f0f0f0", border: "1px solid #ddd", color: "#333", padding: "0.38rem 1rem", borderRadius: "4px", fontWeight: 600, fontSize: "0.8rem", cursor: saving ? "not-allowed" : "pointer" }}>
          {saving ? "Saving…" : isEdit ? "Save" : "Save draft"}
        </button>

        {(isDraft || isArchived) && (
          <button type="button" onClick={handlePublish} disabled={saving}
            style={{ background: "#155724", color: "#fff", border: "none", padding: "0.38rem 1rem", borderRadius: "4px", fontWeight: 700, fontSize: "0.8rem", cursor: saving ? "not-allowed" : "pointer" }}>
            Publish
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div role="alert" style={{ background: "#fff0f0", border: "1px solid #f5c6cb", color: "#721c24", padding: "0.7rem 1rem", borderRadius: "4px", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {/* ── 2-column layout ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem", alignItems: "start" }}
      >
        {/* ══ LEFT — content ══════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Content */}
          <FormSection title="Content">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <Field label="Title *">
                <input
                  type="text"
                  required
                  value={fields.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFields((p) => ({
                      ...p,
                      title,
                      // Auto-generate slug from title only while slug hasn't been manually edited
                      slug: !isEdit && !p.slug ? slugify(title) : p.slug,
                    }));
                    setSaved(false);
                  }}
                  style={{ ...inputS, fontSize: "1rem", padding: "0.55rem 0.75rem", fontWeight: 600 }}
                  placeholder="Article headline"
                />
              </Field>

              <Field label="Slug" hint={isEdit ? "Changing the slug on a published article will break existing links." : "URL identifier — auto-generated from title, or set manually."}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.78rem", color: "#999", whiteSpace: "nowrap" }}>/articles/</span>
                  <input
                    type="text"
                    value={fields.slug}
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""))}
                    style={{ ...inputS, flex: 1, fontFamily: "monospace", fontSize: "0.82rem" }}
                    placeholder={slugify(fields.title) || "article-slug"}
                  />
                </div>
              </Field>

              <Field label="Excerpt" hint="Short summary shown in listings and social previews.">
                <textarea
                  rows={3}
                  value={fields.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  style={{ ...inputS, resize: "vertical" }}
                  placeholder="1–2 sentence summary…"
                />
              </Field>
            </div>
          </FormSection>

          {/* Body */}
          <FormSection title="Body" hint="Paste from Word or Google Docs — formatting is preserved.">
            <RichTextEditor
              defaultValue={fields.body}
              onChange={handleBodyChange}
              placeholder="Write article body here…"
              minHeight={520}
            />
          </FormSection>

          {/* Tags */}
          {tags.length > 0 && (
            <FormSection title="Tags">
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", maxHeight: "160px", overflowY: "auto" }}>
                {tags.map((t) => {
                  const on = selectedTags.has(String(t.id));
                  return (
                    <label
                      key={t.id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "999px",
                        border: `1px solid ${on ? "#981b1e" : "#ddd"}`,
                        background: on ? "#fff0f0" : "#fafafa",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        userSelect: "none",
                        color: on ? "#981b1e" : "#555",
                        fontWeight: on ? 600 : 400,
                      }}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleTag(String(t.id))} style={{ display: "none" }} />
                      {t.name}
                    </label>
                  );
                })}
              </div>
              {selectedTags.size > 0 && (
                <div style={{ ...hintS, marginTop: "0.4rem" }}>
                  {selectedTags.size} tag{selectedTags.size !== 1 ? "s" : ""} selected
                </div>
              )}
            </FormSection>
          )}

          {/* SEO & Open Graph — in main column for space */}
          <FormSection title="SEO & Open Graph">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>

              {/* SEO */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Field label="SEO title" hint="Overrides <title> in search. Max 120 chars.">
                  <input
                    type="text"
                    value={fields.seo_title}
                    onChange={(e) => set("seo_title", e.target.value)}
                    style={inputS}
                    maxLength={120}
                    placeholder="SEO headline…"
                  />
                  <span style={hintS}>{fields.seo_title.length}/120</span>
                </Field>

                <Field label="Canonical URL" hint="Override canonical link (advanced).">
                  <input
                    type="text"
                    value={fields.canonical_url}
                    onChange={(e) => set("canonical_url", e.target.value)}
                    style={inputS}
                    placeholder="https://www.thegranite.co.zw/articles/…"
                  />
                </Field>
              </div>

              <Field label="SEO description" hint="Meta description for search results. Aim for 140–160 chars.">
                <textarea
                  rows={2}
                  value={fields.seo_description}
                  onChange={(e) => set("seo_description", e.target.value)}
                  style={{ ...inputS, resize: "vertical" }}
                  maxLength={160}
                  placeholder="Search result summary…"
                />
                <span style={hintS}>{fields.seo_description.length}/160</span>
              </Field>

              {/* OG divider */}
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "0.75rem" }}>
                <p style={{ ...hintS, marginBottom: "0.75rem", color: "#888", marginTop: 0 }}>
                  Open Graph — controls WhatsApp, Facebook, Twitter/X link previews
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <Field label="OG title" hint="Falls back to article title.">
                    <input
                      type="text"
                      value={fields.og_title}
                      onChange={(e) => set("og_title", e.target.value)}
                      style={inputS}
                      maxLength={95}
                      placeholder="Social headline…"
                    />
                  </Field>

                  <Field label="OG image URL" hint="Min 1200×630px. Falls back to hero image.">
                    <input
                      type="text"
                      value={fields.og_image_url}
                      onChange={(e) => set("og_image_url", e.target.value)}
                      style={inputS}
                      placeholder="https://…"
                    />
                  </Field>
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <Field label="OG description" hint="Falls back to excerpt. Max 160 chars.">
                    <textarea
                      rows={2}
                      value={fields.og_description}
                      onChange={(e) => set("og_description", e.target.value)}
                      style={{ ...inputS, resize: "vertical" }}
                      maxLength={160}
                      placeholder="Social preview text…"
                    />
                    <span style={hintS}>{fields.og_description.length}/160</span>
                  </Field>
                </div>
              </div>
            </div>
          </FormSection>

        </div>

        {/* ══ RIGHT — sidebar ══════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Publishing */}
          <FormSection title="Publishing">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

              <Field label="Status">
                <select value={fields.status} onChange={(e) => set("status", e.target.value)} style={inputS}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>

              <Field label="Author">
                <select value={fields.author} onChange={(e) => set("author", e.target.value)} style={inputS}>
                  <option value="">— Unassigned —</option>
                  {authors.map((a) => (
                    <option key={a.id} value={String(a.id)}>{authorLabel(a)}</option>
                  ))}
                </select>
              </Field>

              <Field label="Category">
                <select value={fields.category} onChange={(e) => set("category", e.target.value)} style={inputS}>
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
              </Field>

              {isEdit && article?.published_at && (
                <div style={hintS}>
                  Published: {new Date(article.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </div>
              )}

              {isEdit && article?.view_count !== undefined && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "#666" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {article.view_count.toLocaleString()} views
                </div>
              )}
            </div>
          </FormSection>

          {/* Hero image */}
          <FormSection title="Hero Image">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={fields.image_url}
                  onChange={(e) => set("image_url", e.target.value)}
                  style={{ ...inputS, flex: 1, fontSize: "0.78rem" }}
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  style={{ flexShrink: 0, background: "#333", color: "#fff", border: "none", padding: "0 0.75rem", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Browse
                </button>
              </div>

              {fields.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toProxyUrl(fields.image_url)}
                  alt={fields.image_alt || "Preview"}
                  style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "4px", border: "1px solid #e0e0e0", display: "block" }}
                />
              )}

              <Field label="Alt text" hint="Required for accessibility.">
                <input
                  type="text"
                  value={fields.image_alt}
                  onChange={(e) => set("image_alt", e.target.value)}
                  style={inputS}
                  placeholder="Describe the image"
                />
              </Field>

              <Field label="Caption">
                <input
                  type="text"
                  value={fields.image_caption}
                  onChange={(e) => set("image_caption", e.target.value)}
                  style={inputS}
                  placeholder="Caption text…"
                />
              </Field>

              <Field label="Credit / Source">
                <input
                  type="text"
                  value={fields.image_credit}
                  onChange={(e) => set("image_credit", e.target.value)}
                  style={inputS}
                  placeholder="e.g. Reuters, AP, Staff"
                />
              </Field>
            </div>
          </FormSection>

          {/* Flags & Rankings */}
          <FormSection title="Flags & Rankings">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

              <CheckboxField
                label="Breaking news"
                checked={fields.is_breaking}
                onChange={(v) => set("is_breaking", v)}
                accent
              />

              {/* ── Featured (hero carousel) ── */}
              <div>
                <CheckboxField
                  label="Featured in hero carousel (max 5)"
                  checked={fields.is_featured}
                  onChange={(v) => {
                    set("is_featured", v);
                    if (!v) set("featured_rank", "");
                  }}
                />
                {fields.is_featured && (
                  <div style={{ marginTop: "0.6rem", paddingLeft: "0.25rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#555", marginBottom: "0.25rem", fontWeight: 600 }}>
                      {slotsLoading ? "Loading slots…" : "Pick a slot (click to select, click again to deselect):"}
                    </div>
                    <SlotGrid
                      slots={featuredSlots}
                      selectedRank={fields.featured_rank}
                      onSelect={(r) => set("featured_rank", r)}
                      currentSlug={article?.slug}
                    />
                    {fields.featured_rank && (
                      <div style={{ fontSize: "0.72rem", color: "#981b1e", marginTop: "0.4rem", fontWeight: 600 }}>
                        Slot #{fields.featured_rank} selected
                        {featuredSlots[Number(fields.featured_rank) - 1]?.article &&
                         featuredSlots[Number(fields.featured_rank) - 1]?.article?.slug !== article?.slug
                          ? ` — will replace "${featuredSlots[Number(fields.featured_rank) - 1]!.article!.title}"`
                          : ""}
                      </div>
                    )}
                    {!fields.featured_rank && (
                      <div style={{ fontSize: "0.72rem", color: "#b45309", marginTop: "0.4rem" }}>
                        Select a slot above — required when Featured is on.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Top story ── */}
              <div>
                <CheckboxField
                  label="Top story"
                  checked={fields.is_top_story}
                  onChange={(v) => {
                    set("is_top_story", v);
                    if (!v) set("top_story_rank", "");
                  }}
                />
                {fields.is_top_story && (
                  <div style={{ marginTop: "0.6rem", paddingLeft: "0.25rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "#555", marginBottom: "0.25rem", fontWeight: 600 }}>
                      {slotsLoading ? "Loading slots…" : "Pick a top story slot:"}
                    </div>
                    <SlotGrid
                      slots={topStorySlots}
                      selectedRank={fields.top_story_rank}
                      onSelect={(r) => set("top_story_rank", r)}
                      currentSlug={article?.slug}
                    />
                    {fields.top_story_rank && (
                      <div style={{ fontSize: "0.72rem", color: "#981b1e", marginTop: "0.4rem", fontWeight: 600 }}>
                        Slot #{fields.top_story_rank} selected
                        {topStorySlots[Number(fields.top_story_rank) - 1]?.article &&
                         topStorySlots[Number(fields.top_story_rank) - 1]?.article?.slug !== article?.slug
                          ? ` — will replace "${topStorySlots[Number(fields.top_story_rank) - 1]!.article!.title}"`
                          : ""}
                      </div>
                    )}
                    {!fields.top_story_rank && (
                      <div style={{ fontSize: "0.72rem", color: "#b45309", marginTop: "0.4rem" }}>
                        Select a slot above — required when Top Story is on.
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </FormSection>
        </div>
      </div>

      {/* Media picker modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={(url) => { set("image_url", url); setShowMediaPicker(false); }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </>
  );
}
