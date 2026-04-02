"use client";

/**
 * Client-side fetch helpers with automatic token refresh on 401.
 *
 * These wrap calls to the Next.js route handlers (not Django directly).
 * The route handlers read httpOnly cookies, so the client never touches tokens.
 *
 * Flow on 401:
 *   1. Call /api/reader/refresh (POST) — sets a new access cookie via Set-Cookie
 *   2. Retry the original request — the browser sends the new cookie automatically
 *   3. If still 401, the session is dead: throw SessionExpiredError so the
 *      caller can redirect the user to the login page
 *
 * Usage (in a client component):
 *   import { readerFetch, SessionExpiredError } from "@/lib/api/authed-fetch";
 *
 *   const res = await readerFetch("/api/reader/bookmarks", { method: "POST", ... });
 *   // throws SessionExpiredError if session cannot be refreshed
 */

export class SessionExpiredError extends Error {
  constructor(public readonly kind: "reader" | "staff") {
    super(`${kind} session expired`);
    this.name = "SessionExpiredError";
  }
}

async function withRefresh(
  kind: "reader" | "staff",
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status !== 401) return res;

  // Attempt silent refresh
  const refreshEndpoint =
    kind === "reader" ? "/api/reader/refresh" : "/api/staff/refresh";

  const refreshRes = await fetch(refreshEndpoint, { method: "POST" });

  if (!refreshRes.ok) {
    throw new SessionExpiredError(kind);
  }

  // Retry with the new cookie the browser now holds
  const retried = await fetch(input, init);

  if (retried.status === 401) {
    throw new SessionExpiredError(kind);
  }

  return retried;
}

/**
 * Fetch wrapper for reader-authenticated route handlers.
 * Throws SessionExpiredError if the session cannot be recovered.
 */
export function readerFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return withRefresh("reader", input, init);
}

/**
 * Fetch wrapper for staff-authenticated route handlers.
 * Throws SessionExpiredError if the session cannot be recovered.
 */
export function staffFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return withRefresh("staff", input, init);
}

/**
 * Redirect to the appropriate login page after a SessionExpiredError.
 * Call this in a catch block when readerFetch / staffFetch throws.
 *
 * The `next` parameter will be appended as ?next=<current path> so the
 * login page can redirect back after a successful sign-in.
 */
export function redirectToLogin(
  err: unknown,
  currentPath: string = typeof window !== "undefined" ? window.location.pathname : "/",
): boolean {
  if (!(err instanceof SessionExpiredError)) return false;

  const target =
    err.kind === "reader"
      ? `/login?next=${encodeURIComponent(currentPath)}&expired=1`
      : `/cms/login?next=${encodeURIComponent(currentPath)}&expired=1`;

  window.location.href = target;
  return true;
}
