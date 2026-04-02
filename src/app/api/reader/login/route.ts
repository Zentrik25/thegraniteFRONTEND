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

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/login/`, {
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

  const response = NextResponse.json({ ok: true });

  response.cookies.set("granite_reader_session", data.access, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  response.cookies.set("granite_reader_refresh", data.refresh, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
