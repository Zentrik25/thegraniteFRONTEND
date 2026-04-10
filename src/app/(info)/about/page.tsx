import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about The Granite Post — Zimbabwe's independent news organisation committed to accuracy, fairness and press freedom.",
};

const SECTION_STYLE = { marginBottom: "2rem" };
const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.35rem", fontWeight: 700, color: "#181411", marginBottom: "0.6rem", borderBottom: "2px solid #981b1e", paddingBottom: "0.4rem" };
const P_STYLE = { fontSize: "0.95rem", lineHeight: 1.75, color: "#333", margin: "0 0 0.9rem" };

export default function AboutPage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>About Us</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>Independent Zimbabwean journalism since 2024.</p>

      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Our Mission</h2>
        <p style={P_STYLE}>The Granite Post exists to hold power to account, amplify Zimbabwean voices and deliver accurate, fair reporting on the issues that matter most to citizens of Zimbabwe and the diaspora.</p>
        <p style={P_STYLE}>We are editorially independent. Our journalism is funded by readers, not by political parties, governments or special interests. We believe a free press is inseparable from a free society.</p>
      </div>

      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>What We Cover</h2>
        <p style={P_STYLE}>We cover politics, business, technology, sport, opinion and Africa-wide affairs. Our reporters are based in Harare, Bulawayo and Johannesburg, with a network of correspondents across the region.</p>
      </div>

      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Editorial Independence</h2>
        <p style={P_STYLE}>The Granite Post operates under a strict separation between its commercial activities and its editorial operations. Advertisers and subscribers have no influence over news coverage. Our <a href="/editorial-standards" style={{ color: "#981b1e" }}>Editorial Standards</a> document describes our approach to sourcing, accuracy, fairness and corrections.</p>
      </div>

      <div style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Contact Us</h2>
        <p style={P_STYLE}>For editorial enquiries, tips, corrections or partnership proposals, visit our <a href="/contact" style={{ color: "#981b1e" }}>Contact page</a> or email <a href="mailto:editor@thegranitepost.co.zw" style={{ color: "#981b1e" }}>editor@thegranitepost.co.zw</a>.</p>
      </div>
    </>
  );
}
