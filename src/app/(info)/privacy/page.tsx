import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Granite Post collects, uses and protects your personal data.",
};

const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem", fontWeight: 700, color: "#181411", marginBottom: "0.5rem", marginTop: "2rem" };
const P_STYLE = { fontSize: "0.92rem", lineHeight: 1.8, color: "#333", margin: "0 0 0.85rem" };

export default function PrivacyPage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>Privacy Policy</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>Last updated: April 2025</p>

      <p style={P_STYLE}>The Granite Post (&quot;we&quot;, &quot;us&quot;) is committed to protecting your personal information. This policy explains what data we collect, why we collect it, and how we use it.</p>

      <h2 style={{ ...H2_STYLE, marginTop: "1rem" }}>1. Data We Collect</h2>
      <p style={P_STYLE}><strong>Account data:</strong> When you register, we collect your email address, name and password (stored as a hashed value). If you subscribe, we also collect billing details processed securely by our payment provider.</p>
      <p style={P_STYLE}><strong>Usage data:</strong> We log which articles you view, search queries, and general navigation patterns. This is used to improve content recommendations and site performance.</p>
      <p style={P_STYLE}><strong>Technical data:</strong> IP address, browser type, device type and referral source collected automatically when you visit the site.</p>
      <p style={P_STYLE}><strong>Cookies:</strong> See our <a href="/cookies" style={{ color: "#981b1e" }}>Cookie Policy</a> for full details.</p>

      <h2 style={H2_STYLE}>2. How We Use Your Data</h2>
      <p style={P_STYLE}>We use your data to: provide access to your account and subscription; send the newsletters you have requested; improve site performance and content; comply with legal obligations.</p>
      <p style={P_STYLE}>We do not sell your personal data to third parties. We do not use your data for targeted advertising.</p>

      <h2 style={H2_STYLE}>3. Data Sharing</h2>
      <p style={P_STYLE}>We share data only with service providers necessary to operate the site — including cloud hosting, email delivery and payment processing — all under data processing agreements that require them to protect your data.</p>

      <h2 style={H2_STYLE}>4. Data Retention</h2>
      <p style={P_STYLE}>We retain account data for as long as your account is active and for up to 24 months after deletion, to comply with legal obligations. Usage logs are retained for 12 months.</p>

      <h2 style={H2_STYLE}>5. Your Rights</h2>
      <p style={P_STYLE}>You have the right to access, correct or delete the personal data we hold about you. To exercise these rights, email <a href="mailto:legal@thegranite.co.zw" style={{ color: "#981b1e" }}>legal@thegranite.co.zw</a>. We will respond within 30 days.</p>

      <h2 style={H2_STYLE}>6. Security</h2>
      <p style={P_STYLE}>We use industry-standard encryption (TLS) for data in transit and at rest. Access to personal data is restricted to authorised staff only.</p>

      <h2 style={H2_STYLE}>7. Changes to This Policy</h2>
      <p style={P_STYLE}>We may update this policy periodically. Significant changes will be communicated by email to registered users. Continued use of the site after changes constitutes acceptance.</p>

      <h2 style={H2_STYLE}>8. Contact</h2>
      <p style={P_STYLE}>For privacy enquiries: <a href="mailto:legal@thegranite.co.zw" style={{ color: "#981b1e" }}>legal@thegranite.co.zw</a></p>
    </>
  );
}
