import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

// The [id] segment is the article SLUG — backend ArticleDetailView uses slug as lookup_field.
interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/articles/<slug>/ — partial update
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id: slug } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const upstream = await fetch(`${API_BASE_URL}/api/v1/articles/${slug}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

// DELETE /api/v1/articles/<slug>/ — archives the article (backend soft-delete)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id: slug } = await params;

  const upstream = await fetch(`${API_BASE_URL}/api/v1/articles/${slug}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session}` },
  });

  // Backend returns 200 with { detail, status } on archive, not 204.
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
