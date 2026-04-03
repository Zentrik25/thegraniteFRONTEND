import { browserJson } from "@/lib/api/browser";
import type { NewsletterResponse } from "@/lib/types";

export async function subscribeToNewsletter(payload: {
  email: string;
  source?: string;
}): Promise<NewsletterResponse> {
  // Call the Next.js proxy route — avoids browser→Django direct fetch (CORS / network)
  const res = await fetch("/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const message =
      (body.detail as string) ||
      (body.message as string) ||
      (body.error as string) ||
      "Unable to subscribe right now.";
    throw new Error(message);
  }

  return res.json() as Promise<NewsletterResponse>;
}

// Keep browserJson exported so other callers remain unaffected
export { browserJson };
