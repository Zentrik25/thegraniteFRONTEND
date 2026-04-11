import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/analytics/articles/[slug]/view
 *
 * Server-side proxy for view tracking. Forwards the visitor's real IP
 * via CF-Connecting-IP, X-Forwarded-For, and X-Real-IP so the Django
 * backend can deduplicate by visitor regardless of which header it reads.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  // Extract the real client IP from Vercel/Cloudflare headers
  const clientIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (clientIp) {
    headers["X-Forwarded-For"] = clientIp;
    headers["X-Real-IP"] = clientIp;
    headers["CF-Connecting-IP"] = clientIp;
  }

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
