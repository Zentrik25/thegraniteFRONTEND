/**
 * Skeleton shown during RSC streaming on all (site) routes.
 * Mimics the homepage layout so the transition feels instant.
 */
export default function SiteLoading() {
  return (
    <div className="hp-page-wrap" style={{ paddingTop: "1.5rem" }}>
      {/* Hero skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="skel skel-block" style={{ width: "100%", aspectRatio: "16/7" }} />
      </div>

      {/* Section label */}
      <div className="skel skel-line" style={{ width: "120px", height: "0.65rem", marginBottom: "1.25rem" }} />

      {/* Card row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skel skel-block" style={{ width: "100%", aspectRatio: "16/9", marginBottom: "0.5rem" }} />
            <div className="skel skel-line" style={{ width: "50px", height: "0.55rem", marginBottom: "0.4rem" }} />
            <div className="skel skel-line" style={{ width: "95%", height: "0.85rem", marginBottom: "0.3rem" }} />
            <div className="skel skel-line" style={{ width: "80%", height: "0.85rem", marginBottom: "0.5rem" }} />
            <div className="skel skel-line" style={{ width: "140px", height: "0.6rem" }} />
          </div>
        ))}
      </div>

      {/* Latest feed skeleton */}
      <div className="skel skel-line" style={{ width: "80px", height: "0.65rem", marginBottom: "1rem" }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{ display: "flex", gap: "0.85rem", paddingBottom: "0.9rem", marginBottom: "0.9rem", borderBottom: "1px solid #f0f0f0" }}
        >
          <div className="skel skel-block" style={{ width: "80px", height: "60px", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skel skel-line" style={{ width: "90%", height: "0.82rem", marginBottom: "0.35rem" }} />
            <div className="skel skel-line" style={{ width: "70%", height: "0.82rem", marginBottom: "0.5rem" }} />
            <div className="skel skel-line" style={{ width: "120px", height: "0.6rem" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
