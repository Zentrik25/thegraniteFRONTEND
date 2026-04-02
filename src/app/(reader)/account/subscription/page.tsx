import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeApiFetch } from "@/lib/api/fetcher";
import type { Subscription, PaymentRecord, ApiListResponse } from "@/lib/types";
import Link from "next/link";
import { formatDate, formatCurrencyUsd } from "@/lib/format";

export const metadata: Metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("granite_reader_session");
  if (!session?.value) redirect("/login?next=/account/subscription");

  const headers = { Authorization: `Bearer ${session.value}` };

  const [subRes, paymentsRes] = await Promise.all([
    safeApiFetch<Subscription>("/api/v1/subscriptions/my/", { headers, cache: "no-store" }),
    safeApiFetch<ApiListResponse<PaymentRecord>>("/api/v1/subscriptions/payments/?page_size=10", {
      headers,
      cache: "no-store",
    }),
  ]);

  const sub = subRes.data;
  const payments = paymentsRes.data?.results ?? [];

  const statusColor: Record<string, string> = {
    active: "#155724",
    trialing: "#0c5460",
    past_due: "#856404",
    cancelled: "#721c24",
    expired: "#6c757d",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <Link href="/account" style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
          ← Account
        </Link>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "1.75rem", fontWeight: 700, marginTop: "0.5rem" }}>
          Subscription
        </h1>
      </div>

      {!sub ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
            You don&rsquo;t have an active subscription.
          </p>
          <Link
            href="/subscribe"
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "#fff",
              padding: "0.625rem 1.5rem",
              borderRadius: "4px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            View plans
          </Link>
        </div>
      ) : (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontWeight: 700, fontSize: "1.05rem" }}>
              {sub.plan?.name ?? "Subscription"}
            </h2>
            <span
              style={{
                background: statusColor[sub.status] ? `${statusColor[sub.status]}20` : "#eee",
                color: statusColor[sub.status] ?? "#333",
                padding: "0.2rem 0.6rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {sub.status}
            </span>
          </div>

          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem 1rem", fontSize: "0.875rem" }}>
            {sub.current_period_end && (
              <>
                <dt style={{ color: "var(--muted)" }}>Renews / expires</dt>
                <dd>{formatDate(sub.current_period_end)}</dd>
              </>
            )}
            {sub.plan?.price_usd && (
              <>
                <dt style={{ color: "var(--muted)" }}>Price</dt>
                <dd>{formatCurrencyUsd(sub.plan.price_usd)} / {sub.plan.billing_period}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      {payments.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Payment history
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: "var(--muted)", fontWeight: 600 }}>Date</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: "var(--muted)", fontWeight: 600 }}>Amount</th>
                <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: "var(--muted)", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "0.5rem 0.25rem" }}>{formatDate(p.created_at)}</td>
                  <td style={{ padding: "0.5rem 0.25rem" }}>{formatCurrencyUsd(p.amount)}</td>
                  <td style={{ padding: "0.5rem 0.25rem", textTransform: "capitalize" }}>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
