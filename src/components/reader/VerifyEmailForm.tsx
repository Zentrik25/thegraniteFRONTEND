"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [email, setEmail]         = useState(emailFromQuery);
  const [digits, setDigits]       = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const code = digits.join("");

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      // Handle pasting a full code into any box
      if (value.length > 1) {
        const clean = value.replace(/\D/g, "").slice(0, 6);
        const next = Array(6).fill("");
        for (let i = 0; i < clean.length; i++) next[i] = clean[i];
        setDigits(next);
        const focusIdx = Math.min(clean.length, 5);
        inputRefs.current[focusIdx]?.focus();
        return;
      }

      const digit = value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = digit;
      setDigits(next);
      setError(null);

      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits]
  );

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    if (!email) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reader/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please check the code and try again.");
        setDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true);
    setError(null);
    try {
      await fetch("/api/reader/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // best-effort
    } finally {
      setResendLoading(false);
      setResendDone(true);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    }
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold text-[var(--ink)]"
            style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "-0.28px" }}>
            The Granite Post
          </Link>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 flex flex-col items-center gap-4"
          style={{ boxShadow: "rgba(0,0,0,0.08) 0 2px 16px" }}>
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Email verified!</h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Your account is now active. Sign in to start reading.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-full bg-[var(--accent)] text-white font-semibold text-base hover:opacity-90 transition-opacity mt-2"
            style={{ letterSpacing: "-0.28px" }}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8 text-center">
        <Link href="/"
          className="text-2xl font-bold text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "-0.28px" }}>
          The Granite Post
        </Link>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Enter the 6-digit code from your email</p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 flex flex-col gap-6"
        style={{ boxShadow: "rgba(0,0,0,0.08) 0 2px 16px" }}
      >
        {/* Email field — editable in case they came here directly */}
        {!emailFromQuery && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-[var(--ink)]">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-base bg-white border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
          </div>
        )}

        {emailFromQuery && (
          <p className="text-sm text-center text-[var(--muted)]">
            Code sent to <strong className="text-[var(--ink)]">{email}</strong>
          </p>
        )}

        {/* 6-digit OTP boxes */}
        <div className="flex gap-2 justify-center" aria-label="Verification code">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={d}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              disabled={loading}
              aria-label={`Digit ${i + 1}`}
              className={[
                "w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
                "transition-colors font-mono",
                d ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-white",
                loading ? "opacity-50 cursor-not-allowed" : "",
              ].filter(Boolean).join(" ")}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-4 py-3 leading-snug text-center">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-3 rounded-full bg-[var(--accent)] text-white font-semibold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
          style={{ letterSpacing: "-0.28px" }}
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Verifying…" : "Verify email"}
        </button>

        {/* Resend */}
        <p className="text-center text-xs text-[var(--muted)]">
          {resendDone ? (
            <span className="text-green-600 font-medium">New code sent — check your inbox and spam folder.</span>
          ) : (
            <>
              Didn&rsquo;t receive a code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || !email}
                className="text-[var(--accent)] font-semibold hover:underline disabled:opacity-60"
              >
                {resendLoading ? "Sending…" : "Resend code"}
              </button>
            </>
          )}
        </p>

        <Link href="/login" className="text-center text-sm text-[var(--accent)] font-semibold hover:underline">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
