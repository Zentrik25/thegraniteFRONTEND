"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface DeleteArticleButtonProps {
  slug: string;
  title: string;
}

/**
 * Soft-deletes (archives) an article via the staff API.
 * Requires confirmation before acting. Refreshes the list on success.
 */
export function DeleteArticleButton({ slug, title }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Archive "${title}"?\n\nThis will set the article to archived status and remove it from the public site. You can restore it from the editor.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/staff/articles/${slug}`, { method: "DELETE" });
        if (res.ok) {
          router.refresh();
        } else {
          const data = await res.json().catch(() => ({}));
          window.alert((data as { error?: string }).error ?? "Failed to archive article. Try again.");
        }
      } catch {
        window.alert("Network error. Check your connection and try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      title="Archive this article"
      style={{
        background: "transparent",
        border: "none",
        color: isPending ? "#ccc" : "#c00",
        cursor: isPending ? "not-allowed" : "pointer",
        padding: "0",
        fontSize: "0.8rem",
        fontWeight: 600,
        lineHeight: 1,
      }}
    >
      {isPending ? "…" : "Archive"}
    </button>
  );
}
