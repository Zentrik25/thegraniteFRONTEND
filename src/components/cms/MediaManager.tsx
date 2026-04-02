"use client";

import { useState, useRef, useCallback } from "react";
import { formatDate } from "@/lib/format";

interface MediaItem {
  id: string | number;
  url: string;
  thumbnail_url?: string;
  filename: string;
  file_size?: number;
  width?: number;
  height?: number;
  uploaded_at: string;
  alt_text?: string;
}

interface MediaManagerProps {
  initialItems: MediaItem[];
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaManager({ initialItems }: MediaManagerProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        setUploadError(`"${file.name}" exceeds the 10 MB limit.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        setUploadError(`"${file.name}" is not a supported image format.`);
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/staff/media/", { method: "POST", body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setUploadError(
            (body as Record<string, string>).error ?? `Upload failed for "${file.name}".`,
          );
          return;
        }
        const item = (await res.json()) as MediaItem;
        setItems((prev) => [item, ...prev]);
      }
    } catch {
      setUploadError("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  async function handleDelete(item: MediaItem) {
    if (!window.confirm(`Delete "${item.filename}"? This cannot be undone.`)) return;

    setDeletingId(item.id);
    try {
      const res = await fetch(`/api/staff/media/${item.id}/`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        setItems((prev) => prev.filter((m) => m.id !== item.id));
      } else {
        const body = await res.json().catch(() => ({}));
        alert((body as Record<string, string>).error ?? "Delete failed.");
      }
    } catch {
      alert("Network error during delete.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Upload zone */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleUpload(e.dataTransfer.files);
          }}
          style={{
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "1.5rem",
            textAlign: "center",
            background: "#fafafa",
            cursor: "pointer",
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: "0.9rem", color: "#555" }}>
            {uploading ? "Uploading…" : "Drop images here or click to select"}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.25rem" }}>
            JPEG, PNG, WebP, GIF — max 10 MB each
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          style={{ display: "none" }}
          onChange={(e) => void handleUpload(e.target.files)}
        />
        <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1.25rem",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: uploading ? "not-allowed" : "pointer",
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? "Uploading…" : "+ Upload"}
          </button>
          {uploadError && (
            <span role="alert" style={{ color: "#c00", fontSize: "0.875rem" }}>
              {uploadError}
            </span>
          )}
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 && (
        <p style={{ color: "#888" }}>No media uploaded yet.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                aspectRatio: "16/9",
                background: "#f0f0f0",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnail_url ?? item.url}
                alt={item.alt_text ?? item.filename}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>

            <div style={{ padding: "0.5rem 0.6rem 0.6rem" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#333",
                }}
                title={item.filename}
              >
                {item.filename}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#aaa", marginTop: "0.1rem" }}>
                {item.width && item.height ? `${item.width}×${item.height}` : ""}
                {item.file_size ? ` · ${formatBytes(item.file_size)}` : ""}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#bbb" }}>
                {formatDate(item.uploaded_at)}
              </div>

              <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.4rem" }}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  View
                </a>
                <button
                  type="button"
                  onClick={() => void handleDelete(item)}
                  disabled={deletingId === item.id}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "0.75rem",
                    color: "#c00",
                    cursor: deletingId === item.id ? "not-allowed" : "pointer",
                    fontWeight: 600,
                  }}
                >
                  {deletingId === item.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
