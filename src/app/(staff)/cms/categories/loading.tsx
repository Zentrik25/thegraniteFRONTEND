import { TableSkeleton } from "@/components/cms/SkeletonLoader";

export default function CategoriesLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ height: "40px", width: "140px", background: "#f0f0f0", borderRadius: "6px" }} />
      </div>
      <TableSkeleton rows={10} columns={6} />
    </div>
  );
}
