import { browserJson } from "@/lib/api/browser";
import type { ApiListResponse, PaymentRecord, Subscription, SubscriptionPlan } from "@/lib/types";

export async function getSubscriptionPlans() {
  const { safeApiFetch, unwrapList } = await import("@/lib/api/fetcher");
  const result = await safeApiFetch<ApiListResponse<SubscriptionPlan>>(
    "/api/v1/subscriptions/plans/",
    { next: { revalidate: 600 } },
  );
  return result.data ? unwrapList(result.data) : [];
}

export async function getMySubscription(accessToken: string) {
  return browserJson<Subscription>("/api/v1/subscriptions/my-subscription/", {
    method: "GET",
  }, accessToken);
}

export async function startSubscription(
  payload: { plan: string; payment_method: string },
  accessToken: string,
) {
  return browserJson<Subscription>("/api/v1/subscriptions/subscribe/", {
    method: "POST",
    body: JSON.stringify(payload),
  }, accessToken);
}

export async function cancelSubscription(accessToken: string) {
  return browserJson<{ detail: string }>("/api/v1/subscriptions/cancel/", {
    method: "POST",
  }, accessToken);
}

export async function getPayments(accessToken: string) {
  return browserJson<ApiListResponse<PaymentRecord>>("/api/v1/subscriptions/payments/", {
    method: "GET",
  }, accessToken);
}

export async function pollPaymentStatus(pollUrl: string) {
  const res = await fetch(pollUrl);
  if (!res.ok) throw new Error("Poll request failed");
  return res.json() as Promise<{ status: string; status_label?: string }>;
}
