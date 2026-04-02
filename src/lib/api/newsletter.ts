import { browserJson } from "@/lib/api/browser";
import type { NewsletterResponse } from "@/lib/types";

export async function subscribeToNewsletter(payload: {
  email: string;
  source?: string;
}): Promise<NewsletterResponse> {
  return browserJson<NewsletterResponse>("/api/v1/newsletter/subscribe/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
