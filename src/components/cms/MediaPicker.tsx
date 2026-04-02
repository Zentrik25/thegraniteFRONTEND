"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string | number;
  url: string;
  thumbnail_url?: string;
  filename: string;
  width?: number;
  height?: number;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/staff/media/?page_size=48")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => setItems(data.results ?? []))
      .catch(() => setError("Could not load media library."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Media picker"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "min(90vw, 820px)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Select from media library</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              cursor: "pointer",
              color: "#666",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem" }}>
          {loading && (
            <p style={{ color: "#888", textAlign: "center" }}>Loading…</p>
          )}
          {error && (
            <p style={{ color: "#c00", textAlign: "center" }}>{error}</p>
          )}
          {!loading && !error && items.length === 0 && (
            <p style={{ color: "#888", textAlign: "center" }}>No media uploaded yet.</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.url)}
                title={item.filename}
                style={{
                  padding: 0,
                  border: "2px solid transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: "#f0f0f0",
                  overflow: "hidden",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                }}
              >
                <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.thumbnail_url ?? item.url}
                    alt={item.filename}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div
                  style={{
                    padding: "0.3rem 0.5rem",
                    fontSize: "0.7rem",
                    color: "#555",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.filename}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
