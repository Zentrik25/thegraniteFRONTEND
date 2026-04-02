"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StaffLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/cms";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || "Login failed. Check your credentials.");
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
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1a1a",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#fff",
          borderRadius: "8px",
          padding: "2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "var(--ink)",
              marginBottom: "0.25rem",
            }}
          >
            The Granite Post
          </div>
          <h1
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--muted)",
              margin: 0,
            }}
          >
            Staff CMS Login
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {error && (
            <div
              role="alert"
              style={{
                background: "#fff0f0",
                border: "1px solid #f5c6cb",
                color: "#721c24",
                padding: "0.75rem",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <label htmlFor="username" style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "0.625rem 0.75rem",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                fontSize: "1rem",
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
        </form>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense>
      <StaffLoginForm />
    </Suspense>
  );
}
