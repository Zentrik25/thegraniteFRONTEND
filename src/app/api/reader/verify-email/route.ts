import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email || !body.code) {
    return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email, code: body.code }),
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(
      { error: (data as Record<string, string>).detail ?? "Verification failed." },
      { status: upstream.status }
    );
  }

  return NextResponse.json({ ok: true });
}
