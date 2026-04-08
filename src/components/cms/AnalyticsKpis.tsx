"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface KpiData {
  total_views: number;
  total_articles: number;
  avg_views_per_article: number;
  total_comments: number;
  engagement_rate: number;
  active_readers: number;
  bounce_rate: number;
  avg_article_length: number;
}

interface SeriesChartData {
  labels: string[];
  data: number[];
}

interface AnalyticsChartData {
  views: SeriesChartData;
  comments: SeriesChartData;
}

const KPI_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const KPI_CARD_STYLE: CSSProperties = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const KPI_VALUE_STYLE: CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "var(--ink)",
  fontFamily: "var(--font-ui)",
};

const KPI_LABEL_STYLE: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const KPI_CHANGE_STYLE: CSSProperties = {
  fontSize: "0.78rem",
  fontWeight: 600,
  marginTop: "0.5rem",
};

const CHART_PANEL_STYLE: CSSProperties = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  padding: "1.5rem",
};

const CHART_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "1.5rem",
};

function formatValue(
  value: number,
  type: "number" | "percent" | "decimal" = "number",
): string {
  if (type === "percent") return `${Math.round(value)}%`;
  if (type === "decimal") return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function getChangeStyle(current: number, previous?: number): CSSProperties {
  if (!previous) return { ...KPI_CHANGE_STYLE, color: "#999" };

  const change = ((current - previous) / previous) * 100;

  return {
    ...KPI_CHANGE_STYLE,
    color: change > 0 ? "#10b981" : change < 0 ? "#ef4444" : "#999",
  };
}

function getChangeText(current: number, previous?: number): string {
  if (!previous) return "—";

  const change = ((current - previous) / previous) * 100;
  const sign = change > 0 ? "↑" : change < 0 ? "↓" : "→";

  return `${sign} ${Math.abs(change).toFixed(1)}%`;
}

export default function AnalyticsKpis({
  period,
}: {
  period: "day" | "week";
}) {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [previousKpis, setPreviousKpis] = useState<KpiData | null>(null);
  const [chartData, setChartData] = useState<AnalyticsChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAnalytics() {
      setLoading(true);

      try {
        const [kpiRes, prevRes, chartRes] = await Promise.all([
          fetch(`/api/analytics/kpis?period=${period}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`/api/analytics/kpis?period=${period}&offset=1`, {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch(`/api/analytics/chart-data?period=${period}`, {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (kpiRes.ok) {
          const data = (await kpiRes.json()) as KpiData;
          setKpis(data);
        } else {
          setKpis(null);
        }

        if (prevRes.ok) {
          const data = (await prevRes.json()) as KpiData;
          setPreviousKpis(data);
        } else {
          setPreviousKpis(null);
        }

        if (chartRes.ok) {
          const data = (await chartRes.json()) as AnalyticsChartData;
          setChartData(data);
        } else {
          setChartData(null);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to fetch analytics:", error);
          setKpis(null);
          setPreviousKpis(null);
          setChartData(null);
        }
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();

    return () => controller.abort();
  }, [period]);

  if (loading) {
    return (
      <div style={KPI_GRID_STYLE}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ ...KPI_CARD_STYLE, minHeight: "120px" }}>
            <div
              style={{
                height: "32px",
                background: "#f0f0f0",
                borderRadius: "4px",
              }}
            />
            <div
              style={{
                height: "16px",
                background: "#f0f0f0",
                borderRadius: "4px",
                width: "70%",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) {
    return (
      <div
        style={{
          background: "#fff0f0",
          border: "1px solid #f5c6cb",
          color: "#721c24",
          padding: "1rem",
          borderRadius: "6px",
          marginBottom: "1.5rem",
        }}
      >
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <>
      <div style={KPI_GRID_STYLE}>
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.total_views)}</div>
          <div style={KPI_LABEL_STYLE}>Total Views</div>
          <div style={getChangeStyle(kpis.total_views, previousKpis?.total_views)}>
            {getChangeText(kpis.total_views, previousKpis?.total_views)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.total_articles)}</div>
          <div style={KPI_LABEL_STYLE}>Published Articles</div>
          <div
            style={getChangeStyle(
              kpis.total_articles,
              previousKpis?.total_articles,
            )}
          >
            {getChangeText(kpis.total_articles, previousKpis?.total_articles)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>
            {formatValue(kpis.avg_views_per_article, "decimal")}
          </div>
          <div style={KPI_LABEL_STYLE}>Avg Views / Article</div>
          <div
            style={getChangeStyle(
              kpis.avg_views_per_article,
              previousKpis?.avg_views_per_article,
            )}
          >
            {getChangeText(
              kpis.avg_views_per_article,
              previousKpis?.avg_views_per_article,
            )}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.total_comments)}</div>
          <div style={KPI_LABEL_STYLE}>Comments</div>
          <div
            style={getChangeStyle(
              kpis.total_comments,
              previousKpis?.total_comments,
            )}
          >
            {getChangeText(kpis.total_comments, previousKpis?.total_comments)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>
            {formatValue(kpis.engagement_rate, "percent")}
          </div>
          <div style={KPI_LABEL_STYLE}>Engagement Rate</div>
          <div
            style={getChangeStyle(
              kpis.engagement_rate,
              previousKpis?.engagement_rate,
            )}
          >
            {getChangeText(kpis.engagement_rate, previousKpis?.engagement_rate)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.active_readers)}</div>
          <div style={KPI_LABEL_STYLE}>Active Readers</div>
          <div
            style={getChangeStyle(
              kpis.active_readers,
              previousKpis?.active_readers,
            )}
          >
            {getChangeText(kpis.active_readers, previousKpis?.active_readers)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>
            {formatValue(kpis.bounce_rate, "percent")}
          </div>
          <div style={KPI_LABEL_STYLE}>Bounce Rate</div>
          <div
            style={getChangeStyle(kpis.bounce_rate, previousKpis?.bounce_rate)}
          >
            {getChangeText(kpis.bounce_rate, previousKpis?.bounce_rate)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>
            {formatValue(kpis.avg_article_length)}
          </div>
          <div style={KPI_LABEL_STYLE}>Avg Words / Article</div>
          <div
            style={getChangeStyle(
              kpis.avg_article_length,
              previousKpis?.avg_article_length,
            )}
          >
            {getChangeText(
              kpis.avg_article_length,
              previousKpis?.avg_article_length,
            )}
          </div>
        </div>
      </div>

      {chartData && (
        <div style={CHART_GRID_STYLE}>
          <div style={CHART_PANEL_STYLE}>
            <h3
              style={{
                margin: "0 0 1rem",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              Views Trend
            </h3>
            <SimpleLineChart data={chartData.views} />
          </div>

          <div style={CHART_PANEL_STYLE}>
            <h3
              style={{
                margin: "0 0 1rem",
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              Comments
            </h3>
            <SimpleBarChart data={chartData.comments} />
          </div>
        </div>
      )}
    </>
  );
}

function SimpleLineChart({ data }: { data: SeriesChartData }) {
  if (!data.data.length) {
    return <p style={{ color: "#999", fontSize: "0.875rem" }}>No data available</p>;
  }

  const maxValue = Math.max(...data.data);
  const minValue = Math.min(...data.data);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const chartHeight = 200;
  const chartWidth = 400;

  const points = data.data.map((value, idx) => {
    const x =
      padding + (idx / (data.data.length - 1 || 1)) * (chartWidth - padding * 2);
    const y =
      chartHeight - padding + ((value - minValue) / range) * -(chartHeight - padding * 2);

    return { x, y };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      style={{ overflow: "visible" }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => (
        <line
          key={i}
          x1={padding}
          x2={chartWidth - padding}
          y1={chartHeight - padding - percent * (chartHeight - padding * 2)}
          y2={chartHeight - padding - percent * (chartHeight - padding * 2)}
          stroke="#f0f0f0"
          strokeWidth="1"
        />
      ))}

      <path
        d={pathD}
        stroke="var(--accent)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="3" fill="var(--accent)" />
      ))}

      {data.labels.map((label, i) => (
        <text
          key={i}
          x={padding + (i / (data.labels.length - 1 || 1)) * (chartWidth - padding * 2)}
          y={chartHeight - 5}
          fontSize="11"
          textAnchor="middle"
          fill="#999"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

function SimpleBarChart({ data }: { data: SeriesChartData }) {
  if (!data.data.length) {
    return <p style={{ color: "#999", fontSize: "0.875rem" }}>No data available</p>;
  }

  const maxValue = Math.max(...data.data, 1);
  const chartHeight = 200;
  const barWidth = Math.max(20, 300 / data.data.length);
  const chartWidth = Math.max(300, barWidth * data.data.length + 40);

  return (
    <svg
      width="100%"
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      style={{ overflow: "visible" }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => (
        <line
          key={i}
          x1="30"
          x2={chartWidth - 10}
          y1={chartHeight - 30 - percent * (chartHeight - 60)}
          y2={chartHeight - 30 - percent * (chartHeight - 60)}
          stroke="#f0f0f0"
          strokeWidth="1"
        />
      ))}

      {data.data.map((value, i) => {
        const barHeight = ((value || 0) / maxValue) * (chartHeight - 60);

        return (
          <g key={i}>
            <rect
              x={30 + i * barWidth + (barWidth - 15) / 2}
              y={chartHeight - 30 - barHeight}
              width="15"
              height={barHeight}
              fill="var(--accent)"
              rx="2"
            />
            <text
              x={30 + i * barWidth + barWidth / 2}
              y={chartHeight - 8}
              fontSize="11"
              textAnchor="middle"
              fill="#999"
            >
              {data.labels[i] || ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}