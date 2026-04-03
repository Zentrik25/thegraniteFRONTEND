import { FormSkeleton, TableSkeleton } from "@/components/cms/SkeletonLoader";

export default function NewsletterLoading() {
  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <FormSkeleton />
      </div>
      <TableSkeleton rows={8} columns={5} />
    </div>
  );
}
