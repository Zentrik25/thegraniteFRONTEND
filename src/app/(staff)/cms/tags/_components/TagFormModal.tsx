"use client";

import { useMemo, useState, type FormEvent } from "react";
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
import type { TagSummary, TagWritePayload } from "@/lib/types";

interface TagFormModalProps {
  tag?: TagSummary | null;
  onClose: () => void;
  onSaved: (tag: TagSummary, message: string) => void;
}

type FieldErrors = Partial<Record<keyof TagWritePayload | "form", string>>;

export default function TagFormModal({ tag, onClose, onSaved }: TagFormModalProps) {
  const isEdit = Boolean(tag?.slug);
  const [name, setName] = useState(tag?.name ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => name.trim().toLowerCase(), [name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    const payload: TagWritePayload = {
      name: name.trim(),
    };

    try {
      const response = await fetch(
        isEdit ? `/api/staff/tags/${tag!.slug}/` : "/api/staff/tags/",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (handleCmsAuthRedirect(response.status)) return;

      const body = (await response.json().catch(() => ({}))) as
        | TagSummary
        | Record<string, unknown>;

      if (!response.ok) {
        if (body && typeof body === "object") {
          const nextErrors: FieldErrors = {};
          for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
            const message = Array.isArray(value) ? value[0] : value;
            if (typeof message === "string") {
              nextErrors[key as keyof FieldErrors] = message;
            }
          }
          if (Object.keys(nextErrors).length === 0) {
            nextErrors.form = extractApiMessage(body);
          }
          setFieldErrors(nextErrors);
        } else {
          setFieldErrors({ form: extractApiMessage(body) });
        }
        return;
      }

      const saved = body as TagSummary;
      onSaved(
        {
          ...tag,
          ...saved,
          article_count: saved.article_count ?? tag?.article_count ?? 0,
        },
        isEdit ? `Tag "${saved.name}" renamed.` : `Tag "${saved.name}" created.`,
      );
    } catch {
      setFieldErrors({ form: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <CmsModal
      title={isEdit ? `Rename ${tag?.name ?? "tag"}` : "Create tag"}
      onClose={onClose}
      width="min(92vw, 480px)"
    >
      <form onSubmit={handleSubmit}>
        <Field label="Tag name" error={fieldErrors.name}>
          <input
            style={inputStyle}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>

        <div style={{ marginTop: "0.85rem" }}>
          <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#555", marginBottom: "0.4rem" }}>
            Lowercase preview
          </div>
          <InlineBadge tone="accent">{preview || "tag-preview"}</InlineBadge>
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
            {saving ? "Saving…" : isEdit ? "Save tag" : "Create tag"}
          </button>
        </ModalActions>
      </form>
    </CmsModal>
  );
}
