import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import {
  STAFF_ACCESS_COOKIE,
  STAFF_REFRESH_COOKIE,
  staffCookieOpts,
  STAFF_ACCESS_MAX_AGE,
  STAFF_REFRESH_MAX_AGE,
} from "@/lib/auth/staff-session";

export const runtime = "nodejs";

/** Reject bodies that aren't exactly { username: string, password: string }. */
function isValidLoginBody(
  raw: unknown,
): raw is { username: string; password: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const { username, password } = raw as Record<string, unknown>;
  return (
    typeof username === "string" &&
    username.length > 0 &&
    username.length <= 150 &&
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= 128
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValidLoginBody(body)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: body.username, password: body.password }),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as Record<string, string>).detail ?? "Invalid credentials." },
      { status: upstream.status },
    );
  }

  const data = (await upstream.json()) as { access: string; refresh: string };

  const response = NextResponse.json({ ok: true });
  response.cookies.set(STAFF_ACCESS_COOKIE, data.access, staffCookieOpts(STAFF_ACCESS_MAX_AGE));
  response.cookies.set(STAFF_REFRESH_COOKIE, data.refresh, staffCookieOpts(STAFF_REFRESH_MAX_AGE));
  return response;
}
