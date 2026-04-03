import { TableSkeleton } from "@/components/cms/SkeletonLoader";

export default function SectionsLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: "32px", width: "80px", background: "#f0f0f0", borderRadius: "999px" }} />
          ))}
        </div>
        <div style={{ height: "40px", width: "120px", background: "#f0f0f0", borderRadius: "6px" }} />
      </div>
      <TableSkeleton rows={8} columns={8} />
    </div>
  );
}
