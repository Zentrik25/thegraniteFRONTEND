import { CardGridSkeleton } from "@/components/cms/SkeletonLoader";

export default function MediaLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ height: "40px", width: "120px", background: "#f0f0f0", borderRadius: "6px" }} />
      </div>
      <CardGridSkeleton count={12} />
    </div>
  );
}
