"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase =
  | { tag: "ready" }
  | { tag: "initiating" }
  | { tag: "awaiting_payment"; redirectUrl: string | null; pollId: string }
  | { tag: "paid" }
  | { tag: "failed"; message: string }
  | { tag: "error"; message: string };

// ── Constants ─────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 75; // ~5 minutes

// Statuses returned by the poll endpoint that end the loop
const TERMINAL_SUCCESS = new Set(["paid", "active"]);
const TERMINAL_FAILURE = new Set(["failed", "cancelled", "expired"]);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Extract poll_id from either a full URL or relative path.
 * Returns null if the string is not parseable or the param is absent.
 */
function extractPollId(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.startsWith("http") ? raw : `http://x${raw}`);
    return url.searchParams.get("poll_id");
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface PaymentStatusProps {
  planSlug: string;
}

export default function PaymentStatus({ planSlug }: PaymentStatusProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>({ tag: "ready" });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Polling ────────────────────────────────────────────────────────────────

  const startPolling = useCallback((pollId: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    attemptsRef.current = 0;

    intervalRef.current = setInterval(async () => {
      attemptsRef.current += 1;

      if (attemptsRef.current > POLL_MAX_ATTEMPTS) {
        clearInterval(intervalRef.current!);
        if (mountedRef.current) {
          setPhase({
            tag: "error",
            message:
              "Payment confirmation is taking too long. Check your subscription status or contact support.",
          });
        }
        return;
      }

      try {
        const res = await fetch(
          `/api/subscriptions/poll?poll_id=${encodeURIComponent(pollId)}`
        );

        // Non-2xx on a transient basis — keep polling, don't surface to user
        if (!res.ok) return;

        const data: { status: string; status_label?: string } = await res.json();

        if (!mountedRef.current) return;

        if (TERMINAL_SUCCESS.has(data.status)) {
          clearInterval(intervalRef.current!);
          setPhase({ tag: "paid" });
        } else if (TERMINAL_FAILURE.has(data.status)) {
          clearInterval(intervalRef.current!);
          setPhase({
            tag: "failed",
            message:
              data.status_label ??
              "Your payment was not completed. No charge has been made.",
          });
        }
        // "pending" | "initiated" | "sent" → keep polling
      } catch {
        // Network blip — keep polling silently
      }
    }, POLL_INTERVAL_MS);
  }, []);

  // ── Checkout initiation ────────────────────────────────────────────────────

  async function initiate() {
    setPhase({ tag: "initiating" });

    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planSlug, payment_method: "paynow" }),
      });

      if (res.status === 401) {
        router.replace(
          `/login?next=${encodeURIComponent(`/subscribe/checkout?plan=${planSlug}`)}`
        );
        return;
      }

      const data: Record<string, unknown> = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPhase({
          tag: "error",
          message:
            (data.error as string) ??
            (data.detail as string) ??
            "Could not initiate payment. Please try again.",
        });
        return;
      }

      // Resolve poll_id — backend may return it directly or embedded in poll_url
      const pollId =
        (data.poll_id as string | undefined) ??
        extractPollId(data.poll_url as string | undefined);

      if (!pollId) {
        setPhase({
          tag: "error",
          message:
            "Payment could not be tracked. Please contact support if charged.",
        });
        return;
      }

      const redirectUrl = (data.redirect_url as string | undefined) ?? null;
      setPhase({ tag: "awaiting_payment", redirectUrl, pollId });

      // Auto-open PayNow in new tab — the user stays on this polling page
      if (redirectUrl) {
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
      }

      startPolling(pollId);
    } catch {
      setPhase({
        tag: "error",
        message: "Network error. Please check your connection and try again.",
      });
    }
  }

  // ── State renders ──────────────────────────────────────────────────────────

  if (phase.tag === "ready") {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <p className="font-serif text-lg font-bold text-[var(--ink)]">Pay with PayNow</p>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            You&apos;ll be redirected to complete payment. Your subscription activates automatically once confirmed.
          </p>
        </div>

        <button
          onClick={initiate}
          className="w-full py-3.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-deep)] active:scale-[0.98] transition-all"
        >
          Confirm &amp; Pay with PayNow
        </button>

        <p className="text-xs text-center text-[var(--muted)]">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[var(--ink)] transition-colors">
            terms of service
          </Link>
          . You can cancel anytime.
        </p>
      </div>
    );
  }

  if (phase.tag === "initiating") {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-10 flex flex-col items-center gap-4 text-center">
        <Spinner />
        <p className="text-sm font-semibold text-[var(--ink)]">Initiating payment…</p>
        <p className="text-xs text-[var(--muted)]">Please wait. Do not close this page.</p>
      </div>
    );
  }

  if (phase.tag === "awaiting_payment") {
    return (
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden">
        {/* Status header */}
        <div className="border-b border-[var(--line)] px-6 py-5 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </div>
          <div>
            <p className="font-serif font-bold text-[var(--ink)]">
              {phase.redirectUrl
                ? "Complete your payment in PayNow"
                : "Awaiting payment confirmation"}
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">
              {phase.redirectUrl
                ? "A payment page has opened in a new tab."
                : "Follow the instructions from your payment provider."}
            </p>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Re-open button if redirect_url blocked or closed */}
          {phase.redirectUrl && (
            <a
              href={phase.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-lg border-2 border-[var(--accent)] text-[var(--accent)] text-sm font-bold text-center hover:bg-[var(--accent)]/5 transition-colors"
            >
              Open PayNow ↗
            </a>
          )}

          {/* Polling indicator */}
          <div className="flex items-center gap-3 bg-[var(--bg)] rounded-lg px-4 py-3">
            <PulsingDot />
            <p className="text-sm text-[var(--muted)]">Checking payment status…</p>
          </div>

          <p className="text-xs text-center text-[var(--muted)]">
            Already paid?{" "}
            <span className="text-[var(--ink)] font-medium">
              This page updates automatically.
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (phase.tag === "paid") {
    return (
      <div className="bg-[var(--surface)] border border-green-200 rounded-xl p-8 flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-9 h-9 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <div>
          <p className="font-serif text-2xl font-bold text-[var(--ink)]">
            You&apos;re subscribed!
          </p>
          <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed max-w-xs">
            Payment confirmed. Your account now has full access to The Granite Post.
          </p>
        </div>

        <Link
          href="/account/subscription"
          className="w-full py-3.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold text-center hover:bg-[var(--accent-deep)] transition-colors"
        >
          View your subscription
        </Link>
        <Link
          href="/"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          Start reading →
        </Link>
      </div>
    );
  }

  if (phase.tag === "failed") {
    return (
      <div className="bg-[var(--surface)] border border-red-200 rounded-xl p-8 flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-9 h-9 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div>
          <p className="font-serif text-xl font-bold text-[var(--ink)]">Payment failed</p>
          <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed max-w-xs">
            {phase.message}
          </p>
        </div>

        <Link
          href="/subscribe"
          className="w-full py-3.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold text-center hover:bg-[var(--accent-deep)] transition-colors"
        >
          Try again
        </Link>
        <a
          href="mailto:support@thegranitepost.co.zw"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          Contact support
        </a>
      </div>
    );
  }

  // phase.tag === "error"
  return (
    <div className="bg-[var(--surface)] border border-amber-200 rounded-xl p-8 flex flex-col items-center gap-5 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
        <svg
          className="w-9 h-9 text-amber-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <div>
        <p className="font-serif text-xl font-bold text-[var(--ink)]">Something went wrong</p>
        <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed max-w-xs">
          {phase.message}
        </p>
      </div>

      <Link
        href="/subscribe"
        className="w-full py-3.5 rounded-lg bg-[var(--accent)] text-white text-sm font-bold text-center hover:bg-[var(--accent-deep)] transition-colors"
      >
        Back to plans
      </Link>
      <Link
        href="/account/subscription"
        className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
      >
        Check subscription status
      </Link>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div
      className="w-10 h-10 rounded-full border-4 border-[var(--line)] border-t-[var(--accent)] animate-spin"
      role="status"
      aria-label="Loading"
    />
  );
}

function PulsingDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent)]" />
    </span>
  );
}
