import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = request.cookies.get("granite_staff_session")?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const upstream = await fetch(`${API_BASE_URL}/api/v1/staff/articles/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session}`,
    },
    body: JSON.stringify(body),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
