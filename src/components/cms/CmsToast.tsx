"use client";

import { useEffect } from "react";

interface CmsToastProps {
  message: string;
  tone?: "success" | "error";
  onDismiss: () => void;
}

export default function CmsToast({
  message,
  tone = "success",
  onDismiss,
}: CmsToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 3200);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  const background = tone === "success" ? "#155724" : "#721c24";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "1.25rem",
        zIndex: 1100,
        maxWidth: "360px",
        background,
        color: "#fff",
        padding: "0.8rem 1rem",
        borderRadius: "8px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.18)",
        fontSize: "0.875rem",
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}
