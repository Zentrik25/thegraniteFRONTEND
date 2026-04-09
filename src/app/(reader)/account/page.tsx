import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getReaderAccessToken } from "@/lib/auth/reader-session";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ReaderMeResponse } from "@/lib/types";
import EditProfileForm from "@/components/reader/EditProfileForm";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ── Data ──────────────────────────────────────────────────────────────────────

async function fetchMe(token: string) {
  return safeApiFetch<ReaderMeResponse>("/api/v1/accounts/me/", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AccountPage() {
  const token = await getReaderAccessToken();
  if (!token) redirect("/login?next=/account");

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-14">
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileContent token={token} />
        </Suspense>
      </div>
    </main>
  );
}

// ── Profile (async Server Component) ─────────────────────────────────────────

async function ProfileContent({ token }: { token: string }) {
  const { data: user, status } = await fetchMe(token);

  // Session cookie present but backend rejected it (expired / revoked)
  if (status === 401) redirect("/login?next=/account");

  if (!user) return <ProfileError />;

  const displayName = user.reader_profile?.display_name;
  const initials = (displayName ?? user.username).slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6">

      {/* Avatar + greeting */}
      <div className="flex items-center gap-4">
        <div
          aria-hidden="true"
          className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0"
        >
          <span className="text-white font-bold text-lg leading-none">{initials}</span>
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)] leading-tight">
            {displayName ?? user.username}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Reader account</p>
        </div>
      </div>

      {/* Profile card */}
      <section
        className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl divide-y divide-[var(--line)] overflow-hidden"
        style={{ boxShadow: "rgba(0,0,0,0.06) 0 2px 12px" }}
      >
        <Row label="Display name" value={displayName ?? <span className="text-[var(--muted)] italic">Not set</span>} />
        <Row label="Username"     value={`@${user.username}`} />
        <Row label="Email"        value={user.email} />
      </section>

      {/* Edit profile */}
      <section
        className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl px-5 py-6"
        style={{ boxShadow: "rgba(0,0,0,0.06) 0 2px 12px" }}
      >
        <h2 className="font-semibold text-sm text-[var(--ink)] mb-5">Edit profile</h2>
        <EditProfileForm
          initial={{
            display_name: user.reader_profile?.display_name ?? "",
            avatar_url:   user.reader_profile?.avatar_url ?? "",
            bio:          user.reader_profile?.bio ?? "",
          }}
        />
      </section>

      {/* Sign out */}
      <form action="/api/reader/logout" method="POST">
        <button
          type="submit"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)] underline underline-offset-2 transition-colors"
        >
          Sign out
        </button>
      </form>

    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 px-5 py-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:w-32 shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-[var(--ink)] font-medium break-all">{value}</dd>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading profile">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[var(--line)]" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-36 rounded bg-[var(--line)]" />
          <div className="h-3.5 w-24 rounded bg-[var(--line)]" />
        </div>
      </div>
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl divide-y divide-[var(--line)] overflow-hidden" style={{ boxShadow: "rgba(0,0,0,0.06) 0 2px 12px" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 flex flex-col gap-2">
            <div className="h-3 w-20 rounded bg-[var(--line)]" />
            <div className="h-4 w-48 rounded bg-[var(--line)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

function ProfileError() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl px-6 py-10 text-center flex flex-col items-center gap-4" style={{ boxShadow: "rgba(0,0,0,0.06) 0 2px 12px" }}>
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[var(--ink)]">Couldn&rsquo;t load your profile</p>
        <p className="text-sm text-[var(--muted)] mt-1">Try refreshing the page.</p>
      </div>
      <a
        href="/account"
        className="text-sm text-[var(--accent)] font-semibold hover:underline"
      >
        Refresh
      </a>
    </div>
  );
}
