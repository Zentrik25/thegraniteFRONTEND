import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

const VALID_ROLES = new Set(["ADMIN", "EDITOR", "AUTHOR", "MODERATOR"]);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/${id}/`, {
    headers: { Authorization: `Bearer ${session}` },
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    body &&
    typeof body === "object" &&
    "role" in (body as Record<string, unknown>) &&
    !VALID_ROLES.has((body as Record<string, unknown>).role as string)
  ) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/${id}/`, {
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
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session}` },
  });

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
