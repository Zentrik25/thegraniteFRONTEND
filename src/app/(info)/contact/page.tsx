import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with The Granite Post editorial team, advertising department or support.",
};

const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem", fontWeight: 700, color: "#181411", marginBottom: "0.5rem", marginTop: "1.75rem" };
const P_STYLE = { fontSize: "0.92rem", lineHeight: 1.75, color: "#333", margin: "0 0 0.5rem" };
const LINK_STYLE = { color: "#981b1e", textDecoration: "none" };

const CONTACTS = [
  {
    dept: "Editorial & News Tips",
    desc: "Story tips, press releases, breaking-news alerts and general editorial enquiries.",
    email: "editor@thegranitepost.co.zw",
  },
  {
    dept: "Corrections & Complaints",
    desc: "To request a correction or raise a complaint about published content.",
    email: "corrections@thegranitepost.co.zw",
  },
  {
    dept: "Advertising",
    desc: "Digital advertising, sponsored content and partnership enquiries.",
    email: "advertising@thegranitepost.co.zw",
  },
  {
    dept: "Subscriptions & Billing",
    desc: "Help with your subscription, billing or account access.",
    email: "support@thegranitepost.co.zw",
  },
  {
    dept: "Legal",
    desc: "Legal notices, take-down requests and privacy matters.",
    email: "legal@thegranitepost.co.zw",
  },
];

export default function ContactPage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>Contact Us</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>We read every message. Please use the most relevant address below so it reaches the right team promptly.</p>

      {CONTACTS.map((c) => (
        <div key={c.dept} style={{ borderLeft: "3px solid #981b1e", paddingLeft: "1rem", marginBottom: "1.5rem" }}>
          <h2 style={{ ...H2_STYLE, marginTop: 0 }}>{c.dept}</h2>
          <p style={P_STYLE}>{c.desc}</p>
          <p style={P_STYLE}><a href={`mailto:${c.email}`} style={LINK_STYLE}>{c.email}</a></p>
        </div>
      ))}

      <div style={{ marginTop: "2.5rem", background: "#f8f5f0", padding: "1.25rem 1.5rem", borderTop: "2px solid #181411" }}>
        <p style={{ ...P_STYLE, margin: 0, fontSize: "0.85rem", color: "#655b54" }}>
          <strong style={{ color: "#181411" }}>Postal address:</strong><br />
          The Granite Post, 14 Samora Machel Avenue, Harare, Zimbabwe
        </p>
      </div>
    </>
  );
}
