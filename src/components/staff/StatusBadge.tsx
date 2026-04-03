const STATUS: Record<string, { bg: string; color: string; dot: string; label: string }> = {
  published: { bg: "#d4edda", color: "#155724", dot: "#28a745", label: "Published" },
  draft:     { bg: "#e2e3e5", color: "#383d41", dot: "#6c757d", label: "Draft" },
  archived:  { bg: "#fff3cd", color: "#856404", dot: "#ffc107", label: "Archived" },
};

export function StatusBadge({ status }: { status: string }) {
  const key = (status ?? "draft").toLowerCase();
  const s = STATUS[key] ?? { bg: "#eee", color: "#444", dot: "#aaa", label: status };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        background: s.bg,
        color: s.color,
        padding: "0.18rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.72rem",
        fontWeight: 600,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}
