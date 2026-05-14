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

  if (process.env.NODE_ENV !== "production") {
    console.log("[resend-verification] Proxying to backend for:", body.email);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/resend-verification/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email }),
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[resend-verification] Network error reaching backend:", err);
    }
    return NextResponse.json(
      { error: "Could not reach the server. Please try again." },
      { status: 502 }
    );
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[resend-verification] Backend responded:", upstream.status);
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({})) as Record<string, string>;
    return NextResponse.json(
      { error: data.detail ?? data.error ?? "Could not resend verification email." },
      { status: upstream.status }
    );
  }

  return NextResponse.json({ ok: true });
}
