import type { Metadata } from "next";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/env";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: { index: false, follow: false },
};

// Always fetch fresh — never cache a one-time token call.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

// ── Backend call ──────────────────────────────────────────────────────────────

type VerifyResult =
  | { ok: true }
  | { ok: false; message: string };

async function verifyToken(token: string): Promise<VerifyResult> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/accounts/verify-email/?token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );

    if (res.ok) return { ok: true };

    const body = await res.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof body.detail === "string"
        ? body.detail
        : typeof body.error === "string"
        ? body.error
        : "Verification failed. The link may have expired.";

    return { ok: false, message };
  } catch {
    return { ok: false, message: "Could not reach the server. Please try again." };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  // ── No token: user arrived here directly after registering ────────────────
  if (!token) {
    return (
      <Shell>
        <Icon variant="mail" />
        <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Check your inbox</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
          We&rsquo;ve sent you a verification link. Click it to activate your account.
        </p>
        <p className="text-xs text-[var(--muted)]">
          Didn&rsquo;t receive it? Check your spam folder, or{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline font-medium">
            register again
          </Link>
          .
        </p>
      </Shell>
    );
  }

  const result = await verifyToken(token);

  // ── Success ───────────────────────────────────────────────────────────────
  if (result.ok) {
    return (
      <Shell>
        {/* Meta refresh — server-rendered, no JS required */}
        <meta httpEquiv="refresh" content="3;url=/login?verified=1" />

        <Icon variant="success" />
        <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Email verified!</h1>
        <p className="text-sm text-[var(--muted)]">
          Your account is active. Redirecting you to sign in…
        </p>
        <Link
          href="/login?verified=1"
          className="mt-1 inline-block px-5 py-2.5 rounded bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-deep)] transition-colors"
        >
          Sign in now
        </Link>
      </Shell>
    );
  }

  // ── Failure ───────────────────────────────────────────────────────────────
  return (
    <Shell>
      <Icon variant="error" />
      <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Verification failed</h1>
      <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">{result.message}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-1">
        <Link
          href="/register"
          className="inline-block px-5 py-2.5 rounded bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-deep)] transition-colors text-center"
        >
          Register again
        </Link>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded border border-[var(--line)] text-[var(--ink)] text-sm font-semibold hover:border-[var(--accent)] transition-colors text-center"
        >
          Back to sign in
        </Link>
      </div>
    </Shell>
  );
}

// ── Shared layout shell ───────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-serif text-2xl font-bold text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
          >
            The Granite Post
          </Link>
        </div>
        <div
          className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
          style={{ boxShadow: "rgba(0,0,0,0.08) 0 2px 16px" }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ variant }: { variant: "mail" | "success" | "error" }) {
  const map = {
    mail: {
      bg: "bg-blue-50",
      color: "text-blue-500",
      path: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      ),
    },
    success: {
      bg: "bg-green-50",
      color: "text-green-600",
      path: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      ),
    },
    error: {
      bg: "bg-red-50",
      color: "text-red-500",
      path: (
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      ),
    },
  };

  const { bg, color, path } = map[variant];

  return (
    <div className={`w-14 h-14 rounded-full ${bg} flex items-center justify-center`}>
      <svg
        className={`w-7 h-7 ${color}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {path}
      </svg>
    </div>
  );
}
