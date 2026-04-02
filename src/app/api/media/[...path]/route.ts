import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Proxy for Django-served media files.
 *
 * Django builds absolute URLs using request.build_absolute_uri(), which in
 * development resolves to http://127.0.0.1:8000/media/... — unreachable from
 * the browser. This route streams those files through Next.js so the browser
 * always fetches from the same origin.
 *
 * Usage: GET /api/media/<path> → proxies http://127.0.0.1:8000/media/<path>
 */

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { path } = await params;
  const filePath = path.join("/");

  const upstream = await fetch(`${API_BASE_URL}/media/${filePath}`, {
    // No auth header — Django serves media files publicly.
  }).catch(() => null);

  if (!upstream || !upstream.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
