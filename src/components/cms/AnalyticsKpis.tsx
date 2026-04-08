"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface KpiData {
  total_views: number;
  total_articles: number;
  avg_views_per_article: number;
}

interface TopArticlesChart {
  labels: string[];
  data: number[];
}

interface ChartData {
  topArticles: TopArticlesChart;
}

const KPI_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
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

function formatValue(value: number, type: "number" | "decimal" = "number"): string {
  if (type === "decimal") return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export default function AnalyticsKpis({ period }: { period: "day" | "week" }) {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [previousKpis, setPreviousKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const [kpiRes, prevRes, chartRes] = await Promise.all([
          fetch(`/api/analytics/kpis?period=${period}`),
          fetch(`/api/analytics/kpis?period=${period}&offset=1`),
          fetch(`/api/analytics/chart-data?period=${period}`),
        ]);

        if (kpiRes.ok) setKpis(await kpiRes.json() as KpiData);
        if (prevRes.ok) setPreviousKpis(await prevRes.json() as KpiData);
        if (chartRes.ok) setChartData(await chartRes.json() as ChartData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div style={KPI_GRID_STYLE}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ ...KPI_CARD_STYLE, minHeight: "120px" }}>
            <div style={{ height: "32px", background: "#f0f0f0", borderRadius: "4px" }} />
            <div style={{ height: "16px", background: "#f0f0f0", borderRadius: "4px", width: "70%" }} />
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

  function getChangeStyle(current: number, previous?: number): CSSProperties {
    if (!previous) return { color: "#999" };
    const change = ((current - previous) / previous) * 100;
    return { ...KPI_CHANGE_STYLE, color: change > 0 ? "#10b981" : change < 0 ? "#ef4444" : "#999" };
  }

  function getChangeText(current: number, previous?: number): string {
    if (!previous) return "—";
    const change = ((current - previous) / previous) * 100;
    const sign = change > 0 ? "↑" : change < 0 ? "↓" : "→";
    return `${sign} ${Math.abs(change).toFixed(1)}%`;
  }

  return (
    <>
      {/* KPI Cards */}
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
          <div style={KPI_LABEL_STYLE}>Articles With Views</div>
          <div style={getChangeStyle(kpis.total_articles, previousKpis?.total_articles)}>
            {getChangeText(kpis.total_articles, previousKpis?.total_articles)}
          </div>
        </div>

        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.avg_views_per_article, "decimal")}</div>
          <div style={KPI_LABEL_STYLE}>Avg Views / Article</div>
          <div style={getChangeStyle(kpis.avg_views_per_article, previousKpis?.avg_views_per_article)}>
            {getChangeText(kpis.avg_views_per_article, previousKpis?.avg_views_per_article)}
          </div>
        </div>
      </div>

      {/* Top Articles by Views chart */}
      {chartData?.topArticles && chartData.topArticles.data.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#555" }}>
            Top Articles — {period === "day" ? "Today" : "This Week"}
          </h3>
          <TopArticlesBar data={chartData.topArticles} />
        </div>
      )}
    </>
  );
}

