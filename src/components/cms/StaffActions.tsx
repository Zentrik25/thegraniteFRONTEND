"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import RoleBadge from "@/components/cms/RoleBadge";
import { formatDate } from "@/lib/format";
import type { StaffMember } from "@/app/(staff)/cms/staff/page";

const ROLES = ["admin", "editor", "author", "moderator", "senior_editor"] as const;
type StaffRole = (typeof ROLES)[number];

interface InviteForm {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: StaffRole;
  password: string;
  password_confirm: string;
}

interface EditForm {
  first_name: string;
  last_name: string;
  role: StaffRole;
  is_active: boolean;
}

interface StaffActionsProps {
  initialMembers: StaffMember[];
  fetchError: string | null;
}

export default function StaffActions({ initialMembers, fetchError }: StaffActionsProps) {
  const router = useRouter();
  const [members, setMembers] = useState<StaffMember[]>(initialMembers);

  // ── Invite ─────────────────────────────────────────────────────────────────
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    role: "author",
    password: "",
    password_confirm: "",
  });
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);

  function updateInvite<K extends keyof InviteForm>(key: K, value: InviteForm[K]) {
    setInviteForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setInviteError(null);
    
    // Validate password match
    if (inviteForm.password !== inviteForm.password_confirm) {
      setInviteError("Passwords do not match. Please try again.");
      return;
    }
    
    // Validate password length
    if (inviteForm.password.length < 8) {
      setInviteError("Password must be at least 8 characters.");
      return;
    }
    
    setInviting(true);
    try {
      const res = await fetch("/api/staff/members/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email,
          username: inviteForm.username,
          first_name: inviteForm.first_name,
          last_name: inviteForm.last_name,
          role: inviteForm.role,
          password: inviteForm.password,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        let msg = "Failed to create staff member.";
        
        console.error("Staff creation error response:", body);
        
        if (typeof body === "object" && body !== null) {
          // Handle nested 'errors' field (common in validation responses)
          if ((body as Record<string, unknown>).errors) {
            const errorsObj = (body as Record<string, unknown>).errors as Record<string, unknown>;
            const errorList = Object.entries(errorsObj)
              .map(([k, v]) => {
                if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
                if (typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
                return `${k}: ${v}`;
              })
              .filter(e => e);
            if (errorList.length > 0) {
              msg = errorList.join(" | ");
            }
          }
          // Handle error objects with error/detail/message fields
          else if ((body as Record<string, unknown>).error) {
            msg = String((body as Record<string, string>).error);
          } else if ((body as Record<string, unknown>).detail) {
            msg = String((body as Record<string, string>).detail);
          } else if ((body as Record<string, unknown>).message) {
            msg = String((body as Record<string, string>).message);
          } else if ((body as Record<string, unknown>).non_field_errors) {
            const nonFieldErrors = (body as Record<string, unknown>).non_field_errors;
            if (Array.isArray(nonFieldErrors)) {
              msg = nonFieldErrors.join(" | ");
            }
          } else {
            // Try to extract field errors from root level
            const fieldErrors = Object.entries(body as Record<string, unknown>)
              .filter(([k]) => !["status", "code", "request_id"].includes(k))
              .map(([k, v]) => {
                if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
                if (typeof v === "object") return `${k}: ${JSON.stringify(v)}`;
                return `${k}: ${v}`;
              })
              .filter(e => e);
            if (fieldErrors.length > 0) {
              msg = fieldErrors.join(" | ");
            }
          }
        }
        
        setInviteError(msg);
        return;
      }
      setMembers((prev) => [...prev, body as StaffMember]);
      setInviteForm({ email: "", username: "", first_name: "", last_name: "", role: "author", password: "", password_confirm: "" });
      setShowInvite(false);
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setInviting(false);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    role: "author",
    is_active: true,
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  function openEdit(m: StaffMember) {
    setEditingId(m.id);
    setEditForm({
      first_name: m.first_name,
      last_name: m.last_name,
      role: m.role as StaffRole,
      is_active: m.is_active,
    });
    setEditError(null);
  }

  function updateEdit<K extends keyof EditForm>(key: K, value: EditForm[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleEditSave(e: FormEvent) {
    e.preventDefault();
    if (editingId === null) return;
    setEditError(null);
    setEditSaving(true);
    try {
      const res = await fetch(`/api/staff/members/${editingId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const body = await res.json();
      if (!res.ok) {
        const msg =
          typeof body === "object"
            ? Object.entries(body as Record<string, unknown>)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" | ")
            : String((body as Record<string, string>).error ?? "Failed.");
        setEditError(msg);
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, ...(body as StaffMember) } : m)),
      );
      setEditingId(null);
      router.refresh();
    } catch {
      setEditError("Network error.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  async function handleDelete(member: StaffMember) {
    const name =
      [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;
    if (
      !window.confirm(
        `Remove "${name}" (${member.email}) from staff?\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(member.id);
    try {
      const res = await fetch(`/api/staff/members/${member.id}/`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        setMembers((prev) => prev.filter((m) => m.id !== member.id));
        router.refresh();
      } else {
        const body = await res.json().catch(() => ({}));
        alert((body as Record<string, string>).error ?? "Delete failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Shared field style ─────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.45rem 0.65rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.875rem",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "0.8rem",
    display: "block",
    marginBottom: "0.25rem",
    color: "#444",
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.25rem" }}>
        <button
          type="button"
          onClick={() => setShowInvite((v) => !v)}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          {showInvite ? "Cancel" : "+ Add staff member"}
        </button>
      </div>

      {/* ── Invite form ──────────────────────────────────────────────────── */}
      {showInvite && (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: "6px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem", fontSize: "0.95rem", fontWeight: 700 }}>
            New staff member
          </h2>
          <form onSubmit={handleInvite}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => updateInvite("email", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Username *</label>
                <input
                  type="text"
                  required
                  value={inviteForm.username}
                  onChange={(e) => updateInvite("username", e.target.value)}
                  style={inputStyle}
                  placeholder="letters, digits, @/./+/-/_ only"
                />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <select
                  required
                  value={inviteForm.role}
                  onChange={(e) => updateInvite("role", e.target.value as StaffRole)}
                  style={inputStyle}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  type="text"
                  value={inviteForm.first_name}
                  onChange={(e) => updateInvite("first_name", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Last name</label>
                <input
                  type="text"
                  value={inviteForm.last_name}
                  onChange={(e) => updateInvite("last_name", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Initial password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={inviteForm.password}
                  onChange={(e) => updateInvite("password", e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={inviteForm.password_confirm}
                  onChange={(e) => updateInvite("password_confirm", e.target.value)}
                  style={inputStyle}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {inviteError && (
              <div
                role="alert"
                style={{
                  background: "#fff0f0",
                  border: "1px solid #f5c6cb",
                  color: "#721c24",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.825rem",
                  marginBottom: "0.75rem",
                }}
              >
                {inviteError}
              </div>
            )}

            <button
              type="submit"
              disabled={inviting}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1.25rem",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: inviting ? "not-allowed" : "pointer",
                opacity: inviting ? 0.7 : 1,
              }}
            >
              {inviting ? "Creating…" : "Create member"}
            </button>
          </form>
        </div>
      )}

      {/* ── Fetch error ───────────────────────────────────────────────────── */}
      {fetchError && (
        <div
          role="alert"
          style={{
            background: "#fff0f0",
            border: "1px solid #f5c6cb",
            color: "#721c24",
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}
        >
          Could not load staff list. {fetchError}
        </div>
      )}

      {/* ── Staff table ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
              <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Email</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Role</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Joined</th>
              <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: "2rem", textAlign: "center", color: "#999" }}
                >
                  No staff members found.
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                  {[m.first_name, m.last_name].filter(Boolean).join(" ") || "—"}
                </td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#555" }}>{m.email}</td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <RoleBadge role={m.role} />
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <span
                    style={{
                      color: m.is_active ? "#155724" : "#721c24",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    {m.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 0.5rem", color: "#888" }}>
                  {formatDate(m.date_joined)}
                </td>
                <td style={{ padding: "0.75rem 0.5rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => openEdit(m)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "var(--accent)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(m)}
                      disabled={deletingId === m.id}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        color: "#c00",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: deletingId === m.id ? "not-allowed" : "pointer",
                        opacity: deletingId === m.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === m.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      {editingId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit staff member"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingId(null); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "8px",
              padding: "1.5rem",
              width: "min(90vw, 480px)",
            }}
          >
            <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>
              Edit staff member
            </h2>
            <form onSubmit={handleEditSave}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => updateEdit("first_name", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => updateEdit("last_name", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Role *</label>
                  <select
                    required
                    value={editForm.role}
                    onChange={(e) => updateEdit("role", e.target.value as StaffRole)}
                    style={inputStyle}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}
                      </option>
                    ))}
                  </select>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => updateEdit("is_active", e.target.checked)}
                  />
                  Account active
                </label>

                {editError && (
                  <div
                    role="alert"
                    style={{
                      background: "#fff0f0",
                      border: "1px solid #f5c6cb",
                      color: "#721c24",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "4px",
                      fontSize: "0.825rem",
                    }}
                  >
                    {editError}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    type="submit"
                    disabled={editSaving}
                    style={{
                      background: "var(--accent)",
                      color: "#fff",
                      border: "none",
                      padding: "0.5rem 1.25rem",
                      borderRadius: "4px",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: editSaving ? "not-allowed" : "pointer",
                      opacity: editSaving ? 0.7 : 1,
                    }}
                  >
                    {editSaving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    style={{
                      background: "transparent",
                      border: "1px solid #ddd",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
