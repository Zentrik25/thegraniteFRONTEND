import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact The Granite Post",
  description:
    "Get in touch with The Granite Post. Editorial inquiries, story tips, advertising, and feedback.",
  alternates: { canonical: "https://www.thegranite.co.zw/contact" },
  openGraph: {
    title: "Contact — The Granite Post",
    description: "Editorial inquiries, story tips, advertising, and feedback.",
    type: "website",
    url: "https://www.thegranite.co.zw/contact",
    siteName: "The Granite Post",
    locale: "en_ZW",
  },
};

export default function ContactPage() {
  return (
    <main className="gp-container" style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
        Contact Us
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Editorial
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "0.5rem", color: "var(--text)" }}>
          For news tips, press releases, corrections, and editorial inquiries:
        </p>
        <ul style={{ lineHeight: 1.75, marginBottom: "1rem", paddingLeft: "1.25rem", color: "var(--text)" }}>
          <li>Email: <a href="mailto:editor@thegranite.co.zw">editor@thegranite.co.zw</a></li>
          <li>WhatsApp: +263 78 000 0000</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Advertising & Partnerships
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "0.5rem", color: "var(--text)" }}>
          To advertise with us or explore commercial partnerships:
        </p>
        <ul style={{ lineHeight: 1.75, marginBottom: "1rem", paddingLeft: "1.25rem", color: "var(--text)" }}>
          <li>Email: <a href="mailto:advertise@thegranite.co.zw">advertise@thegranite.co.zw</a></li>
          <li>Visit our <a href="/advertise">Advertise page</a></li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Reader Support
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "0.5rem", color: "var(--text)" }}>
          For account issues, subscription help, or technical problems:
        </p>
        <ul style={{ lineHeight: 1.75, marginBottom: "1rem", paddingLeft: "1.25rem", color: "var(--text)" }}>
          <li>Email: <a href="mailto:support@thegranite.co.zw">support@thegranite.co.zw</a></li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Privacy & Legal
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "0.5rem", color: "var(--text)" }}>
          For privacy-related inquiries or data access requests:
        </p>
        <ul style={{ lineHeight: 1.75, color: "var(--text)" }}>
          <li>Email: <a href="mailto:privacy@thegranite.co.zw">privacy@thegranite.co.zw</a></li>
          <li>See our <a href="/privacy">Privacy Policy</a></li>
        </ul>
      </section>
    </main>
  );
}
