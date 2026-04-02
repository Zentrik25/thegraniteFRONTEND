import { API_BASE_URL } from "@/lib/env";
import type { ApiListResponse } from "@/lib/types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function extractApiMessage(body: unknown): string {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body) as unknown;
      return extractApiMessage(parsed);
    } catch {
      return body;
    }
  }
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj["detail"] === "string") return obj["detail"];
    if (typeof obj["message"] === "string") return obj["message"];
    if (typeof obj["error"] === "string") return obj["error"];
    const firstValue = Object.values(obj)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
      return firstValue[0];
    }
  }
  return "An unexpected error occurred.";
}

/** Core server-side fetcher. Throws ApiError on non-2xx responses. */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, options);

  if (!res.ok) {
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      payload = await res.text().catch(() => null);
    }
    throw new ApiError(res.status, extractApiMessage(payload) || res.statusText, payload);
  }

  return res.json() as Promise<T>;
}

/** Safe variant — never throws. Returns { data, status, error }. */
export async function safeApiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T | null; status: number; error: string | null }> {
  try {
    const data = await apiFetch<T>(path, options);
    return { data, status: 200, error: null };
  } catch (err) {
    if (err instanceof ApiError) {
      return { data: null, status: err.status, error: err.message };
    }
    // Network / connection error
    return { data: null, status: 503, error: "Could not reach the API." };
  }
}

/**
 * Normalises paginated or raw-array API responses to a plain array.
 * The Django backend sometimes returns { results: T[] } and sometimes T[].
 */
export function unwrapList<T>(data: ApiListResponse<T> | T[]): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "results" in data) return data.results;
  return [];
}
