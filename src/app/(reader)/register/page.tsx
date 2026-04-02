"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [fields, setFields] = useState({
    email: "",
    username: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (fields.password !== fields.password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reader/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fields.email,
          username: fields.username,
          password: fields.password,
          first_name: fields.first_name,
          last_name: fields.last_name,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        const firstError =
          typeof body === "object"
            ? Object.values(body).flat().join(" ")
            : body.error || "Registration failed.";
        setError(firstError as string);
        return;
      }

      router.push("/verify-email?registered=true");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "0.625rem 0.75rem",
    border: "1px solid var(--line)",
    borderRadius: "4px",
    fontSize: "1rem",
    background: "var(--surface)",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "0.875rem",
    display: "block",
    marginBottom: "0.375rem",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
        Create your account
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div>
          <label htmlFor="first_name" style={labelStyle}>First name</label>
          <input id="first_name" type="text" autoComplete="given-name" value={fields.first_name} onChange={update("first_name")} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="last_name" style={labelStyle}>Last name</label>
          <input id="last_name" type="text" autoComplete="family-name" value={fields.last_name} onChange={update("last_name")} style={inputStyle} />
        </div>
      </div>

      <div>
        <label htmlFor="username" style={labelStyle}>Username</label>
        <input id="username" type="text" autoComplete="username" required value={fields.username} onChange={update("username")} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="email" style={labelStyle}>Email address</label>
        <input id="email" type="email" autoComplete="email" required value={fields.email} onChange={update("email")} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={8} value={fields.password} onChange={update("password")} style={inputStyle} />
      </div>

      <div>
        <label htmlFor="password2" style={labelStyle}>Confirm password</label>
        <input id="password2" type="password" autoComplete="new-password" required value={fields.password2} onChange={update("password2")} style={inputStyle} />
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
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
