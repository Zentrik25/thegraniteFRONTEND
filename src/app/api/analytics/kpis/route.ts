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
      `${API_BASE_URL}/api/v1/analytics/trending/?period=${period}&limit=100`,
      { headers: { Authorization: `Bearer ${session}` }, cache: "no-store" },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const raw = await res.json().catch(() => null);
    const items: Array<{ view_count?: number; rank?: number; article?: { slug?: string } }> =
      Array.isArray(raw) ? raw : (raw?.results ?? []);

    const total_views = items.reduce((s, it) => s + (Number(it.view_count) || 0), 0);
    const total_articles = items.length;
    const avg_views_per_article = total_articles > 0 ? Math.round(total_views / total_articles) : 0;
    const top_article_views = items.length > 0 ? (Number(items[0]?.view_count) || 0) : 0;

    return NextResponse.json({ total_views, total_articles, avg_views_per_article, top_article_views });
  } catch (err) {
    console.error("KPI fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}
