import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

// Backend ModerationActionSerializer accepts only "approve" and "reject".
const ALLOWED_ACTIONS = new Set(["approve", "reject"]);

interface RouteContext {
  params: Promise<{ id: string; action: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id, action } = await params;

  if (!ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/moderation/comments/${id}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify({ action }),
    },
  );

  if (!upstream.ok) {
    const err = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { error: (err as Record<string, string>).detail ?? "Action failed." },
      { status: upstream.status },
    );
  }

  // For native form POST (no JS), redirect back to the referring comments page.
  const referer = request.headers.get("referer");
  const dest = referer ?? "/cms/comments";
  return NextResponse.redirect(new URL(dest, request.url));
}
