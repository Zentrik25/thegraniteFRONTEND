import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "day";
  const limit = searchParams.get("limit") ?? "10";

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/analytics/trending/?period=${period}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${session}` } },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
