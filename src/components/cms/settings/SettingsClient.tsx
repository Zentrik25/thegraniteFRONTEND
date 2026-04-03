"use client";

import { useState, useRef } from "react";
import RoleBadge from "@/components/cms/RoleBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffProfile {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
  can_manage_staff?: boolean;
}

interface StaffMemberRow {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
}

interface Props {
  profile: StaffProfile;
  members: StaffMemberRow[];
  canManageStaff: boolean;
}

type Tab = "profile" | "password" | "staff";

const ROLES = ["ADMIN", "EDITOR", "AUTHOR", "MODERATOR"] as const;

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Full access — manage staff, settings, and all content.",
  EDITOR: "Can publish, edit, and delete any article; moderate comments.",
  AUTHOR: "Can create and edit their own drafts; submit for review.",
  MODERATOR: "Can approve and delete comments only.",
};

// ─── Tiny input style ─────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "0.875rem",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 700,
  color: "#555",
  marginBottom: "0.3rem",
};

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({ profile }: { profile: StaffProfile }) {
  const [form, setForm] = useState({
    first_name: profile.first_name ?? "",
    last_name: profile.last_name ?? "",
    email: profile.email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const savingRef = useRef(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/staff/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: form.first_name, last_name: form.last_name }),
      });
      if (!res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        const detail = (data.detail ?? data.error ?? "Failed to save.") as string;
        setMsg({ type: "err", text: detail });
      } else {
        setMsg({ type: "ok", text: "Profile updated." });
      }
    } catch {
      setMsg({ type: "err", text: "Network error." });
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 480 }}>
      <FieldGroup label="Email">
        <input style={{ ...inputStyle, background: "#f8f8f8", color: "#999" }} value={form.email} disabled readOnly />
      </FieldGroup>
      <FieldGroup label="Role">
        <div style={{ marginTop: "2px" }}>
          <RoleBadge role={profile.role} />
        </div>
      </FieldGroup>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <FieldGroup label="First name">
          <input
            style={inputStyle}
            value={form.first_name}
            onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            required
          />
        </FieldGroup>
        <FieldGroup label="Last name">
          <input
            style={inputStyle}
            value={form.last_name}
            onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          />
        </FieldGroup>
      </div>

      {msg && (
        <p style={{ fontSize: "0.85rem", color: msg.type === "ok" ? "#2a7a2a" : "#c00", marginBottom: "0.75rem" }}>
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: "var(--ink)",
          color: "#fff",
          border: "none",
          padding: "0.55rem 1.25rem",
          borderRadius: "4px",
          fontWeight: 700,
          fontSize: "0.875rem",
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

// ─── Password tab ─────────────────────────────────────────────────────────────

function PasswordTab() {
  const [form, setForm] = useState({ old_password: "", new_password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const savingRef = useRef(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    if (form.new_password !== form.confirm) {
      setMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    if (form.new_password.length < 8) {
      setMsg({ type: "err", text: "New password must be at least 8 characters." });
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/staff/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: form.old_password, new_password: form.new_password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        const detail = (data.detail ?? data.error ?? data.old_password ?? "Failed to change password.") as string;
        setMsg({ type: "err", text: Array.isArray(detail) ? (detail as string[])[0] : detail });
      } else {
        setMsg({ type: "ok", text: "Password changed successfully." });
        setForm({ old_password: "", new_password: "", confirm: "" });
      }
    } catch {
      setMsg({ type: "err", text: "Network error." });
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSave} style={{ maxWidth: 380 }}>
      <FieldGroup label="Current password">
        <input
          type="password"
          style={inputStyle}
          value={form.old_password}
          onChange={(e) => setForm((f) => ({ ...f, old_password: e.target.value }))}
          required
          autoComplete="current-password"
        />
      </FieldGroup>
      <FieldGroup label="New password">
        <input
          type="password"
          style={inputStyle}
          value={form.new_password}
          onChange={(e) => setForm((f) => ({ ...f, new_password: e.target.value }))}
          required
          autoComplete="new-password"
          minLength={8}
        />
      </FieldGroup>
      <FieldGroup label="Confirm new password">
        <input
          type="password"
          style={inputStyle}
          value={form.confirm}
          onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          required
          autoComplete="new-password"
        />
      </FieldGroup>

      {msg && (
        <p style={{ fontSize: "0.85rem", color: msg.type === "ok" ? "#2a7a2a" : "#c00", marginBottom: "0.75rem" }}>
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        style={{
          background: "var(--ink)",
          color: "#fff",
          border: "none",
          padding: "0.55rem 1.25rem",
          borderRadius: "4px",
          fontWeight: 700,
          fontSize: "0.875rem",
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

// ─── Staff Management tab ─────────────────────────────────────────────────────

function StaffTab({ initialMembers }: { initialMembers: StaffMemberRow[] }) {
  const [members, setMembers] = useState<StaffMemberRow[]>(initialMembers);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMemberRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleDeactivate(id: string | number) {
    if (!confirm("Deactivate this staff member? They will not be able to log in.")) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/staff/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });
      if (!res.ok) throw new Error("Failed to deactivate.");
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, is_active: false } : m));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Error.");
    }
  }

  async function handleReactivate(id: string | number) {
    setActionError(null);
    try {
      const res = await fetch(`/api/staff/members/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true }),
      });
      if (!res.ok) throw new Error("Failed to reactivate.");
      setMembers((prev) => prev.map((m) => m.id === id ? { ...m, is_active: true } : m));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Error.");
    }
  }

  function onCreated(m: StaffMemberRow) {
    setMembers((prev) => [m, ...prev]);
    setShowCreate(false);
  }

  function onEdited(m: StaffMemberRow) {
    setMembers((prev) => prev.map((r) => r.id === m.id ? m : r));
    setEditTarget(null);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700 }}>
          {members.length} staff member{members.length !== 1 ? "s" : ""}
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            padding: "0.45rem 1rem",
            borderRadius: "4px",
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          + Add staff member
        </button>
      </div>

      {actionError && (
        <p style={{ color: "#c00", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{actionError}</p>
      )}

      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ textAlign: "left", padding: "0.6rem 1rem", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Name / Email</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.5rem", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Role</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.5rem", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Status</th>
              <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "0.65rem 1rem" }}>
                  <div style={{ fontWeight: 600, color: "#111" }}>
                    {[m.first_name, m.last_name].filter(Boolean).join(" ") || "—"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{m.email}</div>
                </td>
                <td style={{ padding: "0.65rem 0.5rem" }}>
                  <RoleBadge role={m.role} />
                </td>
                <td style={{ padding: "0.65rem 0.5rem" }}>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: m.is_active ? "#2a7a2a" : "#888",
                  }}>
                    {m.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "0.65rem 0.75rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => setEditTarget(m)}
                      style={{
                        background: "transparent",
                        border: "1px solid #ddd",
                        color: "var(--accent)",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    {m.is_active ? (
                      <button
                        onClick={() => handleDeactivate(m.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid #f5c2c2",
                          color: "#c00",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(m.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid #b7ddb7",
                          color: "#2a7a2a",
                          padding: "0.25rem 0.6rem",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>
                  No staff members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <StaffModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={(m) => onCreated(m as StaffMemberRow)}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <StaffModal
          mode="edit"
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={(m) => onEdited(m as StaffMemberRow)}
        />
      )}
    </div>
  );
}

// ─── Create / Edit modal ──────────────────────────────────────────────────────

interface StaffModalProps {
  mode: "create" | "edit";
  member?: StaffMemberRow;
  onClose: () => void;
  onSaved: (m: StaffMemberRow) => void;
}

function StaffModal({ mode, member, onClose, onSaved }: StaffModalProps) {
  const [form, setForm] = useState({
    email: member?.email ?? "",
    first_name: member?.first_name ?? "",
    last_name: member?.last_name ?? "",
    role: member?.role ?? "AUTHOR",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError(null);

    try {
      const url = mode === "create" ? "/api/staff/members" : `/api/staff/members/${member!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const body: Record<string, string> = {
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      };
      if (mode === "create") body.password = form.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        const detail = (data.detail ?? data.error ?? data.email ?? "Failed.") as string;
        setError(Array.isArray(detail) ? (detail as string[])[0] : detail);
      } else {
        const saved = (await res.json()) as StaffMemberRow;
        onSaved(saved);
      }
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "1.5rem",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
      }}>
        <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", fontWeight: 700 }}>
          {mode === "create" ? "Add staff member" : "Edit staff member"}
        </h2>

        <form onSubmit={handleSubmit}>
          <FieldGroup label="Email">
            <input
              type="email"
              style={inputStyle}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              disabled={mode === "edit"}
            />
          </FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <FieldGroup label="First name">
              <input
                style={inputStyle}
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              />
            </FieldGroup>
            <FieldGroup label="Last name">
              <input
                style={inputStyle}
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              />
            </FieldGroup>
          </div>
          <FieldGroup label="Role">
            <select
              style={inputStyle}
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </FieldGroup>
          {mode === "create" && (
            <FieldGroup label="Password">
              <input
                type="password"
                style={inputStyle}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </FieldGroup>
          )}

          {error && (
            <p style={{ color: "#c00", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "1px solid #ddd",
                padding: "0.5rem 1rem",
                borderRadius: "4px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "var(--ink)",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1.25rem",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Role reference table ─────────────────────────────────────────────────────

function RoleReferenceTable() {
  return (
    <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", overflow: "hidden", marginTop: "1.5rem" }}>
      <div style={{ padding: "0.65rem 1rem", background: "#f5f5f5", borderBottom: "1px solid #e0e0e0" }}>
        <h2 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>
          Role Reference
        </h2>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e0e0e0" }}>
            <th style={{ textAlign: "left", padding: "0.5rem 1rem", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", color: "#888" }}>Role</th>
            <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", color: "#888" }}>Permissions</th>
          </tr>
        </thead>
        <tbody>
          {ROLES.map((r) => (
            <tr key={r} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: "0.6rem 1rem" }}>
                <RoleBadge role={r} />
              </td>
              <td style={{ padding: "0.6rem 0.75rem", color: "#555", fontSize: "0.82rem" }}>
                {ROLE_DESCRIPTIONS[r]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function SettingsClient({ profile, members, canManageStaff }: Props) {
  const [tab, setTab] = useState<Tab>("profile");

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "0.5rem 1rem",
    border: "none",
    borderBottom: active ? "2px solid var(--ink)" : "2px solid transparent",
    background: "transparent",
    fontWeight: active ? 700 : 400,
    fontSize: "0.875rem",
    color: active ? "#111" : "#777",
    cursor: "pointer",
    marginBottom: "-1px",
  });

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0", marginBottom: "1.5rem" }}>
        <button style={tabStyle(tab === "profile")} onClick={() => setTab("profile")}>My Profile</button>
        <button style={tabStyle(tab === "password")} onClick={() => setTab("password")}>Change Password</button>
        {canManageStaff && (
          <button style={tabStyle(tab === "staff")} onClick={() => setTab("staff")}>Staff Management</button>
        )}
      </div>

      {/* Tab content */}
      {tab === "profile" && <ProfileTab profile={profile} />}
      {tab === "password" && <PasswordTab />}
      {tab === "staff" && canManageStaff && (
        <>
          <StaffTab initialMembers={members} />
          <RoleReferenceTable />
        </>
      )}
    </div>
  );
}
