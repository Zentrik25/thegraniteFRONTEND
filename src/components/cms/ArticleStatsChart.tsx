"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DailyView {
  date: string;
  views: number;
}

interface ArticleStats {
  slug: string;
  title?: string;
  total_views: number;
  daily_views: DailyView[];
}

interface Props {
  slug: string;
}

const RANGE_OPTIONS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function formatXLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function zeroPadDays(data: DailyView[], days: number): DailyView[] {
  const end = new Date();
  const result: DailyView[] = [];
  const map = new Map(data.map((d) => [d.date, d.views]));

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, views: map.get(key) ?? 0 });
  }
  return result;
}

export function ArticleStatsChart({ slug }: Props) {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/articles/${slug}/stats?days=${days}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as ArticleStats;
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats.");
    } finally {
      setLoading(false);
    }
  }, [slug, days]);

  useEffect(() => { load(); }, [load]);

  const chartData = stats ? zeroPadDays(stats.daily_views ?? [], days) : [];

  return (
    <div>
      {/* Range selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.days}
            onClick={() => setDays(opt.days)}
            style={{
              padding: "0.35rem 0.85rem",
              borderRadius: "4px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: days === opt.days ? "var(--ink, #111)" : "#f0f0f0",
              color: days === opt.days ? "#fff" : "#555",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Total views KPI */}
      {stats && (
        <div style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
        }}>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "1rem 1.5rem", minWidth: 160 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888", marginBottom: "0.25rem" }}>
              All-time views
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)", color: "#111" }}>
              {stats.total_views.toLocaleString()}
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "1rem 1.5rem", minWidth: 160 }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888", marginBottom: "0.25rem" }}>
              Views (last {days}d)
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-ui)", color: "#111" }}>
              {chartData.reduce((s, d) => s + d.views, 0).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: "6px", padding: "1.25rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: "0.875rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Daily Views — Last {days} Days
        </h2>

        {loading && (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#c00" }}>
            {error}
          </div>
        )}
        {!loading && !error && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatXLabel}
                tick={{ fontSize: 11, fill: "#999" }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(chartData.length / 7)}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#999" }}
                axisLine={false}
                tickLine={false}
                width={36}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: unknown) => [(Number(value)).toLocaleString(), "Views"]}
                labelFormatter={(label: unknown) => {
                  const d = new Date(String(label));
                  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                }}
                contentStyle={{ fontSize: "0.8rem", border: "1px solid #ddd", borderRadius: "4px" }}
              />
              <Bar dataKey="views" fill="var(--accent, #c00)" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
