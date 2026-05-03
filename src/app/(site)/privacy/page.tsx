import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How The Granite Post collects, uses, and protects your personal data. Includes details on cookies, advertising, and your privacy rights.",
  alternates: { canonical: "https://www.thegranite.co.zw/privacy" },
  openGraph: {
    title: "Privacy Policy — The Granite Post",
    description: "How we collect, use, and protect your personal data.",
    type: "website",
    url: "https://www.thegranite.co.zw/privacy",
    siteName: "The Granite Post",
    locale: "en_ZW",
  },
};

export default function PrivacyPage() {
  return (
    <main className="gp-container" style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
        Privacy Policy
      </h1>
      <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--muted)", fontSize: "0.85rem" }}>
        Last updated: 2 May 2026
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          1. Information We Collect
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          When you visit The Granite Post, we may collect information you provide
          directly — such as your name and email address when you subscribe to our
          newsletter or create a reader account — as well as information collected
          automatically, including your IP address, browser type, device information,
          and pages visited.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          We use this information to operate and improve our website, personalise
          your experience, communicate with you, and analyse how our content is
          consumed.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          2. Cookies
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We use cookies and similar technologies for essential site functionality,
          analytics, and advertising. Cookies are small text files stored on your
          device that help us recognise you and improve your experience.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          You can control cookies through your browser settings. Disabling cookies
          may affect certain features of the site. By continuing to use our site,
          you consent to our use of cookies as described in this policy.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          3. Advertising & Third-Party Cookies
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We display advertisements on our website. Third-party vendors, including
          Google, use cookies to serve ads based on your prior visits to our site
          and other websites on the internet.
        </p>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          Google&apos;s use of advertising cookies enables it and its partners to serve
          ads based on your visit to our site and/or other sites on the internet.
          Users may opt out of personalised advertising by visiting{" "}
          <a href="https://adssettings.google.com" rel="noopener noreferrer" target="_blank">
            Google Ads Settings
          </a>
          {" "}or{" "}
          <a href="https://www.aboutads.info" rel="noopener noreferrer" target="_blank">
            www.aboutads.info
          </a>.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          We use Google AdSense to serve ads. Google AdSense may use cookies and web
          beacons to collect information as part of the ad-serving process. The
          information collected may include your IP address, browser type, and
          browsing activity.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          4. Data Sharing
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We do not sell your personal data. We may share anonymised or aggregated
          data with analytics partners. We may disclose information when required
          by law or to protect our rights.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          5. Data Security
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We implement appropriate technical and organisational measures to protect
          your personal data against unauthorised access, alteration, disclosure,
          or destruction.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          6. Your Rights
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          Depending on your jurisdiction, you may have the right to access, correct,
          or delete your personal data, to object to or restrict processing, and to
          data portability. To exercise these rights, contact us at{" "}
          <a href="mailto:privacy@thegranite.co.zw">privacy@thegranite.co.zw</a>.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          7. Changes to This Policy
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We may update this policy from time to time. Changes will be posted on this
          page with a revised effective date. We encourage you to review this policy
          periodically.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          8. Contact
        </h2>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          For questions about this policy:{" "}
          <a href="mailto:privacy@thegranite.co.zw">privacy@thegranite.co.zw</a>.
        </p>
      </section>
    </main>
  );
}
