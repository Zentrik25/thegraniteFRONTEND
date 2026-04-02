import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getReaderAccessToken } from "@/lib/auth/reader-session";
import { getSubscriptionPlans } from "@/lib/api/subscriptions";
import { formatCurrencyUsd } from "@/lib/format";
import PaymentStatus from "@/components/reader/PaymentStatus";

export const metadata: Metadata = {
  title: "Checkout — The Granite Post",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ plan?: string }>;
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { plan: planSlug } = await searchParams;

  // No plan in URL → send back to plans listing
  if (!planSlug) redirect("/subscribe");

  // Auth guard — the reader must be logged in to pay
  const token = await getReaderAccessToken();
  if (!token) {
    redirect(
      `/login?next=${encodeURIComponent(`/subscribe/checkout?plan=${planSlug}`)}`
    );
  }

  // Validate the slug against live plan data (also gives us name + price for the summary)
  const plans = await getSubscriptionPlans();
  const plan = plans.find((p) => p.slug === planSlug);
  if (!plan) redirect("/subscribe");

  // Free plans need no checkout flow
  if (parseFloat(plan.price_usd) === 0) redirect("/register");

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col">

      {/* Minimal top bar */}
      <header className="border-b border-[var(--line)] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Plans
          </Link>
          <span className="font-serif text-sm font-bold text-[var(--ink)]">
            The Granite Post
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md flex flex-col gap-5">

          {/* Order summary card */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Subscribing to
              </p>
              <p className="font-serif text-lg font-bold text-[var(--ink)] mt-0.5 truncate">
                {plan.name}
              </p>
              {plan.description && (
                <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-1">
                  {plan.description}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-serif text-2xl font-bold text-[var(--ink)] leading-none">
                {formatCurrencyUsd(plan.price_usd)}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">
                / {plan.billing_period_label.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Payment state machine */}
          <PaymentStatus planSlug={planSlug} />

          {/* Trust note */}
          <p className="text-xs text-center text-[var(--muted)]">
            Secured by PayNow · Cancel anytime from your account
          </p>

        </div>
      </div>

    </main>
  );
}
