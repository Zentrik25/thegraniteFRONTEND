import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  /** Optional hint shown next to the title */
  hint?: string;
}

/**
 * Reusable card section for the CMS article editor sidebar and main panels.
 */
export function FormSection({ title, children, hint }: FormSectionProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.55rem 1rem",
          borderBottom: "1px solid #f0f0f0",
          background: "#fafafa",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#555",
          }}
        >
          {title}
        </span>
        {hint && (
          <span style={{ fontSize: "0.7rem", color: "#aaa" }}>{hint}</span>
        )}
      </div>
      <div style={{ padding: "0.875rem 1rem" }}>{children}</div>
    </div>
  );
}
