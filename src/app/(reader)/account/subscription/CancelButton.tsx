"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";

type State = "idle" | "confirm" | "success" | "error";

interface CancelButtonProps {
  /** ISO date string — shown in the confirmation copy */
  periodEnd: string;
}

export default function CancelButton({ periodEnd }: CancelButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openConfirm() {
    setErrorMsg(null);
    setState("confirm");
  }

  function handleCancel() {
    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/reader/subscription/cancel", {
          method: "POST",
        });
        const data: { error?: string; detail?: string } = await res.json().catch(() => ({}));

        if (res.ok) {
          setState("success");
          // Refresh the server component so the updated subscription state renders
          router.refresh();
        } else {
          setErrorMsg(
            data.error ?? data.detail ?? "Could not cancel subscription. Please try again."
          );
          setState("error");
        }
      } catch {
        setErrorMsg("Network error. Please check your connection and try again.");
        setState("error");
      }
    });
  }

  // After refresh the server component will re-render with cancel_at_period_end: true
  // and this button will no longer be shown. Show a transitional success message.
  if (state === "success") {
    return (
      <p className="text-xs text-center text-[var(--muted)]">
        Subscription cancelled.{" "}
        <span className="text-[var(--ink)]">
          Access continues until {formatDate(periodEnd)}.
        </span>
      </p>
    );
  }

  if (state === "confirm" || state === "error") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 flex flex-col gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Cancel your subscription?
          </p>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            You&rsquo;ll keep full access until{" "}
            <strong>{formatDate(periodEnd)}</strong>. After that, your account
            reverts to free. This cannot be undone.
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-700 font-medium">{errorMsg}</p>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            disabled={isPending}
            className="text-xs font-bold text-red-700 hover:text-red-900 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Cancelling…" : "Yes, cancel"}
          </button>
          <button
            onClick={() => {
              setState("idle");
              setErrorMsg(null);
            }}
            disabled={isPending}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            Keep subscription
          </button>
        </div>
      </div>
    );
  }

  // idle
  return (
    <button
      onClick={openConfirm}
      className="text-xs text-[var(--muted)] hover:text-red-600 transition-colors"
    >
      Cancel subscription
    </button>
  );
}
