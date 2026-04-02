/**
 * Staff token refresh
 *
 * POST /api/staff/refresh
 *   Called by client components on receiving a 401.
 *   Returns { ok: true } on success or { error } + 401 on failure.
 *   On failure, also deletes both cookies so the browser is in a clean state.
 *
 * GET /api/staff/refresh?next=<path>
 *   Called by middleware when the access cookie is absent but the refresh
 *   cookie is present. Performs the refresh then redirects to `next`.
 *   On failure, redirects to /cms/login?expired=1.
 */

import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import {
  STAFF_ACCESS_COOKIE,
  STAFF_REFRESH_COOKIE,
  staffCookieOpts,
  STAFF_ACCESS_MAX_AGE,
} from "@/lib/auth/staff-session";

export const runtime = "nodejs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}

async function exchangeRefresh(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    return data.access ?? null;
  } catch {
    return null;
  }
}

function clearSession(response: NextResponse) {
  response.cookies.delete(STAFF_ACCESS_COOKIE);
  response.cookies.delete(STAFF_REFRESH_COOKIE);
}

// ── Route handlers ────────────────────────────────────────────────────────────

/** POST — silent refresh called by client components on 401 */
export async function POST(request: NextRequest) {
  const refresh = request.cookies.get(STAFF_REFRESH_COOKIE)?.value;
  if (!refresh) {
    return NextResponse.json({ error: "No refresh token." }, { status: 401 });
  }

  const access = await exchangeRefresh(refresh);
  if (!access) {
    const res = NextResponse.json(
      { error: "Session expired. Please log in again." },
      { status: 401 },
    );
    clearSession(res);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_ACCESS_COOKIE, access, staffCookieOpts(STAFF_ACCESS_MAX_AGE));
  return res;
}

/** GET — middleware-driven refresh + redirect */
export async function GET(request: NextRequest) {
  const refresh = request.cookies.get(STAFF_REFRESH_COOKIE)?.value;
  const next = safeNext(request.nextUrl.searchParams.get("next"), "/cms");

  if (!refresh) {
    return NextResponse.redirect(
      new URL(`/cms/login?next=${encodeURIComponent(next)}`, request.url),
    );
  }

  const access = await exchangeRefresh(refresh);
  if (!access) {
    const res = NextResponse.redirect(
      new URL(`/cms/login?next=${encodeURIComponent(next)}&expired=1`, request.url),
    );
    clearSession(res);
    return res;
  }

  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set(STAFF_ACCESS_COOKIE, access, staffCookieOpts(STAFF_ACCESS_MAX_AGE));
  return res;
}
