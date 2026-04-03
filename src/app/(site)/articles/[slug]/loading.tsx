/**
 * Article detail skeleton — shown while the article page RSC resolves.
 * Mirrors the real article layout so the layout shift is minimal.
 */
export default function ArticleLoading() {
  return (
    <main className="container" id="main-content" style={{ paddingTop: "1.5rem" }}>
      <div className="article-detail-wrap">
        {/* Main column */}
        <div className="article-detail-main">
          {/* Breadcrumb */}
          <div className="skel skel-line" style={{ width: "200px", height: "0.65rem", marginBottom: "1.25rem" }} />

          {/* Kicker */}
          <div className="skel skel-line" style={{ width: "70px", height: "0.55rem", marginBottom: "0.65rem" }} />

          {/* Headline — two lines */}
          <div className="skel skel-line" style={{ width: "92%", height: "2rem", marginBottom: "0.5rem" }} />
          <div className="skel skel-line" style={{ width: "72%", height: "2rem", marginBottom: "1rem" }} />

          {/* Dek */}
          <div className="skel skel-line" style={{ width: "80%", height: "0.9rem", marginBottom: "0.35rem" }} />
          <div className="skel skel-line" style={{ width: "60%", height: "0.9rem", marginBottom: "1.25rem" }} />

          {/* Meta */}
          <div className="skel skel-line" style={{ width: "260px", height: "0.7rem", marginBottom: "1.5rem" }} />

          {/* Hero image */}
          <div className="skel skel-block" style={{ width: "100%", aspectRatio: "16/9", marginBottom: "1.75rem" }} />

          {/* Body paragraphs */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="skel skel-line"
              style={{
                width: `${[96, 88, 92, 75, 96, 82, 90, 68, 94, 78][i]}%`,
                height: "0.9rem",
                marginBottom: "0.8rem",
              }}
            />
          ))}
        </div>

        {/* Sidebar */}
        <aside>
          <div className="skel skel-block" style={{ width: "100%", height: "220px", borderRadius: "4px" }} />
        </aside>
      </div>
    </main>
  );
}
