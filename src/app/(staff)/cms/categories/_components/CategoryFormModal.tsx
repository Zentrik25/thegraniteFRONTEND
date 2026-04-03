"use client";

import { useState, type FormEvent } from "react";
import CmsModal from "@/components/cms/CmsModal";
import {
  Field,
  InlineBadge,
  ModalActions,
  inputStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "@/components/cms/taxonomy-shared";
import { handleCmsAuthRedirect } from "@/lib/auth/cms-client";
import { extractApiMessage } from "@/lib/api/fetcher";
import type { CategorySummary, CategoryWritePayload, SectionSummary } from "@/lib/types";

interface CategoryFormModalProps {
  category?: CategorySummary | null;
  sections: SectionSummary[];
  onClose: () => void;
  onSaved: (category: CategorySummary, message: string) => void;
}

type FieldErrors = Partial<Record<keyof CategoryWritePayload | "form", string>>;

export default function CategoryFormModal({
  category,
  sections,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const isEdit = Boolean(category?.slug);
  const [fields, setFields] = useState({
    name: category?.name ?? "",
    description: category?.description ?? "",
    og_image_url: category?.og_image_url ?? "",
    section: category?.section != null ? String(category.section) : "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  function setField<K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function applyApiErrors(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      setFieldErrors({ form: extractApiMessage(payload) });
      return;
    }

    const nextErrors: FieldErrors = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
      const message = Array.isArray(value) ? value[0] : value;
      if (typeof message === "string") {
        nextErrors[key as keyof FieldErrors] = message;
      }
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

    const payload: CategoryWritePayload = {
      name: fields.name.trim(),
      description: fields.description.trim(),
      og_image_url: fields.og_image_url.trim(),
      section: fields.section ? Number(fields.section) : null,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/staff/categories/${category!.slug}/` : "/api/staff/categories/",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (handleCmsAuthRedirect(response.status)) return;

      const body = (await response.json().catch(() => ({}))) as
        | CategorySummary
        | Record<string, unknown>;

      if (!response.ok) {
        applyApiErrors(body);
        return;
      }

      const saved = body as CategorySummary;
      const sectionMatch = sections.find((item) => String(item.id) === fields.section);

      onSaved(
        {
          ...category,
          ...saved,
          section: fields.section ? Number(fields.section) : null,
          section_name: sectionMatch?.name ?? null,
          section_slug: sectionMatch?.slug ?? null,
          article_count: saved.article_count ?? category?.article_count ?? 0,
        },
        isEdit
          ? `Category "${saved.name}" updated.`
          : `Category "${saved.name}" created.`,
      );
    } catch {
      setFieldErrors({ form: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsModal
      title={isEdit ? `Edit ${category?.name ?? "category"}` : "Create category"}
      onClose={onClose}
      width="min(92vw, 720px)"
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
              <Field
                label="Slug"
                hint="Slug is auto-generated on create and is not changed when you rename the category"
              >
                <InlineBadge tone="muted">{category?.slug}</InlineBadge>
              </Field>
            </div>
          ) : null}

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

          <Field label="Section" error={fieldErrors.section}>
            <select
              style={inputStyle}
              value={fields.section}
              onChange={(event) => setField("section", event.target.value)}
            >
              <option value="">— No section —</option>
              {sections.map((section) => (
                <option key={section.id} value={String(section.id)}>
                  {section.name}
                </option>
              ))}
            </select>
          </Field>
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
            {saving ? "Saving…" : isEdit ? "Save category" : "Create category"}
          </button>
        </ModalActions>
      </form>
    </CmsModal>
  );
}
