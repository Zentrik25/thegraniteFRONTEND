import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get("granite_reader_refresh")?.value;

  if (!refresh) {
    return NextResponse.json({ error: "No refresh token." }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!upstream.ok) {
    const response = NextResponse.json({ error: "Session expired." }, { status: 401 });
    response.cookies.delete("granite_reader_session");
    response.cookies.delete("granite_reader_refresh");
    return response;
  }

  const data = (await upstream.json()) as { access: string };
  const isProd = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ ok: true });
  response.cookies.set("granite_reader_session", data.access, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
