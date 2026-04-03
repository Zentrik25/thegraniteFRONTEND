import { TableSkeleton } from "@/components/cms/SkeletonLoader";

export default function CommentsLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ height: "32px", width: "100px", background: "#f0f0f0", borderRadius: "4px" }} />
        ))}
      </div>
      <TableSkeleton rows={10} columns={6} />
    </div>
  );
}
