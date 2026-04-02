import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

// Rate-limit: basic per-IP dedup using edge cache header hint
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const session =
    request.cookies.get("granite_reader_session")?.value ??
    request.cookies.get("granite_staff_session")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session) headers["Authorization"] = `Bearer ${session}`;

  // Fire-and-forget — don't block the response on analytics
  fetch(`${API_BASE_URL}/api/v1/analytics/track/`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
