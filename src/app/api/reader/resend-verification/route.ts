import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/resend-verification/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: body.email }),
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
