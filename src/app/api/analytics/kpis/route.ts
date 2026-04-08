import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";
import type { TrendingArticle } from "@/lib/types";

export const runtime = "nodejs";

interface KpiResponse {
  total_views: number;
  total_articles: number;
  avg_views_per_article: number;
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "day";

  try {
    // Derive KPIs from the real trending endpoint (limit=100 gives a broad sample)
    const res = await fetch(
      `${API_BASE_URL}/api/v1/analytics/trending/?period=${period}&limit=100`,
      { headers: { Authorization: `Bearer ${session}` } },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const raw = await res.json().catch(() => null);
    const items: TrendingArticle[] = Array.isArray(raw)
      ? raw
      : (raw as { results?: TrendingArticle[] } | null)?.results ?? [];

    const total_views = items.reduce((sum, item) => sum + (item.view_count ?? 0), 0);
    const total_articles = items.length;
    const avg_views_per_article =
      total_articles > 0 ? total_views / total_articles : 0;

    const kpi: KpiResponse = { total_views, total_articles, avg_views_per_article };
    return NextResponse.json(kpi);
  } catch (error) {
    console.error("KPI fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch KPIs" }, { status: 500 });
  }
}
