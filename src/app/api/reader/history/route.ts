import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

function getToken(request: NextRequest) {
  return request.cookies.get("granite_reader_session")?.value ?? null;
}

/** GET — paginated reading history */
export async function GET(request: NextRequest) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const pageSize = searchParams.get("page_size") ?? "50";

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/accounts/history/?page=${page}&page_size=${pageSize}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

/** POST — record an article view { article_slug } */
export async function POST(request: NextRequest) {
  const token = getToken(request);
  if (!token) return new NextResponse(null, { status: 204 }); // silently drop if unauthenticated

  let body: { article_slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!body.article_slug) {
    return NextResponse.json({ error: "article_slug is required." }, { status: 400 });
  }

  // Fire-and-forget from caller's perspective — always return 204
  fetch(`${API_BASE_URL}/api/v1/accounts/history/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ article_slug: body.article_slug }),
  }).catch(() => {});

  return new NextResponse(null, { status: 204 });
}

/** DELETE — clear all reading history */
export async function DELETE(request: NextRequest) {
  const token = getToken(request);
  if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/history/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (upstream.status === 204 || upstream.ok) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
