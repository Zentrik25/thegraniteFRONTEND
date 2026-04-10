import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for The Granite Post website and subscription services.",
};

const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem", fontWeight: 700, color: "#181411", marginBottom: "0.5rem", marginTop: "2rem" };
const P_STYLE = { fontSize: "0.92rem", lineHeight: 1.8, color: "#333", margin: "0 0 0.85rem" };

export default function TermsPage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>Terms of Use</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>Last updated: April 2025</p>

      <p style={P_STYLE}>By accessing or using The Granite Post website and services, you agree to the following terms. Please read them carefully.</p>

      <h2 style={{ ...H2_STYLE, marginTop: "1rem" }}>1. Use of Content</h2>
      <p style={P_STYLE}>All content published on this site — including articles, photographs, graphics and video — is the copyright of The Granite Post or its contributors. You may share links to our articles freely. You may not reproduce, republish or commercially exploit our content without prior written permission.</p>

      <h2 style={H2_STYLE}>2. Accounts</h2>
      <p style={P_STYLE}>You are responsible for maintaining the security of your account and for all activity that occurs under it. You must provide accurate registration information and keep it up to date. You must not share your account credentials with others.</p>

      <h2 style={H2_STYLE}>3. Subscriptions</h2>
      <p style={P_STYLE}>Subscription fees are charged in advance and are non-refundable except where required by law. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period.</p>

      <h2 style={H2_STYLE}>4. Comments & User Content</h2>
      <p style={P_STYLE}>If you post comments or other user-generated content, you grant us a non-exclusive licence to display that content on the site. You must not post content that is defamatory, harassing, obscene, infringing of third-party rights, or unlawful. We reserve the right to remove content and terminate accounts that violate these standards.</p>

      <h2 style={H2_STYLE}>5. Acceptable Use</h2>
      <p style={P_STYLE}>You must not attempt to scrape, index or systematically download site content using automated tools. You must not attempt to circumvent paywalls or access controls. You must not interfere with the site&apos;s infrastructure.</p>

      <h2 style={H2_STYLE}>6. Limitation of Liability</h2>
      <p style={P_STYLE}>The Granite Post publishes information in good faith but does not warrant its completeness or accuracy. We are not liable for any loss or damage arising from reliance on content published on this site.</p>

      <h2 style={H2_STYLE}>7. Governing Law</h2>
      <p style={P_STYLE}>These terms are governed by the laws of Zimbabwe. Any disputes shall be subject to the exclusive jurisdiction of the courts of Zimbabwe.</p>

      <h2 style={H2_STYLE}>8. Changes</h2>
      <p style={P_STYLE}>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the revised terms.</p>

      <h2 style={H2_STYLE}>9. Contact</h2>
      <p style={P_STYLE}>Legal enquiries: <a href="mailto:legal@thegranitepost.co.zw" style={{ color: "#981b1e" }}>legal@thegranitepost.co.zw</a></p>
    </>
  );
}
