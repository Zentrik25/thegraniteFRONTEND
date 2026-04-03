import { ChartSkeleton } from "@/components/cms/SkeletonLoader";

export default function AnalyticsLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Period toggle skeleton */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ height: "32px", width: "100px", background: "#f0f0f0", borderRadius: "4px" }} />
        ))}
      </div>

      {/* KPI Cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "1.25rem",
              minHeight: "120px",
            }}
          >
            <div style={{ height: "32px", background: "#f0f0f0", borderRadius: "4px", marginBottom: "0.5rem" }} />
            <div style={{ height: "16px", background: "#f0f0f0", borderRadius: "4px", width: "70%", marginBottom: "0.5rem" }} />
            <div style={{ height: "14px", background: "#f0f0f0", borderRadius: "4px", width: "50%" }} />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <ChartSkeleton key={i} />
        ))}
      </div>

      {/* Trending articles skeleton */}
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "1rem",
                  height: "100px",
                }}
              >
                <div style={{ height: "16px", background: "#f0f0f0", borderRadius: "4px", marginBottom: "0.5rem" }} />
                <div style={{ height: "16px", background: "#f0f0f0", borderRadius: "4px", width: "60%" }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
