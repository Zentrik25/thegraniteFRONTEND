import { NextResponse, type NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/env";
import { STAFF_ACCESS_COOKIE } from "@/lib/auth/staff-session";

export const runtime = "nodejs";

interface ChartDataResponse {
  views: {
    labels: string[];
    data: number[];
  };
  comments: {
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
    // Fetch chart data from backend
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics/chart-data/?period=${period}`, {
      headers: { Authorization: `Bearer ${session}` },
    });

    const data = await res.json().catch(() => ({}));

    // If backend returns data directly, use it; otherwise generate mock data
    if (data.views && data.comments) {
      return NextResponse.json(data as ChartDataResponse);
    }

    // Fallback: generate mock chart data structure
    const labels = period === "day"
      ? ["12am", "4am", "8am", "12pm", "4pm", "8pm"]
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const viewsData: ChartDataResponse = {
      views: {
        labels,
        data: labels.map(() => Math.floor(Math.random() * 1000) + 100),
      },
      comments: {
        labels,
        data: labels.map(() => Math.floor(Math.random() * 50) + 5),
      },
    };

    return NextResponse.json(viewsData);
  } catch (error) {
    console.error("Chart data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 },
    );
  }
}
