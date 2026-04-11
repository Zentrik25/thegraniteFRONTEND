"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import CmsModal from "@/components/cms/CmsModal";
import {
  Field,
  InlineBadge,
  ModalActions,
  hintStyle,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "@/components/cms/taxonomy-shared";
import { handleCmsAuthRedirect } from "@/lib/auth/cms-client";
import { extractApiMessage } from "@/lib/api/fetcher";
import type { ArticleSummary, SectionDetail, SectionSummary, SectionWritePayload } from "@/lib/types";

interface SectionFormModalProps {
  section?: SectionSummary | null;
  onClose: () => void;
  onSaved: (section: SectionSummary, message: string) => void;
}

type FieldErrors = Partial<Record<keyof SectionWritePayload | "form", string>>;

interface ArticleOption {
  id: string | number;
  title: string;
  slug: string;
}

const emptyFields = {
  name: "",
  slug: "",
  description: "",
  og_image_url: "",
  display_order: "0",
  is_active: true,
  is_primary: false,
};

function toArticleOption(article: Pick<ArticleSummary, "id" | "title" | "slug">): ArticleOption {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
  };
}

export default function SectionFormModal({
  section,
  onClose,
  onSaved,
}: SectionFormModalProps) {
  const isEdit = Boolean(section?.slug);
  const [fields, setFields] = useState(() => ({
    ...emptyFields,
    name: section?.name ?? "",
    slug: "",
    description: section?.description ?? "",
    og_image_url: section?.og_image_url ?? "",
    display_order: String(section?.display_order ?? 0),
    is_active: typeof section?.is_active === "boolean" ? section.is_active : true,
    is_primary: typeof section?.is_primary === "boolean" ? section.is_primary : false,
  }));
  const [loadingDetail, setLoadingDetail] = useState(isEdit);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const [currentHero, setCurrentHero] = useState<ArticleOption | null>(null);
  const [featuredDirty, setFeaturedDirty] = useState(!isEdit);
  const [featuredArticle, setFeaturedArticle] = useState<ArticleOption | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ArticleOption[]>([]);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!section?.slug) return;

      setLoadingDetail(true);
      setDetailError(null);

      try {
        const response = await fetch(`/api/staff/sections/${section.slug}/`);
        if (handleCmsAuthRedirect(response.status)) return;

        const body = (await response.json().catch(() => ({}))) as SectionDetail | Record<string, unknown>;
        if (!response.ok) {
          if (active) setDetailError(extractApiMessage(body));
          return;
        }

        const detail = body as SectionDetail;
        if (!active) return;

        setFields((prev) => ({
          ...prev,
          name: detail.name ?? prev.name,
          description: detail.description ?? "",
          og_image_url: detail.og_image_url ?? "",
          display_order: String(detail.display_order ?? 0),
          is_active: typeof detail.is_active === "boolean" ? detail.is_active : prev.is_active,
          is_primary: typeof detail.is_primary === "boolean" ? detail.is_primary : prev.is_primary,
        }));
        setCurrentHero(detail.hero_article ? toArticleOption(detail.hero_article) : null);
      } catch {
        if (active) setDetailError("Could not load section details.");
      } finally {
        if (active) setLoadingDetail(false);
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [section?.slug]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    const timeout = window.setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(`/api/staff/articles/?search=${encodeURIComponent(query.trim())}`);
        if (handleCmsAuthRedirect(response.status)) return;

        const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

        if (!response.ok) {
          if (active) {
            setSearchResults([]);
            setFieldErrors((prev) => ({ ...prev, form: extractApiMessage(body) }));
          }
          return;
        }

        if (active) {
          const results = Array.isArray(body.results) ? (body.results as ArticleSummary[]) : [];
          setSearchResults(results.map(toArticleOption));
        }
      } catch {
        if (active) {
          setSearchResults([]);
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 280);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [query]);

  const shownFeaturedArticle = useMemo(() => {
    if (featuredDirty) return featuredArticle;
    return currentHero;
  }, [currentHero, featuredArticle, featuredDirty]);

  function setField<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function applyApiErrors(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      setFieldErrors({ form: extractApiMessage(payload) });
      return;
    }

    const knownFields = new Set<string>(["name", "slug", "description", "og_image_url", "display_order", "is_active", "is_primary", "featured_article", "form"]);
    const nextErrors: FieldErrors = {};
    const overflow: string[] = [];

    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      const message = Array.isArray(value) ? String(value[0]) : typeof value === "string" ? value : null;
      if (!message) continue;
      if (knownFields.has(key)) {
        nextErrors[key as keyof FieldErrors] = message;
      } else {
        // Unknown field error (e.g. slug conflict) — surface in the form banner
        overflow.push(`${key}: ${message}`);
      }
    }

    if (overflow.length > 0) {
      nextErrors.form = (nextErrors.form ? nextErrors.form + " " : "") + overflow.join(" | ");
    }

    if (Object.keys(nextErrors).length === 0) {
      nextErrors.form = extractApiMessage(payload);
    }

    setFieldErrors(nextErrors);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    const payload: SectionWritePayload = {
      name: fields.name.trim(),
      description: fields.description.trim(),
      og_image_url: fields.og_image_url.trim(),
      display_order: Math.max(0, Number(fields.display_order || 0)),
      is_active: fields.is_active,
      is_primary: fields.is_primary,
    };

    // Only send slug on create, and only when the user has typed one
    if (!isEdit && fields.slug.trim()) {
      payload.slug = fields.slug.trim();
    }

    if (!isEdit || featuredDirty) {
      payload.featured_article = featuredArticle ? Number(featuredArticle.id) : null;
    }

    try {
      const response = await fetch(
        isEdit ? `/api/staff/sections/${section!.slug}/` : "/api/staff/sections/",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (handleCmsAuthRedirect(response.status)) return;

      const body = (await response.json().catch(() => ({}))) as
        | SectionSummary
        | Record<string, unknown>;

      if (!response.ok) {
        applyApiErrors(body);
        return;
      }

      const saved = body as SectionSummary;
      onSaved(
        {
          ...section,
          ...saved,
          article_count: saved.article_count ?? section?.article_count ?? 0,
          category_count: saved.category_count ?? section?.category_count ?? 0,
          is_active: typeof saved.is_active === "boolean" ? saved.is_active : fields.is_active,
          is_primary: typeof saved.is_primary === "boolean" ? saved.is_primary : fields.is_primary,
          display_order: saved.display_order ?? Number(fields.display_order),
        },
        isEdit ? `Section "${saved.name}" updated.` : `Section "${saved.name}" created.`,
      );
    } catch {
      setFieldErrors({ form: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsModal
      title={isEdit ? `Edit ${section?.name ?? "section"}` : "Create section"}
      onClose={onClose}
      width="min(92vw, 820px)"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Name" error={fieldErrors.name}>
              <input
                style={inputStyle}
                value={fields.name}
                onChange={(event) => setField("name", event.target.value)}
                required
              />
            </Field>
          </div>

          {isEdit ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Slug" hint="Slug is auto-generated and cannot be changed">
                <InlineBadge tone="muted">{section?.slug}</InlineBadge>
              </Field>
            </div>
          ) : (
            <div style={{ gridColumn: "1 / -1" }}>
              <Field
                label="Slug (optional)"
                hint="Leave blank to auto-generate from name. Set manually if the auto-generated slug is already taken (e.g. from a previously deleted section)."
                error={fieldErrors.slug}
              >
                <input
                  style={inputStyle}
                  value={fields.slug}
                  onChange={(e) => setField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
                  placeholder="e.g. opinion"
                />
              </Field>
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Description" error={fieldErrors.description}>
              <textarea
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                value={fields.description}
                onChange={(event) => setField("description", event.target.value)}
              />
            </Field>
          </div>

          <Field
            label="OG image URL"
            hint="Recommended 1200×630px for social sharing"
            error={fieldErrors.og_image_url}
          >
            <input
              style={inputStyle}
              value={fields.og_image_url}
              onChange={(event) => setField("og_image_url", event.target.value)}
              type="url"
            />
          </Field>

          <Field
            label="Display order"
            hint="Lower numbers appear earlier in navigation"
            error={fieldErrors.display_order}
          >
            <input
              style={inputStyle}
              value={fields.display_order}
              onChange={(event) => setField("display_order", event.target.value)}
              type="number"
              min={0}
            />
          </Field>

          <div>
            <Field label="Navigation placement">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.84rem" }}>
                <input
                  type="checkbox"
                  checked={fields.is_primary}
                  onChange={(event) => setField("is_primary", event.target.checked)}
                />
                Show in primary navigation
              </label>
            </Field>
          </div>

          <div>
            <Field label="Active state">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.84rem" }}>
                <input
                  type="checkbox"
                  checked={fields.is_active}
                  onChange={(event) => setField("is_active", event.target.checked)}
                />
                Section is active
              </label>
            </Field>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <Field
              label="Featured article"
              hint="Search published articles. Leave blank to let the backend use the latest section story."
            >
              <input
                style={inputStyle}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search articles by title or slug"
              />

              {loadingDetail ? (
                <div style={hintStyle}>Loading current hero article…</div>
              ) : detailError ? (
                <div style={{ ...hintStyle, color: "#b42318" }}>{detailError}</div>
              ) : shownFeaturedArticle ? (
                <div
                  style={{
                    marginTop: "0.6rem",
                    padding: "0.7rem 0.85rem",
                    borderRadius: "8px",
                    border: "1px solid #e7e7e7",
                    background: "#fafafa",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#222" }}>
                      {shownFeaturedArticle.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.15rem" }}>
                      {shownFeaturedArticle.slug}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedDirty(true);
                      setFeaturedArticle(null);
                    }}
                    style={{
                      ...secondaryButtonStyle,
                      padding: "0.36rem 0.7rem",
                      fontSize: "0.76rem",
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div style={hintStyle}>
                  No featured article is pinned. The backend will fall back to the latest article.
                </div>
              )}

              {(searching || searchResults.length > 0) && (
                <div
                  style={{
                    marginTop: "0.7rem",
                    border: "1px solid #e7e7e7",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {searching ? (
                    <div style={{ padding: "0.75rem", fontSize: "0.82rem", color: "#777" }}>
                      Searching…
                    </div>
                  ) : (
                    searchResults.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => {
                          setFeaturedDirty(true);
                          setFeaturedArticle(article);
                          setQuery(article.title);
                          setSearchResults([]);
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          background: "#fff",
                          border: "none",
                          borderBottom: "1px solid #f0f0f0",
                          padding: "0.7rem 0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#222" }}>
                          {article.title}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#888", marginTop: "0.18rem" }}>
                          {article.slug}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </Field>
          </div>
        </div>

        {fieldErrors.form ? (
          <div
            role="alert"
            style={{
              marginTop: "1rem",
              borderRadius: "8px",
              border: "1px solid #f2c7c8",
              background: "#fff6f6",
              color: "#8e1e20",
              padding: "0.8rem 0.9rem",
              fontSize: "0.84rem",
            }}
          >
            {fieldErrors.form}
          </div>
        ) : null}

        <ModalActions>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ ...primaryButtonStyle, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : isEdit ? "Save section" : "Create section"}
          </button>
        </ModalActions>
      </form>
    </CmsModal>
  );
}
