import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { ReaderMeResponse } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getProfile(accessToken: string) {
  return safeApiFetch<ReaderMeResponse>("/api/v1/accounts/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

export default async function AccountPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_reader_session");
  if (!session?.value) redirect("/login?next=/account");

  const { data: user, error } = await getProfile(session.value);

  if (error || !user) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700 }}>
          My Account
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "1rem" }}>
          Unable to load your profile. Please try refreshing.
        </p>
      </div>
    );
  }

  const profile = user.reader_profile;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700 }}>
          My Account
        </h1>
        <p style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
          Welcome back, {user.first_name || user.username}
        </p>
      </div>

      {/* Profile card */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "6px",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>Profile</h2>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem 1rem", fontSize: "0.9rem" }}>
          <dt style={{ color: "var(--muted)" }}>Name</dt>
          <dd>{[user.first_name, user.last_name].filter(Boolean).join(" ") || "—"}</dd>
          <dt style={{ color: "var(--muted)" }}>Username</dt>
          <dd>{user.username}</dd>
          <dt style={{ color: "var(--muted)" }}>Email</dt>
          <dd>{user.email}</dd>
          {profile?.bio && (
            <>
              <dt style={{ color: "var(--muted)" }}>Bio</dt>
              <dd>{profile.bio}</dd>
            </>
          )}
        </dl>
      </section>

      {/* Subscription */}
      {profile?.subscription_status && (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Subscription
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            Status:{" "}
            <strong style={{ color: "var(--ink)" }}>
              {profile.subscription_status.replace("_", " ")}
            </strong>
          </p>
          <Link
            href="/account/subscription"
            style={{ color: "var(--accent)", fontSize: "0.875rem", fontWeight: 600 }}
          >
            Manage subscription →
          </Link>
        </section>
      )}

      {/* Quick links */}
      <nav
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        {[
          { label: "Bookmarks", href: "/account/bookmarks" },
          { label: "Reading history", href: "/account/history" },
          { label: "Subscription", href: "/account/subscription" },
          { label: "Newsletter", href: "/#newsletter" },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "6px",
              padding: "1rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "var(--ink)",
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <form action="/api/reader/logout" method="POST">
        <button
          type="submit"
          style={{
            background: "transparent",
            border: "1px solid var(--line)",
            padding: "0.625rem 1.25rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "var(--muted)",
          }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
