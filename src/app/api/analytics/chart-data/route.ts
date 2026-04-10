import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "day";

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/analytics/trending/?period=${period}&limit=10`,
      { headers: { Authorization: `Bearer ${session}` }, cache: "no-store" },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const raw = await res.json().catch(() => null);
    const items: Array<{ view_count?: number; article?: { title?: string; slug?: string } }> =
      Array.isArray(raw) ? raw : (raw?.results ?? []);

    const shorten = (s: string, max = 28) => (s.length > max ? `${s.slice(0, max)}…` : s);

    return NextResponse.json({
      topArticles: {
        labels: items.map((it) => shorten(it.article?.title ?? it.article?.slug ?? "—")),
        data: items.map((it) => Number(it.view_count) || 0),
      },
    });
  } catch (err) {
    console.error("Chart data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
