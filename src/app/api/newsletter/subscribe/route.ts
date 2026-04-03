import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Proxy for newsletter subscription.
 * Browser calls /api/newsletter/subscribe → we forward to Django server-to-server.
 * This avoids the browser trying to reach http://127.0.0.1:8000 directly (CORS / network).
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/v1/newsletter/subscribe/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: b.source ?? "website" }),
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the newsletter service. Please try again." },
      { status: 503 },
    );
  }
}
