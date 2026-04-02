import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

const ALLOWED_ACTIONS = new Set(["approve", "reject", "spam"]);

interface RouteContext {
  params: Promise<{ id: string; action: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get("granite_staff_session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }

  const { id, action } = await params;

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  await fetch(`${API_BASE_URL}/api/v1/staff/comments/${id}/${action}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session}` },
  });

  return NextResponse.redirect(new URL("/cms/comments", request.url));
}
