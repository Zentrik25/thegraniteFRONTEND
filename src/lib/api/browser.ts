"use client";

import { PUBLIC_API_BASE_URL } from "@/lib/env";

export class BrowserApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BrowserApiError";
  }
}

export async function browserJson<T>(
  path: string,
  options?: RequestInit,
  accessToken?: string,
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as Record<string, unknown>;
      message =
        (body["detail"] as string) ||
        (body["message"] as string) ||
        (body["error"] as string) ||
        message;
    } catch {
      // ignore parse failure
    }
    throw new BrowserApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export function getBrowserErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof BrowserApiError) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}
