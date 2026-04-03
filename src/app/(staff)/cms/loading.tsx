import { TableSkeleton } from "@/components/cms/SkeletonLoader";
import CmsShell from "@/components/cms/CmsShell";

export default function CmsLoading() {
  return (
    <CmsShell>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <div style={{ height: "120px", background: "#fff", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
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
        <TableSkeleton rows={6} columns={5} />
      </div>
    </CmsShell>
  );
}
