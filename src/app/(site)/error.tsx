"use client";

import Link from "next/link";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for all (site) routes.
 * Rendered inside the (site) layout — the site nav/footer remain visible.
 * Next.js logs the server-side error automatically; no console.error needed here.
 */
export default function SiteError({ error, reset }: Props) {

  return (
    <main
      className="container"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--accent)",
          fontFamily: "var(--font-ui, sans-serif)",
          marginBottom: "0.75rem",
        }}
      >
        Error
      </p>

      <h1
        style={{
          fontFamily: "var(--font-serif, serif)",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "var(--ink)",
          margin: "0 0 0.75rem",
        }}
      >
        This page could not be loaded
      </h1>

      <p
        style={{
          color: "var(--muted)",
          maxWidth: "36ch",
          margin: "0 auto 2.5rem",
          lineHeight: 1.65,
          fontSize: "0.95rem",
        }}
      >
        Something went wrong while loading this page. The issue has been logged.
        Please try again or return to the homepage.
      </p>

      {process.env.NODE_ENV === "development" && error.message && (
        <pre
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "4px",
            padding: "0.75rem 1rem",
            fontSize: "0.73rem",
            color: "var(--muted)",
            maxWidth: "38rem",
            overflowX: "auto",
            textAlign: "left",
            marginBottom: "2rem",
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
            fontSize: "0.875rem",
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
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          Homepage
        </Link>
      </div>
    </main>
  );
}
