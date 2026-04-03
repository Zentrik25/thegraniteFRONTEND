import type { CSSProperties } from "react";

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  height?: string;
}

const shimmerStyle: CSSProperties = {
  animation: "shimmer 2s infinite",
  backgroundImage: "linear-gradient(90deg, #f0f0f0 0%, #e8e8e8 50%, #f0f0f0 100%)",
  backgroundSize: "200% 100%",
};

export function TableSkeleton({ rows = 8, columns = 6 }: SkeletonLoaderProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f7f7f7", borderBottom: "1px solid #e6e6e6" }}>
              {Array.from({ length: columns }).map((_, i) => (
                <th
                  key={i}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontWeight: 600,
                  }}
                >
                  <div
                    style={{
                      height: "16px",
                      borderRadius: "4px",
                      ...shimmerStyle,
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: "1px solid #f2f2f2" }}>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} style={{ padding: "0.75rem 1rem" }}>
                    <div
                      style={{
                        height: "16px",
                        borderRadius: "4px",
                        ...shimmerStyle,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div style={{ height: "120px", borderRadius: "4px", ...shimmerStyle }} />
            <div style={{ height: "16px", borderRadius: "4px", ...shimmerStyle }} />
            <div style={{ height: "16px", width: "70%", borderRadius: "4px", ...shimmerStyle }} />
            <div style={{ height: "24px", marginTop: "auto", borderRadius: "4px", ...shimmerStyle }} />
          </div>
        ))}
      </div>
    </>
  );
}

export function ChartSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ height: "24px", width: "150px", borderRadius: "4px", ...shimmerStyle }} />
        <div style={{ height: "300px", borderRadius: "4px", ...shimmerStyle }} />
      </div>
    </>
  );
}

export function FormSkeleton() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ gridColumn: i < 2 ? "auto" : "1 / -1" }}>
            <div style={{ height: "16px", width: "80px", borderRadius: "4px", marginBottom: "0.5rem", ...shimmerStyle }} />
            <div style={{ height: "40px", borderRadius: "4px", ...shimmerStyle }} />
          </div>
        ))}
      </div>
    </>
  );
}
