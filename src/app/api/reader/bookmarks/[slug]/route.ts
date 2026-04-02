import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const token = request.cookies.get("granite_reader_session")?.value;
  if (!token) return NextResponse.json({ error: "Login required." }, { status: 401 });

  const { slug } = await params;

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/accounts/bookmarks/${encodeURIComponent(slug)}/`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // DELETE is idempotent — 204 means success
  if (upstream.status === 204 || upstream.ok) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
