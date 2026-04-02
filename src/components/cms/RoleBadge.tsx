interface RoleBadgeProps {
  role: string;
}

const ROLE_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ADMIN:     { bg: "#f8d7da", color: "#721c24", label: "Admin" },
  EDITOR:    { bg: "#d1ecf1", color: "#0c5460", label: "Editor" },
  AUTHOR:    { bg: "#d4edda", color: "#155724", label: "Author" },
  MODERATOR: { bg: "#fff3cd", color: "#856404", label: "Moderator" },
};

/** Single-source badge for staff roles across all CMS pages. */
export default function RoleBadge({ role }: RoleBadgeProps) {
  const style = ROLE_STYLES[role] ?? { bg: "#e2e3e5", color: "#383d41", label: role };
  return (
    <span
      style={{
        display: "inline-block",
        background: style.bg,
        color: style.color,
        padding: "0.15rem 0.55rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {style.label}
    </span>
  );
}