function TopArticlesBar({ data }: { data: TopArticlesChart }) {
  const max = Math.max(...data.data, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {data.labels.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.8rem" }}>
          <span style={{ width: "1.5rem", textAlign: "right", fontWeight: 700, color: "#aaa", flexShrink: 0, fontFamily: "var(--font-ui)" }}>
            {i + 1}
          </span>
          <div style={{ flex: 1, background: "#f5f5f5", borderRadius: "3px", overflow: "hidden", height: "22px" }}>
            <div
              style={{
                width: `${(data.data[i] / max) * 100}%`,
                height: "100%",
                background: "var(--accent, #c00)",
                borderRadius: "3px",
                minWidth: "2px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "6px",
                boxSizing: "border-box",
              }}
            />
          </div>
          <span style={{ width: "3.5rem", textAlign: "right", fontWeight: 700, color: "#333", flexShrink: 0, fontFamily: "var(--font-ui)" }}>
            {data.data[i] >= 1000 ? `${(data.data[i] / 1000).toFixed(1)}K` : data.data[i]}
          </span>
          <span style={{ flex: 2, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}


interface ChartData {
  labels: string[];
  data: number[];
}

const KPI_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
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

function formatValue(value: number, type: "number" | "percent" | "decimal" = "number"): string {
  if (type === "percent") return `${Math.round(value)}%`;
  if (type === "decimal") return value.toFixed(1);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export default function AnalyticsKpis({ period }: { period: "day" | "week" }) {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [previousKpis, setPreviousKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ views: ChartData; comments: ChartData } | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        // Fetch current period KPIs
        const kpiRes = await fetch(`/api/analytics/kpis?period=${period}`);
        if (kpiRes.ok) {
          const data = await kpiRes.json();
          setKpis(data);
        }

        // Fetch previous period KPIs for comparison
        const prevRes = await fetch(`/api/analytics/kpis?period=${period}&offset=1`);
        if (prevRes.ok) {
          const data = await prevRes.json();
          setPreviousKpis(data);
        }

        // Fetch chart data
        const chartRes = await fetch(`/api/analytics/chart-data?period=${period}`);
        if (chartRes.ok) {
          const data = await chartRes.json();
          setChartData(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div style={KPI_GRID_STYLE}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ ...KPI_CARD_STYLE, minHeight: "120px" }}>
            <div style={{ height: "32px", background: "#f0f0f0", borderRadius: "4px" }} />
            <div style={{ height: "16px", background: "#f0f0f0", borderRadius: "4px", width: "70%" }} />
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

  function getChangeStyle(current: number, previous?: number): CSSProperties {
    if (!previous) return { color: "#999" };
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

  return (
    <>
      {/* KPI Cards */}
      <div style={KPI_GRID_STYLE}>
        {/* Total Views */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.total_views)}</div>
          <div style={KPI_LABEL_STYLE}>Total Views</div>
          <div style={getChangeStyle(kpis.total_views, previousKpis?.total_views)}>
            {getChangeText(kpis.total_views, previousKpis?.total_views)}
          </div>
        </div>

        {/* Total Articles */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.total_articles)}</div>
          <div style={KPI_LABEL_STYLE}>Published Articles</div>
          <div style={getChangeStyle(kpis.total_articles, previousKpis?.total_articles)}>
            {getChangeText(kpis.total_articles, previousKpis?.total_articles)}
          </div>
        </div>

        {/* Avg Views Per Article */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.avg_views_per_article, "decimal")}</div>
          <div style={KPI_LABEL_STYLE}>Avg Views / Article</div>
          <div style={getChangeStyle(kpis.avg_views_per_article, previousKpis?.avg_views_per_article)}>
            {getChangeText(kpis.avg_views_per_article, previousKpis?.avg_views_per_article)}
          </div>
        </div>

        {/* Total Comments */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.total_comments)}</div>
          <div style={KPI_LABEL_STYLE}>Comments</div>
          <div style={getChangeStyle(kpis.total_comments, previousKpis?.total_comments)}>
            {getChangeText(kpis.total_comments, previousKpis?.total_comments)}
          </div>
        </div>

        {/* Engagement Rate */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.engagement_rate, "percent")}</div>
          <div style={KPI_LABEL_STYLE}>Engagement Rate</div>
          <div style={getChangeStyle(kpis.engagement_rate, previousKpis?.engagement_rate)}>
            {getChangeText(kpis.engagement_rate, previousKpis?.engagement_rate)}
          </div>
        </div>

        {/* Active Readers */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.active_readers)}</div>
          <div style={KPI_LABEL_STYLE}>Active Readers</div>
          <div style={getChangeStyle(kpis.active_readers, previousKpis?.active_readers)}>
            {getChangeText(kpis.active_readers, previousKpis?.active_readers)}
          </div>
        </div>

        {/* Bounce Rate */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.bounce_rate, "percent")}</div>
          <div style={KPI_LABEL_STYLE}>Bounce Rate</div>
          <div style={getChangeStyle(kpis.bounce_rate, previousKpis?.bounce_rate)}>
            {getChangeText(kpis.bounce_rate, previousKpis?.bounce_rate)}
          </div>
        </div>

        {/* Avg Article Length */}
        <div style={KPI_CARD_STYLE}>
          <div style={KPI_VALUE_STYLE}>{formatValue(kpis.avg_article_length)}</div>
          <div style={KPI_LABEL_STYLE}>Avg Words / Article</div>
          <div style={getChangeStyle(kpis.avg_article_length, previousKpis?.avg_article_length)}>
            {getChangeText(kpis.avg_article_length, previousKpis?.avg_article_length)}
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
          {/* Views Line Chart */}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700 }}>Views Trend</h3>
            <SimpleLineChart data={chartData.views} />
          </div>

          {/* Comments Bar Chart */}
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "1.5rem" }}>
            <h3 style={{ margin: "0 0 1rem", fontSize: "0.9rem", fontWeight: 700 }}>Comments</h3>
            <SimpleBarChart data={chartData.comments} />
          </div>
        </div>
      )}
    </>
  );
}

function SimpleLineChart({ data }: { data: ChartData }) {
  if (!data.data.length) return <p style={{ color: "#999", fontSize: "0.875rem" }}>No data available</p>;

  const maxValue = Math.max(...data.data);
  const minValue = Math.min(...data.data);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const chartHeight = 200;
  const chartWidth = 400;

  const points = data.data.map((value, idx) => {
    const x = padding + (idx / (data.data.length - 1 || 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding + ((value - minValue) / range) * -chartHeight;
    return { x, y, value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: "visible" }}>
      {/* Grid lines */}
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
      {/* Line */}
      <path d={pathD} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
      ))}
      {/* X-axis labels */}
      {data.labels.map((label, i) => (
        <text key={i} x={padding + (i / (data.labels.length - 1 || 1)) * (chartWidth - padding * 2)} y={chartHeight - 5} fontSize="11" textAnchor="middle" fill="#999">
          {label}
        </text>
      ))}
    </svg>
  );
}

function SimpleBarChart({ data }: { data: ChartData }) {
  if (!data.data.length) return <p style={{ color: "#999", fontSize: "0.875rem" }}>No data available</p>;

  const maxValue = Math.max(...data.data);
  const chartHeight = 200;
  const barWidth = Math.max(20, 300 / data.data.length);

  return (
    <svg width="100%" height={chartHeight} viewBox={`0 0 ${Math.max(300, barWidth * data.data.length + 40)} ${chartHeight}`} style={{ overflow: "visible" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((percent, i) => (
        <line key={i} x1="30" x2={Math.max(300, barWidth * data.data.length + 30)} y1={chartHeight - 30 - percent * (chartHeight - 60)} y2={chartHeight - 30 - percent * (chartHeight - 60)} stroke="#f0f0f0" strokeWidth="1" />
      ))}
      {/* Bars */}
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
            <text x={30 + i * barWidth + barWidth / 2} y={chartHeight - 8} fontSize="11" textAnchor="middle" fill="#999">
              {data.labels[i] || ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
