import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "var(--sans)",
      }}
    >
      <header
        style={{
          borderBottom: "3px solid var(--accent)",
          background: "var(--surface)",
          padding: "0.75rem 1.5rem",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          The Granite Post
        </a>
      </header>
      <main
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "2rem 1rem",
        }}
      >
        {children}
      </main>
    </div>
  );
}
