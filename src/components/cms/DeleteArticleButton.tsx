"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface DeleteArticleButtonProps {
  slug: string;
  title: string;
}

export function DeleteArticleButton({ slug, title }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThe article will be removed from the public site. You can restore it by editing and republishing.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/staff/articles/${slug}`, { method: "DELETE" });
        if (res.ok) {
          router.refresh();
        } else {
          const data = await res.json().catch(() => ({}));
          window.alert((data as { error?: string }).error ?? "Delete failed. Try again.");
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
      title="Delete article"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        background: "transparent",
        border: "1px solid #f5c6cb",
        borderRadius: "4px",
        color: isPending ? "#ccc" : "#c00",
        cursor: isPending ? "not-allowed" : "pointer",
        padding: "0.2rem 0.5rem",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {isPending ? (
        "…"
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          Delete
        </>
      )}
    </button>
  );
}
