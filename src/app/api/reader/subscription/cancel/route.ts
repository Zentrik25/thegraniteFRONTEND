import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("granite_reader_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/subscriptions/cancel/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // cancel_immediately: false → access continues to end of billing period (safe default)
    body: JSON.stringify({ cancel_immediately: false }),
    cache: "no-store",
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
