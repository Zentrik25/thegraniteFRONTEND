import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as Record<string, string>).detail ?? "Invalid credentials." },
      { status: upstream.status }
    );
  }

  const data = (await upstream.json()) as { access: string; refresh: string };

  const isProd = process.env.NODE_ENV === "production";
  const maxAge60m = 60 * 60;
  const maxAge7d = 7 * 24 * 60 * 60;

  const response = NextResponse.json({ ok: true });

  response.cookies.set("granite_staff_session", data.access, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAge60m,
  });

  response.cookies.set("granite_staff_refresh", data.refresh, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAge7d,
  });

  return response;
}
