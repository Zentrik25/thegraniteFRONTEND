import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About The Granite Post",
  description:
    "The Granite Post is Zimbabwe's authoritative voice — delivering independent, accurate journalism since our founding.",
  alternates: { canonical: "https://www.thegranite.co.zw/about" },
  openGraph: {
    title: "About The Granite Post",
    description:
      "Zimbabwe's authoritative voice for independent, accurate journalism.",
    type: "website",
    url: "https://www.thegranite.co.zw/about",
    siteName: "The Granite Post",
    locale: "en_ZW",
  },
};

export default function AboutPage() {
  return (
    <main className="gp-container" style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
        About The Granite Post
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Our Mission
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          The Granite Post is an independent Zimbabwean news organisation dedicated to
          delivering accurate, fair, and fearless journalism. We cover the stories that
          matter most to Zimbabwe — from politics and business to technology, sport, and
          culture — with rigour and integrity.
        </p>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We believe that informed citizens build stronger democracies. Our newsroom
          operates with full editorial independence, guided by the principles of truth,
          accountability, and public interest.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Editorial Standards
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          Every story we publish is subject to rigorous fact-checking and editorial
          review. We correct errors promptly and transparently. Our journalists adhere
          to a strict code of ethics that prioritises accuracy, fairness, and the
          protection of sources.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          We distinguish clearly between news, analysis, and opinion. Corrections and
          clarifications are published prominently when errors occur.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Ownership & Funding
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          The Granite Post is a privately held Zimbabwean media company. Our revenue
          comes from digital advertising, subscriptions, and reader contributions.
          We do not accept funding from political parties or state actors, and our
          editorial decisions are made independently of commercial interests.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Contact Us
        </h2>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          For editorial inquiries, story tips, or feedback:{" "}
          <a href="mailto:editor@thegranite.co.zw">editor@thegranite.co.zw</a>.
          <br />
          For advertising and partnerships:{" "}
          <a href="mailto:advertise@thegranite.co.zw">advertise@thegranite.co.zw</a>.
          <br />
          Visit our{" "}
          <a href="/contact">Contact page</a> for more details.
        </p>
      </section>
    </main>
  );
}
