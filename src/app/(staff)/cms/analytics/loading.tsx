import { ChartSkeleton } from "@/components/cms/SkeletonLoader";

export default function AnalyticsLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              height: "80px",
            }}
          />
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <ChartSkeleton key={i} />
      ))}
    </div>
  );
}
