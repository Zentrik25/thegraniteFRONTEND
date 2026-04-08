import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";
import type { TrendingArticle } from "@/lib/types";

export const runtime = "nodejs";

interface ChartDataResponse {
  topArticles: {
    labels: string[];
    data: number[];
  };
}

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
      { headers: { Authorization: `Bearer ${session}` } },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const raw = await res.json().catch(() => null);
    const items: TrendingArticle[] = Array.isArray(raw)
      ? raw
      : (raw as { results?: TrendingArticle[] } | null)?.results ?? [];

    const truncate = (s: string, max = 30) =>
      s.length > max ? `${s.slice(0, max)}…` : s;

    const chartData: ChartDataResponse = {
      topArticles: {
        labels: items.map((item) => truncate(item.article.title ?? item.article.slug)),
        data: items.map((item) => item.view_count),
      },
    };

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Chart data fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
