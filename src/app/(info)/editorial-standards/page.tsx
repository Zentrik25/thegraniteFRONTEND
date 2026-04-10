import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Standards",
  description: "The Granite Post's editorial standards: accuracy, fairness, sourcing, conflicts of interest and corrections policy.",
  alternates: { canonical: "/editorial-standards" },
  openGraph: { url: "/editorial-standards" },
};

const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.15rem", fontWeight: 700, color: "#181411", marginBottom: "0.5rem", marginTop: "2rem", borderLeft: "3px solid #981b1e", paddingLeft: "0.75rem" };
const P_STYLE = { fontSize: "0.92rem", lineHeight: 1.8, color: "#333", margin: "0 0 0.85rem" };

export default function EditorialStandardsPage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>Editorial Standards</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>Last updated: April 2025</p>

      <h2 style={{ ...H2_STYLE, marginTop: 0 }}>1. Accuracy</h2>
      <p style={P_STYLE}>We publish only what we can verify. Every factual claim must be supported by at least one reliable, named or documented source before publication. Where a single source is used, this is disclosed. We correct factual errors promptly — see our Corrections policy below.</p>

      <h2 style={H2_STYLE}>2. Independence</h2>
      <p style={P_STYLE}>The Granite Post's editorial decisions are made entirely by its editors, free from influence by advertisers, subscribers, shareholders or government. No external party may request or receive advance sight of stories, except in limited circumstances where legal review is required.</p>

      <h2 style={H2_STYLE}>3. Fairness & Impartiality</h2>
      <p style={P_STYLE}>Individuals and organisations criticised in our reporting are always given a fair opportunity to respond before publication. We represent a range of perspectives on contested political and social questions. Opinion pieces are clearly labelled and do not reflect the editorial position of The Granite Post unless stated.</p>

      <h2 style={H2_STYLE}>4. Sourcing</h2>
      <p style={P_STYLE}>We prefer named, on-the-record sources. Anonymous sources are used only when the information is of clear public interest and cannot be obtained on the record, and when the source's identity is known to and verified by an editor. We do not quote anonymous sources to make generalisations or to attack individuals.</p>

      <h2 style={H2_STYLE}>5. Conflicts of Interest</h2>
      <p style={P_STYLE}>Journalists must disclose any personal, financial or political relationship that could create a conflict with a story they are covering. They must not accept gifts, payments or hospitality from sources, companies or governments they cover.</p>

      <h2 style={H2_STYLE}>6. Privacy</h2>
      <p style={P_STYLE}>We respect the privacy of private individuals. We do not publish private information about individuals unless it is clearly in the public interest. Public figures have a reduced expectation of privacy in their public roles.</p>

      <h2 style={H2_STYLE}>7. Corrections & Complaints</h2>
      <p style={P_STYLE}>If we get something wrong, we correct it as soon as possible, clearly and prominently. Corrections are appended to the original article and noted in our daily newsletter where relevant. To request a correction, email <a href="mailto:corrections@thegranite.co.zw" style={{ color: "#981b1e" }}>corrections@thegranite.co.zw</a>.</p>
      <p style={P_STYLE}>Complaints about our editorial conduct that cannot be resolved directly with editors may be escalated to the Press Council of Zimbabwe.</p>

      <h2 style={H2_STYLE}>8. AI & Automation</h2>
      <p style={P_STYLE}>We do not use AI to generate or substantially draft news articles. AI tools may be used to assist with research, transcription or translation, but all published content is written, edited and verified by human journalists.</p>
    </>
  );
}
