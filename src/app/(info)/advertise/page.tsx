import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise",
  description: "Reach engaged Zimbabwean readers with The Granite Post advertising options — display, native, newsletters and events.",
  alternates: { canonical: "/advertise" },
  openGraph: { url: "/advertise" },
};

const H2_STYLE = { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "1.1rem", fontWeight: 700, color: "#181411", marginBottom: "0.5rem" };
const P_STYLE = { fontSize: "0.92rem", lineHeight: 1.75, color: "#333", margin: "0 0 0.75rem" };

const FORMATS = [
  { name: "Display Advertising", desc: "Leaderboard (728×90), MPU (300×250) and skin placements across all site sections. Geo-targeted to Zimbabwe and diaspora markets in the UK, US, Australia and South Africa." },
  { name: "Sponsored Content", desc: "Long-form branded articles written by our editorial team or supplied by you and reviewed for accuracy and disclosure. Clearly labelled as paid content." },
  { name: "Newsletter Sponsorship", desc: "Exclusive sponsorship of our daily morning briefing, delivered to thousands of verified subscribers each weekday." },
  { name: "Branded Events", desc: "Associate your brand with The Granite Post's editorial events, roundtables and award ceremonies." },
];

export default function AdvertisePage() {
  return (
    <>
      <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "2rem", fontWeight: 900, color: "#181411", marginBottom: "0.25rem" }}>Advertise with Us</h1>
      <p style={{ ...P_STYLE, color: "#655b54", marginBottom: "2rem" }}>Reach Zimbabwe&apos;s most engaged news audience across desktop, mobile and email.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {FORMATS.map((f) => (
          <div key={f.name} style={{ border: "1px solid #dbcdbd", padding: "1.25rem" }}>
            <h2 style={{ ...H2_STYLE, marginTop: 0 }}>{f.name}</h2>
            <p style={{ ...P_STYLE, margin: 0 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#181411", color: "#fff", padding: "2rem 1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fff" }}>Request a Media Kit</h2>
        <p style={{ fontSize: "0.92rem", lineHeight: 1.7, color: "rgba(255,255,255,0.8)", marginBottom: "1rem" }}>Our advertising team will send you audience demographics, rate cards and available inventory within one business day.</p>
        <a
          href="mailto:advertising@thegranite.co.zw"
          style={{ display: "inline-block", background: "#981b1e", color: "#fff", padding: "0.6rem 1.25rem", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", letterSpacing: "0.02em" }}
        >
          Email advertising@thegranite.co.zw
        </a>
      </div>

      <p style={P_STYLE}>All advertising is subject to our <a href="/editorial-standards" style={{ color: "#981b1e" }}>editorial standards</a> and must be clearly labelled. We do not accept advertising from political parties, tobacco or gambling companies.</p>
    </>
  );
}
