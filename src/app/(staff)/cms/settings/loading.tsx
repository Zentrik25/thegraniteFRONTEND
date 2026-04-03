import { FormSkeleton } from "@/components/cms/SkeletonLoader";

export default function SettingsLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <div style={{ height: "24px", width: "150px", background: "#f0f0f0", borderRadius: "4px", marginBottom: "1rem" }} />
          <FormSkeleton />
        </div>
      ))}
    </div>
  );
}
