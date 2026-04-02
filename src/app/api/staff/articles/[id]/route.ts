import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get("granite_staff_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/articles/${id}/`, {
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

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get("granite_staff_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/articles/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session}` },
  });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
