import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How The Granite Post uses cookies and similar technologies.",
};

const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem", fontWeight: 700, color: "#181411", marginBottom: "0.5rem", marginTop: "2rem" };
const P_STYLE = { fontSize: "0.92rem", lineHeight: 1.8, color: "#333", margin: "0 0 0.85rem" };

const COOKIES = [
  { name: "granite_reader_session", purpose: "Keeps you signed in as a reader. Set only after login. Expires after 60 minutes of inactivity.", type: "Essential" },
  { name: "granite_reader_refresh", purpose: "Allows your session to be silently renewed without re-entering your password. Expires after 7 days.", type: "Essential" },
  { name: "_csrf", purpose: "Protects forms against cross-site request forgery. Expires at end of session.", type: "Essential" },
  { name: "gp_view_*", purpose: "Records which articles you have viewed, used to prevent duplicate view counts and personalise reading history.", type: "Functional" },
];

export default function CookiesPage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>Cookie Policy</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>Last updated: April 2025</p>

      <p style={P_STYLE}>Cookies are small text files placed on your device by a website. This page explains which cookies The Granite Post uses and why.</p>

      <h2 style={{ ...H2_STYLE, marginTop: "1rem" }}>Cookies We Use</h2>

      <div style={{ overflowX: "auto", marginBottom: "2rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "#f8f5f0" }}>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", borderBottom: "2px solid #dbcdbd", fontWeight: 700, color: "#181411" }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", borderBottom: "2px solid #dbcdbd", fontWeight: 700, color: "#181411" }}>Type</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", borderBottom: "2px solid #dbcdbd", fontWeight: 700, color: "#181411" }}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((c, i) => (
              <tr key={c.name} style={{ background: i % 2 === 1 ? "#fafafa" : "#fff" }}>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #f0ebe3", fontFamily: "monospace", color: "#444", whiteSpace: "nowrap", verticalAlign: "top" }}>{c.name}</td>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #f0ebe3", color: "#655b54", fontWeight: 600, verticalAlign: "top", whiteSpace: "nowrap" }}>{c.type}</td>
                <td style={{ padding: "0.6rem 0.75rem", borderBottom: "1px solid #f0ebe3", color: "#333", lineHeight: 1.6, verticalAlign: "top" }}>{c.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={H2_STYLE}>Third-Party Cookies</h2>
      <p style={P_STYLE}>We do not load third-party advertising networks, social media tracking pixels or analytics scripts that set their own cookies. If this changes, this policy will be updated before any such scripts are deployed.</p>

      <h2 style={H2_STYLE}>Managing Cookies</h2>
      <p style={P_STYLE}>Essential cookies are required for the site to function and cannot be disabled. You can delete all cookies via your browser settings at any time, but this will sign you out of your account.</p>
      <p style={P_STYLE}>All major browsers allow you to view, block and delete cookies. Refer to your browser&apos;s help documentation for instructions.</p>

      <h2 style={H2_STYLE}>Contact</h2>
      <p style={P_STYLE}>Cookie or privacy questions: <a href="mailto:legal@thegranite.co.zw" style={{ color: "#981b1e" }}>legal@thegranite.co.zw</a></p>
    </>
  );
}
