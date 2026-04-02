import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getReaderAccessToken } from "@/lib/auth/reader-session";
import { safeApiFetch, unwrapList } from "@/lib/api/fetcher";
import type { ApiListResponse, PaymentRecord } from "@/lib/types";
import { formatDate, formatCurrencyUsd } from "@/lib/format";

export const metadata: Metadata = {
  title: "Payment History",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ── Status config ─────────────────────────────────────────────────────────────

type StatusStyle = { badge: string; dot: string };

function getStatusStyle(status: string): StatusStyle {
  switch (status.toLowerCase()) {
    case "paid":
    case "success":
    case "completed":
      return { badge: "bg-green-100 text-green-800", dot: "bg-green-500" };
    case "failed":
    case "declined":
    case "rejected":
      return { badge: "bg-red-100 text-red-800", dot: "bg-red-500" };
    case "pending":
    case "initiated":
    case "sent":
    case "processing":
      return { badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500" };
    case "refunded":
    case "cancelled":
      return { badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
    default:
      return { badge: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PaymentsPage() {
  const token = await getReaderAccessToken();
  if (!token) redirect("/login?next=/account/payments");

  const { data, status, error } = await safeApiFetch<
    ApiListResponse<PaymentRecord> | PaymentRecord[]
  >("/api/v1/subscriptions/payments/", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (status === 401) redirect("/login?next=/account/payments");

  const payments = data ? unwrapList(data) : [];

  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 flex flex-col gap-8">

        {/* Header */}
        <div>
          <Link
            href="/account/subscription"
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1 mb-3"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Subscription
          </Link>
          <h1 className="font-serif text-2xl font-bold text-[var(--ink)]">Payment History</h1>
          {payments.length > 0 && (
            <p className="text-sm text-[var(--muted)] mt-1">
              {payments.length} {payments.length === 1 ? "transaction" : "transactions"}
            </p>
          )}
        </div>

        {/* API error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded px-4 py-3">
            Failed to load payment history.{" "}
            <a href="/account/payments" className="font-semibold underline">Try again</a>.
          </div>
        )}

        {/* Empty state */}
        {!error && payments.length === 0 && <EmptyState />}

        {/* Payment list */}
        {payments.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg overflow-hidden">
            <ul className="divide-y divide-[var(--line)]" role="list">
              {payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </ul>
          </div>
        )}

      </div>
    </main>
  );
}

// ── Payment row ───────────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: PaymentRecord }) {
  const { badge } = getStatusStyle(payment.status);
  const statusLabel = payment.status_label ?? capitalise(payment.status);
  const methodLabel = payment.payment_method_label ?? capitalise(payment.payment_method);

  // Show local-currency amount when it differs from USD billing
  const showLocalAmount =
    payment.currency &&
    payment.currency.toUpperCase() !== "USD" &&
    payment.amount &&
    payment.amount !== payment.amount_usd;

  return (
    <li className="px-5 py-4 flex items-start justify-between gap-4">
      {/* Left: amount + method + date */}
      <div className="flex flex-col gap-1 min-w-0">
        <span className="font-serif text-base font-bold text-[var(--ink)] leading-none">
          {formatCurrencyUsd(payment.amount_usd)}
        </span>

        {showLocalAmount && (
          <span className="text-xs text-[var(--muted)]">
            {payment.currency} {payment.amount}
          </span>
        )}

        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <span className="text-xs text-[var(--muted)]">{methodLabel}</span>
          {payment.created_at && (
            <>
              <span className="text-[var(--line)] text-xs" aria-hidden="true">·</span>
              <span className="text-xs text-[var(--muted)]">
                {formatDate(payment.created_at)}
              </span>
            </>
          )}
        </div>

        {payment.paynow_reference && (
          <p className="text-xs text-[var(--muted)] font-mono mt-0.5 truncate max-w-[18rem]">
            Ref: {payment.paynow_reference}
          </p>
        )}
      </div>

      {/* Right: status badge */}
      <span
        className={`shrink-0 self-center text-xs font-bold px-2.5 py-1 rounded-full ${badge}`}
      >
        {statusLabel}
      </span>
    </li>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg px-6 py-12 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--line)] flex items-center justify-center">
        <svg
          className="w-6 h-6 text-[var(--muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-[var(--ink)]">No payments yet</p>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-xs leading-relaxed">
          Payments will appear here after your first subscription charge.
        </p>
      </div>
      <Link
        href="/subscribe"
        className="text-sm text-[var(--accent)] font-semibold hover:underline"
      >
        View plans
      </Link>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────

function capitalise(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");
}
