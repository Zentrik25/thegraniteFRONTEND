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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reader/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json() as ReaderLoginError & { ok?: boolean };

      if (!res.ok) {
        setError(body.error || "Login failed. Check your email and password.");
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
