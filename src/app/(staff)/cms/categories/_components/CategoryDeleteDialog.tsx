"use client";

import { useState } from "react";
import CmsModal from "@/components/cms/CmsModal";
import {
  ModalActions,
  dangerButtonStyle,
  secondaryButtonStyle,
} from "@/components/cms/taxonomy-shared";
import { handleCmsAuthRedirect } from "@/lib/auth/cms-client";
import { extractApiMessage } from "@/lib/api/fetcher";
import type { CategorySummary } from "@/lib/types";

interface CategoryDeleteDialogProps {
  category: CategorySummary;
  onClose: () => void;
  onDeleted: (categorySlug: string, message: string) => void;
}

export default function CategoryDeleteDialog({
  category,
  onClose,
  onDeleted,
}: CategoryDeleteDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/staff/categories/${category.slug}/`, {
        method: "DELETE",
      });

      if (handleCmsAuthRedirect(response.status)) return;

      const body = (await response.json().catch(() => ({}))) as
        | { detail?: string }
        | Record<string, unknown>;

      if (!response.ok) {
        setError(extractApiMessage(body));
        return;
      }

      onDeleted(
        category.slug,
        typeof body.detail === "string"
          ? body.detail
          : `Category "${category.name}" has been deleted.`,
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CmsModal title={`Delete ${category.name}`} onClose={onClose} width="min(92vw, 520px)">
      <p style={{ margin: 0, color: "#444", lineHeight: 1.6 }}>
        Delete "{category.name}"? This cannot be undone.
      </p>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: "1rem",
            padding: "0.8rem 0.9rem",
            borderRadius: "8px",
            border: "1px solid #f2c7c8",
            background: "#fff6f6",
            color: "#8e1e20",
            fontSize: "0.84rem",
          }}
        >
          {error}
        </div>
      ) : null}

      <ModalActions>
        <button type="button" onClick={onClose} style={secondaryButtonStyle}>
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={submitting}
          style={{ ...dangerButtonStyle, opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? "Deleting…" : "Delete"}
        </button>
      </ModalActions>
    </CmsModal>
  );
}
