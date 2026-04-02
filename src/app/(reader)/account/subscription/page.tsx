import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getReaderAccessToken } from "@/lib/auth/reader-session";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { Subscription, SubscriptionStatus } from "@/lib/types";
import { formatDate, formatCurrencyUsd } from "@/lib/format";
import CancelButton from "./CancelButton";

export const metadata: Metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; badge: string; text: string }
> = {
  active:    { label: "Active",    badge: "bg-green-100 text-green-800",  text: "text-green-700" },
  trialing:  { label: "Trial",     badge: "bg-blue-100 text-blue-800",    text: "text-blue-700"  },
  past_due:  { label: "Past due",  badge: "bg-amber-100 text-amber-800",  text: "text-amber-700" },
  cancelled: { label: "Cancelled", badge: "bg-red-100 text-red-800",      text: "text-red-700"   },
  expired:   { label: "Expired",   badge: "bg-gray-100 text-gray-600",    text: "text-gray-500"  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SubscriptionPage() {
  const token = await getReaderAccessToken();
  if (!token) redirect("/login?next=/account/subscription");

  const { data: sub, status } = await safeApiFetch<Subscription>(
    "/api/v1/subscriptions/my-subscription/",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  if (status === 401) redirect("/login?next=/account/subscription");

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 flex flex-col gap-8">

        {/* Header */}
        <div>
          <Link
            href="/account"
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1 mb-3"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Account
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Subscription</h1>
        </div>

        {/* No subscription (404) */}
        {status === 404 || !sub ? (
          <NoSubscription />
        ) : (
          <ActiveSubscription sub={sub} />
        )}

      </div>
    </main>
  );
}

// ── Active subscription card ───────────────────────────────────────────────────

function ActiveSubscription({ sub }: { sub: Subscription }) {
  const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.expired;
  const plan = sub.plan;

  const features = Array.isArray(plan.features)
    ? plan.features
    : typeof plan.features === "string"
    ? plan.features.split("\n").filter(Boolean)
    : [];

  const canCancel =
    sub.is_active_subscription &&
    !sub.cancel_at_period_end &&
    (sub.status === "active" || sub.status === "trialing");

  return (
    <div className="flex flex-col gap-5">

      {/* Plan card */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">

        {/* Top bar */}
        <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[var(--line)]">
          <div>
            <p className="font-serif text-lg font-bold text-[var(--ink)]">{plan.name}</p>
            <p className="text-sm text-[var(--muted)] mt-0.5">{plan.description}</p>
          </div>
          <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
            {sub.status_label}
          </span>
        </div>

        {/* Rows */}
        <dl className="divide-y divide-[var(--line)]">
          <Row label="Price">
            <span className="font-semibold">{formatCurrencyUsd(plan.price_usd)}</span>
            <span className="text-[var(--muted)]"> / {plan.billing_period_label.toLowerCase()}</span>
          </Row>

          <Row label="Access">{plan.article_access_label}</Row>

          <Row label="Current period">
            {formatDate(sub.current_period_start)} – {formatDate(sub.current_period_end)}
          </Row>

          {sub.is_active_subscription && sub.days_remaining > 0 && (
            <Row label="Renews in">
              <span className={sub.days_remaining <= 7 ? cfg.text : ""}>
                {sub.days_remaining} {sub.days_remaining === 1 ? "day" : "days"}
              </span>
            </Row>
          )}

          {sub.cancel_at_period_end && (
            <Row label="Cancels on">
              <span className="text-amber-700 font-medium">
                {formatDate(sub.current_period_end)} — access continues until then
              </span>
            </Row>
          )}

          {sub.cancelled_at && !sub.cancel_at_period_end && (
            <Row label="Cancelled">
              {formatDate(sub.cancelled_at)}
            </Row>
          )}
        </dl>

        {/* Payments link */}
        <div className="px-5 py-3 border-t border-[var(--line)]">
          <Link
            href="/account/payments"
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1"
          >
            View payment history
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Features */}
      {features.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">
            What&rsquo;s included
          </h2>
          <ul className="flex flex-col gap-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
                <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Past due warning */}
      {sub.status === "past_due" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <strong>Payment overdue.</strong> Your access may be restricted. Please renew to continue reading.
        </div>
      )}

      {/* Resubscribe CTA */}
      {(sub.status === "expired" || sub.status === "cancelled") && (
        <Link
          href="/subscribe"
          className="w-full py-3 rounded bg-[var(--accent)] text-white text-sm font-bold text-center hover:bg-[var(--accent-deep)] transition-colors"
        >
          Resubscribe
        </Link>
      )}

      {/* Danger zone — cancel */}
      {canCancel && (
        <div className="flex flex-col gap-3 pt-2 border-t border-[var(--line)]">
          <CancelButton periodEnd={sub.current_period_end} />
        </div>
      )}

    </div>
  );
}

// ── No subscription ────────────────────────────────────────────────────────────

function NoSubscription() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg px-6 py-12 flex flex-col items-center gap-5 text-center">
      <div className="w-14 h-14 rounded-full bg-[var(--line)] flex items-center justify-center">
        <svg className="w-7 h-7 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
      </div>
      <div>
        <p className="font-serif text-xl font-bold text-[var(--ink)]">No active subscription</p>
        <p className="text-sm text-[var(--muted)] mt-1.5 max-w-xs leading-relaxed">
          Subscribe to unlock premium articles and support independent Zimbabwean journalism.
        </p>
      </div>
      <Link
        href="/subscribe"
        className="px-6 py-3 rounded bg-[var(--accent)] text-white text-sm font-bold hover:bg-[var(--accent-deep)] transition-colors"
      >
        View plans
      </Link>
    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 px-5 py-3.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] sm:w-36 shrink-0">
        {label}
      </dt>
      <dd className="text-sm text-[var(--ink)]">{children}</dd>
    </div>
  );
}
