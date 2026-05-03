import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions for using The Granite Post website, including content usage, user accounts, and liability.",
  alternates: { canonical: "https://www.thegranite.co.zw/terms" },
  openGraph: {
    title: "Terms of Use — The Granite Post",
    description: "Terms and conditions for using The Granite Post.",
    type: "website",
    url: "https://www.thegranite.co.zw/terms",
    siteName: "The Granite Post",
    locale: "en_ZW",
  },
};

export default function TermsPage() {
  return (
    <main className="gp-container" style={{ maxWidth: 720, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
        Terms of Use
      </h1>
      <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--muted)", fontSize: "0.85rem" }}>
        Last updated: 2 May 2026
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          1. Acceptance of Terms
        </h2>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          By accessing and using The Granite Post (&ldquo;the Site&rdquo;), you accept and
          agree to be bound by these Terms of Use. If you do not agree, please do
          not use the Site.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          2. Intellectual Property
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          All content published on the Site — including articles, images, graphics,
          logos, and multimedia — is the property of The Granite Post or its content
          suppliers and is protected by Zimbabwean and international copyright laws.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          You may not reproduce, distribute, modify, or republish any content from
          the Site without prior written permission. You may share links to our
          content and quote brief excerpts with proper attribution.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          3. User Accounts
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          When you create a reader account, you are responsible for maintaining the
          confidentiality of your login credentials and for all activity under your
          account. You must provide accurate and complete information.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          We reserve the right to suspend or terminate accounts that violate these
          terms or engage in abusive behaviour.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          4. User-Generated Content
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          Comments and other user-submitted content must be lawful, respectful, and
          relevant. We do not pre-moderate all content but reserve the right to
          remove any content at our discretion.
        </p>
        <p style={{ lineHeight: 1.75, color: "var(--text)" }}>
          By submitting content, you grant The Granite Post a non-exclusive,
          royalty-free licence to display it on the Site.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          5. Disclaimer
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          The Site is provided &ldquo;as is.&rdquo; While we strive for accuracy, we make no
          warranties regarding the completeness, reliability, or accuracy of the
          content. The Granite Post shall not be liable for any loss or damage
          arising from your use of the Site.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          6. Third-Party Links
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          The Site may contain links to third-party websites. We are not responsible
          for the content or practices of those sites.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          7. Changes to Terms
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: "1rem", color: "var(--text)" }}>
          We may revise these terms at any time. Continued use of the Site after
          changes constitutes your acceptance of the revised terms.
        </p>
      </section>
    </main>
  );
}
