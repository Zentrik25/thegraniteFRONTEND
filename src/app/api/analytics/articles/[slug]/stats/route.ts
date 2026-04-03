import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/analytics/articles/${slug}/stats/${qs ? `?${qs}` : ""}`,
    { headers: { Authorization: `Bearer ${session}` } },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
