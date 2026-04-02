import type { Metadata } from "next";
import Link from "next/link";

import { getSubscriptionPlans } from "@/lib/api/articles";
import { formatCurrencyUsd } from "@/lib/format";

export const metadata: Metadata = {
  title: "Subscribe",
  description:
    "Support independent Zimbabwean journalism. Subscribe to The Granite Post for unlimited access to premium reporting.",
};

export default async function SubscribePage() {
  const plans = await getSubscriptionPlans();

  const BENEFITS = [
    "Unlimited access to all articles, including premium reporting",
    "Breaking news alerts and morning briefing newsletter",
    "Full archive access — every story ever published",
    "Support independent, accountable Zimbabwean journalism",
    "Ad-free reading experience on all devices",
  ];

  return (
    <main className="container" id="main-content">
      {/* Header */}
      <header className="page-header" style={{ textAlign: "center", borderBottom: "none", paddingBottom: "0.5rem" }}>
        <p className="page-header-eyebrow">Subscribe</p>
        <h1
          className="page-header-title"
          style={{ maxWidth: "20ch", margin: "0 auto 0.5rem" }}
        >
          Quality journalism worth paying for.
        </h1>
        <p
          className="page-header-desc"
          style={{ maxWidth: "50ch", margin: "0 auto" }}
        >
          The Granite Post is an independent newsroom. Your subscription funds
          original reporting, not algorithms.
        </p>
      </header>

      {/* Plans */}
      {plans.length === 0 ? (
        <div style={{ margin: "2rem 0" }}>
          <p className="copy" style={{ textAlign: "center" }}>
            Subscription plans are being configured. Check back shortly or{" "}
            <Link className="story-cat-link" href="/contact">
              contact us
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="plans-grid" style={{ margin: "2rem 0" }}>
          {plans.map((plan) => {
            const features: string[] = Array.isArray(plan.features)
              ? (plan.features as string[]).filter(Boolean)
              : typeof plan.features === "string"
              ? plan.features.split("\n").filter(Boolean)
              : [];

            return (
              <div className="plan-card" key={plan.slug}>
                <div>
                  <p className="plan-card-name">{plan.name}</p>
                  <div className="plan-card-price">
                    <span className="plan-price-amount">
                      {formatCurrencyUsd(plan.price_usd)}
                    </span>
                    <span className="plan-price-period">
                      / {plan.billing_period_label || plan.billing_period}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="plan-description">{plan.description}</p>
                  )}
                </div>

                {features.length > 0 && (
                  <ul className="plan-features-list" aria-label="Plan features">
                    {features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}

                {plan.article_access_label && (
                  <p
                    className="meta"
                    style={{ fontSize: "0.78rem", fontStyle: "italic" }}
                  >
                    {plan.article_access_label}
                  </p>
                )}

                <Link
                  className="btn-primary"
                  href={`/account?subscribe=${plan.slug}`}
                  style={{ textAlign: "center" }}
                >
                  Get started
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Benefits list */}
      <div
        style={{
          background: "var(--surface-strong)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius)",
          padding: "1.5rem",
          margin: "0 0 2rem",
        }}
      >
        <h2
          className="news-section-label"
          style={{ marginBottom: "1rem" }}
        >
          What&apos;s included
        </h2>
        <ul className="plan-features-list" style={{ maxWidth: "44ch" }}>
          {BENEFITS.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      {/* FAQ nudge */}
      <p className="meta" style={{ textAlign: "center", paddingBottom: "1.5rem" }}>
        Already a subscriber?{" "}
        <Link className="story-cat-link" href="/login">
          Sign in to your account
        </Link>
        .{" "}
        Questions?{" "}
        <Link className="story-cat-link" href="/contact">
          Contact us
        </Link>
        .
      </p>
    </main>
  );
}
