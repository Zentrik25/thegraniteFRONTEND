import type { Metadata } from "next";
import Link from "next/link";
import { getSubscriptionPlans } from "@/lib/api/subscriptions";
import SubscriptionCard from "@/components/site/SubscriptionCard";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Subscribe — The Granite Post",
  description:
    "Support independent Zimbabwean journalism. Subscribe to The Granite Post for unlimited access to premium reporting.",
};

export default async function SubscribePage() {
  const plans = await getSubscriptionPlans();

  // Mark the highest-priced paid plan as featured
  const featuredSlug = plans
    .filter((p) => parseFloat(p.price_usd) > 0)
    .sort((a, b) => parseFloat(b.price_usd) - parseFloat(a.price_usd))[0]?.slug ?? null;

  return (
    <main className="min-h-screen bg-[var(--bg)]">

      {/* Hero */}
      <section className="border-b border-[var(--line)] py-14 sm:py-20 px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Subscribe
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--ink)] max-w-xl mx-auto leading-tight">
          Quality journalism worth paying for.
        </h1>
        <p className="mt-4 text-[var(--muted)] text-base max-w-lg mx-auto leading-relaxed">
          The Granite Post is an independent Zimbabwean newsroom. Your subscription
          funds original reporting — not algorithms.
        </p>
      </section>

      {/* Plans grid */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        {plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--muted)] text-sm">
              Subscription plans are being configured. Check back shortly or{" "}
              <Link href="/contact" className="text-[var(--accent)] font-semibold hover:underline">
                contact us
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${plans.length === 3 ? "sm:grid-cols-3" : plans.length === 2 ? "sm:grid-cols-2 max-w-2xl mx-auto" : "max-w-sm mx-auto"}`}>
            {plans.map((plan) => (
              <SubscriptionCard
                key={plan.slug}
                plan={plan}
                featured={plan.slug === featuredSlug}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust strip */}
      <section className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-6 items-center text-center">
          <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
            Why subscribe?
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3 text-left w-full">
            {[
              "Unflinching coverage of Zimbabwean politics and economy",
              "Premium investigations not available anywhere else",
              "Ad-free reading on every device",
              "Support an independent newsroom — not a conglomerate",
              "Full archive access from day one",
              "Newsletter briefings from our editorial team",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
                <svg
                  className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer nudge */}
      <p className="text-center text-xs text-[var(--muted)] py-8 px-4">
        Already a subscriber?{" "}
        <Link href="/login" className="text-[var(--accent)] font-semibold hover:underline">
          Sign in
        </Link>
        .{" "}
        Have questions?{" "}
        <Link href="/contact" className="text-[var(--accent)] font-semibold hover:underline">
          Contact us
        </Link>
        .
      </p>

    </main>
  );
}
