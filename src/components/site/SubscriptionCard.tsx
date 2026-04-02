import Link from "next/link";
import type { SubscriptionPlan } from "@/lib/types";
import { formatCurrencyUsd } from "@/lib/format";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  featured?: boolean;
}

export default function SubscriptionCard({ plan, featured = false }: SubscriptionCardProps) {
  const features: string[] = Array.isArray(plan.features)
    ? plan.features.filter(Boolean)
    : typeof plan.features === "string"
    ? plan.features.split("\n").filter(Boolean)
    : [];

  const isFree = parseFloat(plan.price_usd) === 0;
  const ctaHref = isFree ? "/register" : `/subscribe/checkout?plan=${plan.slug}`;
  const ctaLabel = isFree ? "Start free" : "Subscribe";

  return (
    <div
      className={[
        "relative flex flex-col rounded-2xl border overflow-hidden",
        featured
          ? "border-[var(--accent)] shadow-xl shadow-[var(--accent)]/10 bg-[var(--surface)]"
          : "border-[var(--line)] bg-[var(--surface)]",
      ].join(" ")}
    >
      {featured && (
        <div className="bg-[var(--accent)] text-white text-xs font-bold tracking-widest uppercase text-center py-1.5 px-4">
          Most popular
        </div>
      )}

      <div className="flex flex-col gap-6 p-7 flex-1">
        {/* Plan header */}
        <div>
          <p className="font-serif text-xl font-bold text-[var(--ink)]">{plan.name}</p>
          {plan.description && (
            <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{plan.description}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-1.5">
          <span className="font-serif text-4xl font-bold text-[var(--ink)] leading-none">
            {formatCurrencyUsd(plan.price_usd)}
          </span>
          <span className="text-sm text-[var(--muted)] mb-0.5">
            / {plan.billing_period_label.toLowerCase()}
          </span>
        </div>

        {/* Feature list */}
        {features.length > 0 && (
          <ul className="flex flex-col gap-2.5 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--ink)]">
                <svg
                  className={`w-4 h-4 shrink-0 mt-0.5 ${featured ? "text-[var(--accent)]" : "text-green-500"}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <Link
          href={ctaHref}
          className={[
            "mt-auto w-full py-3 rounded-lg text-sm font-bold text-center transition-colors",
            featured
              ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)]"
              : "bg-[var(--line)] text-[var(--ink)] hover:bg-[var(--muted)]/20",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
