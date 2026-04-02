"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ClearHistoryButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClear() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/reader/history", { method: "DELETE" });
      if (res.ok || res.status === 204) {
        setConfirming(false);
        router.refresh();
      } else {
        setError("Failed to clear. Try again.");
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-[var(--muted)]">Clear all?</span>
        <button
          onClick={handleClear}
          disabled={isPending}
          className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Clearing…" : "Yes, clear"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-semibold text-[var(--muted)] hover:text-red-600 transition-colors mt-9"
      >
        Clear history
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
