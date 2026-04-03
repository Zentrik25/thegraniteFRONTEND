import { TableSkeleton } from "@/components/cms/SkeletonLoader";

export default function ArticlesLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ height: "40px", width: "120px", background: "#f0f0f0", borderRadius: "6px" }} />
      </div>
      <TableSkeleton rows={10} columns={7} />
    </div>
  );
}
