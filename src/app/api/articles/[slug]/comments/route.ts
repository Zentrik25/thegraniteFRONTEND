import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * Proxy for public comment submission.
 * Browser calls POST /api/articles/[slug]/comments
 * → forwards server-to-server to Django (bypasses CORS / direct port access).
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const author_name  = typeof b.author_name  === "string" ? b.author_name.trim()  : "";
  const author_email = typeof b.author_email === "string" ? b.author_email.trim() : "";
  const commentBody  = typeof b.body         === "string" ? b.body.trim()         : "";

  if (!author_name || !author_email || !commentBody) {
    return NextResponse.json(
      { error: "Name, email, and comment are required." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(
      `${API_BASE_URL}/api/v1/articles/${slug}/comments/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_name, author_email, body: commentBody }),
      },
    );

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the server. Please try again." },
      { status: 503 },
    );
  }
}
