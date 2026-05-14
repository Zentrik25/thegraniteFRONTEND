"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ReaderLoginError } from "@/lib/api/reader";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const expired = params.get("expired") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResendDone(false);
    setLoading(true);

    try {
      const res = await fetch("/api/reader/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json() as ReaderLoginError & { ok?: boolean; unverified?: boolean };

      if (!res.ok) {
        if (body.unverified) {
          setUnverified(true);
        } else {
          setError(body.error || "Login failed. Check your email and password.");
        }
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    setResendLoading(true);
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
    }
  }

  function goToVerify() {
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Masthead */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-2xl font-bold text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
          style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", letterSpacing: "-0.28px" }}
        >
          The Granite Post
        </Link>
        <p className="mt-1.5 text-sm text-[var(--muted)]">Sign in to your reader account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 flex flex-col gap-5"
        style={{ boxShadow: "rgba(0,0,0,0.08) 0 2px 16px" }}
      >
        {expired && !error && (
          <div role="status" className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 leading-snug">
            Your session has expired. Please sign in again.
          </div>
        )}

        {unverified && (
          <div role="alert" className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 flex flex-col gap-3">
            <div className="flex gap-2.5 items-start">
              <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Email not verified</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Your account exists but the email hasn&rsquo;t been verified yet.
                  {resendDone
                    ? " A new code has been sent — check your inbox and spam."
                    : " Send a verification code to activate it."}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!resendDone ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={resendLoading}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-60 transition-colors"
                >
                  {resendLoading ? "Sending…" : "Send verification code"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToVerify}
                  className="flex-1 py-2 px-3 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
                >
                  Enter code
                </button>
              )}
              {resendDone && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={resendLoading}
                  className="py-2 px-3 rounded-lg border border-amber-400 text-amber-800 text-sm font-medium hover:bg-amber-100 disabled:opacity-60 transition-colors"
                >
                  Resend
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3 leading-snug">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-[var(--ink)]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 text-base bg-white border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ letterSpacing: "-0.374px" }}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold text-[var(--ink)]">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-[var(--accent)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full px-3.5 py-2.5 text-base bg-white border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
            style={{ letterSpacing: "-0.374px" }}
          />
        </div>

        {/* Submit — Apple pill CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-[var(--accent)] text-white font-semibold text-base hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 mt-1"
          style={{ letterSpacing: "-0.28px" }}
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-sm text-[var(--muted)]">
          Don&rsquo;t have an account?{" "}
          <Link href="/register" className="text-[var(--accent)] font-semibold hover:underline">
            Register free
          </Link>
        </p>
      </form>
    </div>
  );
}
