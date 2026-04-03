import { CardGridSkeleton } from "@/components/cms/SkeletonLoader";

export default function AdsLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ height: "40px", width: "100px", background: "#f0f0f0", borderRadius: "6px" }} />
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}
