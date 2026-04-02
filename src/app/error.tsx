"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary — catches unhandled errors in any route not covered
 * by a more specific error.tsx. Rendered inside the root layout so CSS
 * variables and fonts are available.
 */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console in dev; swap for your error-reporting service in prod
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        fontFamily: "var(--font-ui, sans-serif)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "5rem",
          fontWeight: 800,
          color: "var(--accent)",
          lineHeight: 1,
          fontFamily: "var(--font-serif, serif)",
        }}
      >
        500
      </div>

      <h1
        style={{
          fontFamily: "var(--font-serif, serif)",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "var(--ink)",
          margin: "1rem 0 0.5rem",
        }}
      >
        Something went wrong
      </h1>

      <p
        style={{
          color: "var(--muted)",
          maxWidth: "34ch",
          margin: "0 auto 2rem",
          lineHeight: 1.6,
          fontSize: "0.95rem",
        }}
      >
        An unexpected error occurred. Our team has been notified. You can try
        again or return to the homepage.
      </p>

      {process.env.NODE_ENV === "development" && error.message && (
        <pre
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            padding: "0.75rem 1rem",
            fontSize: "0.75rem",
            color: "var(--muted)",
            maxWidth: "36rem",
            overflowX: "auto",
            textAlign: "left",
            marginBottom: "1.5rem",
          }}
        >
          {error.message}
          {error.digest ? `\ndigest: ${error.digest}` : ""}
        </pre>
      )}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.625rem 1.5rem",
            borderRadius: "3px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link
          href="/"
          style={{
            background: "transparent",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            padding: "0.625rem 1.5rem",
            borderRadius: "3px",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
