import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.token) {
    return NextResponse.json({ error: "Token is required." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: body.token }),
  });

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as Record<string, string>).detail ?? "Verification failed." },
      { status: upstream.status }
    );
  }

  return NextResponse.json({ ok: true });
}
