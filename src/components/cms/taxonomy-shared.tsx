import type { CSSProperties, ReactNode } from "react";

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.55rem 0.75rem",
  border: "1px solid #d6d6d6",
  borderRadius: "6px",
  fontSize: "0.875rem",
  background: "#fff",
  boxSizing: "border-box",
};

export const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.35rem",
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "#444",
};

export const hintStyle: CSSProperties = {
  marginTop: "0.28rem",
  fontSize: "0.73rem",
  lineHeight: 1.45,
  color: "#8a8a8a",
};

export const primaryButtonStyle: CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  padding: "0.55rem 1rem",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontWeight: 700,
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  background: "#fff",
  color: "#333",
  border: "1px solid #ddd",
  padding: "0.55rem 1rem",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
};

export const dangerButtonStyle: CSSProperties = {
  background: "#8e1e20",
  color: "#fff",
  border: "none",
  padding: "0.55rem 1rem",
  borderRadius: "6px",
  fontSize: "0.875rem",
  fontWeight: 700,
  cursor: "pointer",
};

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint ? <div style={hintStyle}>{hint}</div> : null}
      {error ? (
        <div
          role="alert"
          style={{ marginTop: "0.3rem", fontSize: "0.75rem", color: "#b42318" }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

export function InlineBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "muted";
}) {
  const tones: Record<string, CSSProperties> = {
    neutral: { background: "#f3f3f3", color: "#444" },
    accent: { background: "#f9e5e5", color: "#7b171a" },
    success: { background: "#e7f6ea", color: "#155724" },
    warning: { background: "#fff3cd", color: "#856404" },
    danger: { background: "#fde8e8", color: "#7f1d1d" },
    muted: { background: "#efefef", color: "#777" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.2rem",
        padding: "0.18rem 0.56rem",
        borderRadius: "999px",
        fontSize: "0.74rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...tones[tone],
      }}
    >
      {children}
    </span>
  );
}

export function ModalActions({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: "0.75rem",
        marginTop: "1.25rem",
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}
