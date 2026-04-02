"use client";

import type { Metadata } from "next";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

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

      const body = await res.json();

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
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
        Sign in to your account
      </h1>

      {error && (
        <div
          role="alert"
          style={{
            background: "#fff0f0",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label htmlFor="email" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0.625rem 0.75rem",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            fontSize: "1rem",
            background: "var(--surface)",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label htmlFor="password" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "0.625rem 0.75rem",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            fontSize: "1rem",
            background: "var(--surface)",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          padding: "0.75rem",
          borderRadius: "4px",
          fontWeight: 700,
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--muted)" }}>
        Don&rsquo;t have an account?{" "}
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Register free
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
