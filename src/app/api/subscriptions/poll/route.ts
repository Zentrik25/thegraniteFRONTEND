import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = request.cookies.get("granite_reader_session")?.value;
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get("poll_id");

  if (!pollId) return NextResponse.json({ error: "poll_id is required." }, { status: 400 });

  const upstream = await fetch(
    `${API_BASE_URL}/api/v1/subscriptions/paynow/poll/?poll_id=${encodeURIComponent(pollId)}`,
    {
      headers: { Authorization: `Bearer ${session}` },
      cache: "no-store",
    }
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
