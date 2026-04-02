import Link from "next/link";

interface EmptyStateProps {
  title: string;
  copy?: string;
  action?: { label: string; href: string };
}

export function EmptyState({ title, copy, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state-title">{title}</p>
      {copy && <p className="empty-state-copy">{copy}</p>}
      {action && (
        <Link
          className="btn-primary btn-sm"
          href={action.href}
          style={{ marginTop: "1rem" }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
