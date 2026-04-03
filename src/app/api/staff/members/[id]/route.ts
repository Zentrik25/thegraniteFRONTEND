import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

const VALID_ROLES = new Set(["admin", "editor", "author", "moderator", "senior_editor"]);

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

  let patchBody = body as Record<string, unknown>;
  if (patchBody.role && typeof patchBody.role === "string") {
    const normalizedRole = patchBody.role.toLowerCase();
    if (!VALID_ROLES.has(normalizedRole)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${Array.from(VALID_ROLES).join(", ")}` }, { status: 400 });
    }
    patchBody = { ...patchBody, role: normalizedRole };
  }

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify(patchBody),
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
