"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface EditProfileFormProps {
  initial: {
    display_name: string;
    avatar_url: string;
    bio: string;
  };
}

type FieldErrors = Partial<Record<"display_name" | "avatar_url" | "bio", string>>;

export default function EditProfileForm({ initial }: EditProfileFormProps) {
  const router = useRouter();

  const [fields, setFields] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
      setSaved(false);
      if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    // Client-side validation
    const errors: FieldErrors = {};
    if (fields.avatar_url && !/^https?:\/\/.+/.test(fields.avatar_url)) {
      errors.avatar_url = "Must be a valid URL starting with http:// or https://";
    }
    if (fields.bio.length > 300) {
      errors.bio = "Bio must be 300 characters or fewer.";
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reader/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: fields.display_name || null,
          avatar_url: fields.avatar_url || null,
          bio: fields.bio || null,
        }),
      });

      const body = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        const mapped: FieldErrors = {};
        for (const key of ["display_name", "avatar_url", "bio"] as const) {
          const val = body[key];
          if (Array.isArray(val)) mapped[key] = (val as string[]).join(" ");
        }
        if (Object.keys(mapped).length) {
          setFieldErrors(mapped);
        } else {
          setServerError(
            typeof body.detail === "string" ? body.detail : "Save failed. Please try again."
          );
        }
        return;
      }

      setSaved(true);
      router.refresh(); // re-fetch server data without full navigation
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = (hasError: boolean) =>
    [
      "w-full px-3 py-2.5 text-sm bg-white border rounded transition",
      "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent",
      hasError ? "border-red-400" : "border-[var(--line)]",
    ].join(" ");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {serverError && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-4 py-3">
          {serverError}
        </div>
      )}

      {/* Display name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="display_name" className="text-sm font-semibold text-[var(--ink)]">
          Display name
        </label>
        <input
          id="display_name"
          type="text"
          autoComplete="nickname"
          value={fields.display_name}
          onChange={update("display_name")}
          disabled={loading}
          maxLength={80}
          placeholder="How your name appears on comments"
          className={inputCls(!!fieldErrors.display_name)}
        />
        {fieldErrors.display_name && (
          <p role="alert" className="text-xs text-red-600">{fieldErrors.display_name}</p>
        )}
      </div>

      {/* Avatar URL */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="avatar_url" className="text-sm font-semibold text-[var(--ink)]">
          Avatar URL
        </label>
        <input
          id="avatar_url"
          type="url"
          autoComplete="url"
          value={fields.avatar_url}
          onChange={update("avatar_url")}
          disabled={loading}
          placeholder="https://example.com/avatar.jpg"
          className={inputCls(!!fieldErrors.avatar_url)}
        />
        {fieldErrors.avatar_url && (
          <p role="alert" className="text-xs text-red-600">{fieldErrors.avatar_url}</p>
        )}
        {/* Live preview */}
        {fields.avatar_url && !fieldErrors.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fields.avatar_url}
            alt="Avatar preview"
            className="w-12 h-12 rounded-full object-cover border border-[var(--line)] mt-1"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="bio" className="text-sm font-semibold text-[var(--ink)]">Bio</label>
          <span className={`text-xs tabular-nums ${fields.bio.length > 280 ? "text-red-500" : "text-[var(--muted)]"}`}>
            {fields.bio.length}/300
          </span>
        </div>
        <textarea
          id="bio"
          rows={3}
          value={fields.bio}
          onChange={update("bio")}
          disabled={loading}
          maxLength={320}
          placeholder="A short description about yourself"
          className={[
            inputCls(!!fieldErrors.bio),
            "resize-none leading-relaxed",
          ].join(" ")}
        />
        {fieldErrors.bio && (
          <p role="alert" className="text-xs text-red-600">{fieldErrors.bio}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-deep)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Saving…" : "Save changes"}
        </button>

        {saved && (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
