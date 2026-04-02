import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        fontFamily: "var(--sans)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "6rem", fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
        404
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "var(--ink)",
          margin: "1rem 0 0.5rem",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "30ch", margin: "0 auto 2rem" }}>
        The page you&rsquo;re looking for may have been moved or removed.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "var(--accent)",
          color: "#fff",
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
  );
}
