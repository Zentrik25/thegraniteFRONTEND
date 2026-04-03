"use client";

import type { ReactNode } from "react";

interface CmsModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: string;
}

export default function CmsModal({
  title,
  children,
  onClose,
  width = "min(92vw, 760px)",
}: CmsModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(17, 17, 17, 0.46)",
        padding: "1.25rem",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width,
          maxHeight: "calc(100vh - 2.5rem)",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.22)",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              border: "none",
              background: "transparent",
              color: "#777",
              fontSize: "1.1rem",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}
