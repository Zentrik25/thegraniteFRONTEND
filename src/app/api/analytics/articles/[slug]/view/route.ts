import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/analytics/articles/[slug]/view
 *
 * Server-side proxy for the view-tracking endpoint. Awaits the backend POST so
 * it completes before the serverless function returns (fire-and-forget was being
 * killed before the backend received the request). Returns fresh view_count so
 * the client can update the display without a separate fetch.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  const session =
    request.cookies.get("granite_reader_session")?.value ??
    request.cookies.get("granite_staff_session")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (session) headers["Authorization"] = `Bearer ${session}`;

  // Await the POST so the view is recorded before this function returns
  try {
    await fetch(`${API_BASE_URL}/api/v1/analytics/articles/${slug}/view/`, {
      method: "POST",
      headers,
    });
  } catch {
    // analytics is best-effort — never block the reader
  }

  // Fetch fresh view_count so the client display is accurate
  let view_count: number | null = null;
  try {
    const artRes = await fetch(
      `${API_BASE_URL}/api/v1/articles/${slug}/`,
      { cache: "no-store" }
    );
    if (artRes.ok) {
      const art: unknown = await artRes.json();
      if (art && typeof art === "object" && "view_count" in art) {
        const v = (art as Record<string, unknown>).view_count;
        if (typeof v === "number") view_count = v;
      }
    }
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true, view_count });
}
