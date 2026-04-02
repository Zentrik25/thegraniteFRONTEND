"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";

type Fields = {
  email: string;
  username: string;
  display_name: string;
  password: string;
  confirm_password: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

const INITIAL: Fields = {
  email: "",
  username: "",
  display_name: "",
  password: "",
  confirm_password: "",
};

// ── Validation ────────────────────────────────────────────────────────────────

function validate(fields: Fields): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.email) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!fields.username) {
    errors.username = "Username is required.";
  } else if (fields.username.length < 3) {
    errors.username = "Username must be at least 3 characters.";
  } else if (!/^[a-zA-Z0-9_]+$/.test(fields.username)) {
    errors.username = "Only letters, numbers, and underscores allowed.";
  }

  if (!fields.password) {
    errors.password = "Password is required.";
  } else if (fields.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(fields.password) || !/[0-9]/.test(fields.password)) {
    errors.password = "Include at least one uppercase letter and one number.";
  }

  if (!fields.confirm_password) {
    errors.confirm_password = "Please confirm your password.";
  } else if (fields.confirm_password !== fields.password) {
    errors.confirm_password = "Passwords do not match.";
  }

  return errors;
}

// ── Password strength ─────────────────────────────────────────────────────────

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-400" };
  if (score <= 3) return { score, label: "Fair", color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Good", color: "bg-blue-400" };
  return { score, label: "Strong", color: "bg-green-500" };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterForm() {
  const [fields, setFields] = useState<Fields>(INITIAL);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(fields.password);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof Fields]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const errors = validate(fields);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reader/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fields.email,
          username: fields.username,
          display_name: fields.display_name || undefined,
          password: fields.password,
        }),
      });

      const body = await res.json() as Record<string, unknown>;

      if (!res.ok) {
        // Map Django field errors back to our fields
        const mapped: FieldErrors = {};
        const fieldKeys: Array<keyof Fields> = ["email", "username", "password", "display_name"];

        for (const key of fieldKeys) {
          const val = body[key];
          if (Array.isArray(val)) mapped[key] = (val as string[]).join(" ");
        }

        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
        } else {
          const detail = typeof body.detail === "string" ? body.detail : "Registration failed. Please try again.";
          setServerError(detail);
        }
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="mb-8">
          <Link href="/" className="font-serif text-2xl font-bold text-[var(--ink)]">
            The Granite Post
          </Link>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 shadow-sm flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Check your email</h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            We&rsquo;ve sent a verification link to{" "}
            <strong className="text-[var(--ink)]">{fields.email}</strong>. Click the link to
            activate your account.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Didn&rsquo;t receive it? Check your spam folder.
          </p>
          <Link
            href="/login"
            className="mt-2 text-sm text-[var(--accent)] font-semibold hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Masthead */}
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="font-serif text-2xl font-bold text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
        >
          The Granite Post
        </Link>
        <p className="mt-1 text-sm text-[var(--muted)]">Create your free reader account</p>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-8 shadow-sm flex flex-col gap-5"
      >
        {/* Server error */}
        {serverError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-4 py-3 leading-snug">
            {serverError}
          </div>
        )}

        {/* Email */}
        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={handleChange}
          error={fieldErrors.email}
          disabled={loading}
          required
        />

        {/* Username */}
        <Field
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          value={fields.username}
          onChange={handleChange}
          error={fieldErrors.username}
          disabled={loading}
          hint="Letters, numbers, and underscores only."
          required
        />

        {/* Display name */}
        <Field
          id="display_name"
          label="Display name"
          type="text"
          autoComplete="name"
          value={fields.display_name}
          onChange={handleChange}
          error={fieldErrors.display_name}
          disabled={loading}
          hint="How your name appears on comments. Optional."
        />

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-[var(--ink)]">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={fields.password}
            onChange={handleChange}
            disabled={loading}
            aria-describedby={fieldErrors.password ? "password-error" : "password-strength"}
            className={inputCls(!!fieldErrors.password, loading)}
          />
          {/* Strength bar */}
          {fields.password && (
            <div id="password-strength" className="flex items-center gap-2 mt-0.5">
              <div className="flex gap-0.5 flex-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength.score ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[var(--muted)]">{strength.label}</span>
            </div>
          )}
          {fieldErrors.password && (
            <p id="password-error" className="text-xs text-red-600 mt-0.5">{fieldErrors.password}</p>
          )}
        </div>

        {/* Confirm password */}
        <Field
          id="confirm_password"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={fields.confirm_password}
          onChange={handleChange}
          error={fieldErrors.confirm_password}
          disabled={loading}
          required
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded bg-[var(--accent)] text-white font-bold text-sm tracking-wide hover:bg-[var(--accent-deep)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-1"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {loading ? "Creating account…" : "Create account"}
        </button>

        {/* Sign in link */}
        <p className="text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--accent)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

function inputCls(hasError: boolean, disabled: boolean) {
  return [
    "w-full px-3 py-2.5 text-sm bg-white border rounded transition",
    "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent",
    hasError ? "border-red-400" : "border-[var(--line)]",
    disabled ? "opacity-50 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

interface FieldProps {
  id: keyof Fields;
  label: string;
  type: string;
  autoComplete?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  hint?: string;
  required?: boolean;
}

function Field({ id, label, type, autoComplete, value, onChange, error, disabled, hint, required }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-[var(--ink)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={inputCls(!!error, !!disabled)}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-[var(--muted)]">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
