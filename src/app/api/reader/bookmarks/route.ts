import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("granite_reader_session")?.value;
  // Not logged in — return empty list so caller can treat as "not bookmarked"
  if (!token) return NextResponse.json({ count: 0, results: [] }, { status: 200 });

  const search = new URL(request.url).searchParams.toString();
  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/accounts/bookmarks/${search ? `?${search}` : ""}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const data = await upstream.json().catch(() => ({ count: 0, results: [] }));
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("granite_reader_session")?.value;
  if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

  let body: { article_slug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (!body.article_slug) {
    return NextResponse.json({ error: "article_slug is required." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/accounts/bookmarks/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ article_slug: body.article_slug }),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
