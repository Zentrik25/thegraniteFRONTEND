import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

interface KpiResponse {
  total_views: number;
  total_articles: number;
  avg_views_per_article: number;
  total_comments: number;
  avg_article_length: number;
  active_readers: number;
  engagement_rate: number;
  bounce_rate: number;
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(STAFF_ACCESS_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "day";
  const offset = Number(searchParams.get("offset") ?? "0");

  try {
    // Fetch multiple analytics endpoints and aggregate to KPIs
    const [articlesRes, viewsRes, commentsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/v1/analytics/articles/?period=${period}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${session}` },
      }),
      fetch(`${API_BASE_URL}/api/v1/analytics/views/?period=${period}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${session}` },
      }),
      fetch(`${API_BASE_URL}/api/v1/analytics/comments/?period=${period}&offset=${offset}`, {
        headers: { Authorization: `Bearer ${session}` },
      }),
    ]);

    const [articles, views, comments] = await Promise.all([
      articlesRes.json().catch(() => ({})),
      viewsRes.json().catch(() => ({})),
      commentsRes.json().catch(() => ({})),
    ]);

    const articleList = Array.isArray(articles) ? articles : articles.results ?? [];
    const viewData = views as Record<string, number>;
    const commentData = comments as Record<string, number>;

    // Calculate KPIs
    const totalViews = viewData.total_views ?? 0;
    const totalArticles = articleList.length;
    const totalComments = commentData.total_comments ?? 0;
    const avgViewsPerArticle = totalArticles > 0 ? totalViews / totalArticles : 0;
    const avgArticleLength = totalArticles > 0 ? (articleList.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.word_count as number) ?? 0), 0) / totalArticles) : 0;
    const activeReaders = viewData.unique_readers ?? 0;
    const engagementRate = totalViews > 0 ? (totalComments / totalViews) * 100 : 0;
    const bounceRate = viewData.bounce_rate ?? 0;

    const kpi: KpiResponse = {
      total_views: totalViews,
      total_articles: totalArticles,
      avg_views_per_article: avgViewsPerArticle,
      total_comments: totalComments,
      avg_article_length: avgArticleLength,
      active_readers: activeReaders,
      engagement_rate: engagementRate,
      bounce_rate: bounceRate,
    };

    return NextResponse.json(kpi);
  } catch (error) {
    console.error("KPI fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KPIs" },
      { status: 500 },
    );
  }
}
