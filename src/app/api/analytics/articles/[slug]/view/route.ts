import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/analytics/articles/[slug]/view
 *
 * Fallback server-side proxy for view tracking. The primary path is a direct
 * browser→backend call (see ArticleViewTracker). This proxy exists as a
 * fallback and forwards the client's real IP via X-Forwarded-For so the
 * backend can still deduplicate correctly.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  // Forward the real client IP so the backend can deduplicate by visitor
  const clientIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (clientIp) headers["X-Forwarded-For"] = clientIp;

  let view_count: number | null = null;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/analytics/articles/${slug}/view/`,
      { method: "POST", headers },
    );
    if (res.ok) {
      const body: unknown = await res.json();
      if (body && typeof body === "object" && "view_count" in body) {
        const v = (body as Record<string, unknown>).view_count;
        if (typeof v === "number") view_count = v;
      }
    }
  } catch {
    // analytics is best-effort — never block the reader
  }

  return NextResponse.json({ ok: true, view_count });
}
