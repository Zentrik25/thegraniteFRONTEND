import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/analytics/articles/[slug]/view
 *
 * Server-side proxy for the view-tracking endpoint. Runs through Next.js so
 * the backend URL stays server-only and so we can attach the reader session
 * as a Bearer token (for per-user dedup on the backend).
 *
 * Fire-and-forget: always returns 200 so the client is never blocked.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  const session =
    request.cookies.get("granite_reader_session")?.value ??
    request.cookies.get("granite_staff_session")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session) headers["Authorization"] = `Bearer ${session}`;

  // Fire-and-forget — don't let analytics block the response
  fetch(`${API_BASE_URL}/api/v1/analytics/articles/${slug}/view/`, {
    method: "POST",
    headers,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
