import Link from "next/link";

/**
 * Branded 404 page for all public (site) routes.
 */
export default function SiteNotFound() {
  return (
    <main
      className="container"
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 1rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "0.62rem",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "var(--accent)",
          fontFamily: "var(--font-ui)",
          marginBottom: "0.75rem",
        }}
      >
        404
      </p>

      <h1
        style={{
          fontFamily: "var(--font)",
          fontSize: "clamp(1.5rem, 4vw, 2.4rem)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          margin: "0 0 0.75rem",
          maxWidth: "22ch",
        }}
      >
        This page could not be found
      </h1>

      <p
        style={{
          color: "var(--muted)",
          maxWidth: "40ch",
          margin: "0 auto 2.5rem",
          lineHeight: 1.65,
          fontSize: "0.92rem",
          fontFamily: "var(--font-ui)",
        }}
      >
        The story you&apos;re looking for may have moved, been archived, or never
        existed. Try searching, or return to the homepage.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          style={{
            background: "var(--accent)",
            color: "#fff",
            padding: "0.625rem 1.5rem",
            borderRadius: "3px",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            fontFamily: "var(--font-ui)",
          }}
        >
          Homepage
        </Link>
        <Link
          href="/search"
          style={{
            background: "transparent",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            padding: "0.625rem 1.5rem",
            borderRadius: "3px",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            fontFamily: "var(--font-ui)",
          }}
        >
          Search
        </Link>
      </div>
    </main>
  );
}
