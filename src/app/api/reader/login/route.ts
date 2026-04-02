import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import type { ReaderLoginRequest, ReaderLoginResponse } from "@/lib/api/reader";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOpts,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
} from "@/lib/auth/reader-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: ReaderLoginRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the server. Try again." }, { status: 502 });
  }

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({})) as Record<string, unknown>;
    const message =
      typeof err.detail === "string"
        ? err.detail
        : typeof err.non_field_errors === "object" && Array.isArray(err.non_field_errors)
        ? (err.non_field_errors as string[]).join(" ")
        : "Invalid username or password.";
    return NextResponse.json({ error: message }, { status: upstream.status });
  }

  const data = await upstream.json() as ReaderLoginResponse;

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, data.access, cookieOpts(ACCESS_MAX_AGE));
  response.cookies.set(REFRESH_COOKIE, data.refresh, cookieOpts(REFRESH_MAX_AGE));
  return response;
}
