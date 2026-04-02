/**
 * Reader token refresh
 *
 * POST /api/reader/refresh
 *   Called by client components on receiving a 401.
 *   Returns { ok: true } on success or { error } + 401 on failure.
 *   On failure, also deletes both cookies so the browser is in a clean state.
 *
 * GET /api/reader/refresh?next=<path>
 *   Called by middleware when the access cookie is absent but the refresh
 *   cookie is present. Performs the refresh then redirects to `next`.
 *   On failure, redirects to /login?expired=1.
 */

import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOpts,
  ACCESS_MAX_AGE,
} from "@/lib/auth/reader-session";

export const runtime = "nodejs";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Only allow relative paths on this origin to prevent open-redirect attacks. */
function safeNext(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return fallback;
  }
  return raw;
}

/** Exchange a refresh token for a new access token. Returns null on any failure. */
async function exchangeRefresh(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/accounts/token/refresh/`, {
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
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

// ── Route handlers ────────────────────────────────────────────────────────────

/** POST — silent refresh called by client components on 401 */
export async function POST(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
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
  res.cookies.set(ACCESS_COOKIE, access, cookieOpts(ACCESS_MAX_AGE));
  return res;
}

/** GET — middleware-driven refresh + redirect */
export async function GET(request: NextRequest) {
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const next = safeNext(request.nextUrl.searchParams.get("next"), "/account");

  if (!refresh) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, request.url),
    );
  }

  const access = await exchangeRefresh(refresh);
  if (!access) {
    const res = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}&expired=1`, request.url),
    );
    clearSession(res);
    return res;
  }

  const res = NextResponse.redirect(new URL(next, request.url));
  res.cookies.set(ACCESS_COOKIE, access, cookieOpts(ACCESS_MAX_AGE));
  return res;
}
