"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

interface KpiData {
  total_views: number;
  total_articles: number;
  avg_views_per_article: number;
  top_article_views: number;
}

interface ChartData {
  topArticles: { labels: string[]; data: number[] };
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(Math.round(n));
}

const CARD: CSSProperties = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  padding: "1.25rem 1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

export default function AnalyticsKpis({ period }: { period: "day" | "week" }) {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [kpiRes, chartRes] = await Promise.all([
          fetch(`/api/analytics/kpis?period=${period}`, { signal: ctrl.signal, cache: "no-store" }),
          fetch(`/api/analytics/chart-data?period=${period}`, { signal: ctrl.signal, cache: "no-store" }),
        ]);

        if (kpiRes.ok) setKpis(await kpiRes.json() as KpiData);
        else setError("Could not load KPI data.");

        if (chartRes.ok) setChart(await chartRes.json() as ChartData);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    void load();
    return () => ctrl.abort();
  }, [period]);

  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ ...CARD, minHeight: 100 }}>
            <div style={{ height: 32, background: "#f0f0f0" }} />
            <div style={{ height: 14, background: "#f0f0f0", width: "60%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#fff8e1", border: "1px solid #ffe082", color: "#856404", padding: "0.85rem 1rem", marginBottom: "1.5rem", fontSize: "0.875rem" }}>
        {error}
      </div>
    );
  }

  const periodLabel = period === "day" ? "Today" : "This Week";

  return (
    <>
      {/* KPI cards */}
      {kpis && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={CARD}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111", fontFamily: "var(--font-ui)" }}>{fmt(kpis.total_views)}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#888" }}>Total Views — {periodLabel}</div>
          </div>
          <div style={CARD}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111", fontFamily: "var(--font-ui)" }}>{fmt(kpis.total_articles)}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#888" }}>Articles with Views</div>
          </div>
          <div style={CARD}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#111", fontFamily: "var(--font-ui)" }}>{fmt(kpis.avg_views_per_article)}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#888" }}>Avg Views / Article</div>
          </div>
          <div style={CARD}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent, #981b1e)", fontFamily: "var(--font-ui)" }}>{fmt(kpis.top_article_views)}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#888" }}>Top Article Views</div>
          </div>
        </div>
      )}

      {/* Top articles bar chart */}
      {chart && chart.topArticles.data.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#555" }}>
            Top 10 Articles by Views — {periodLabel}
          </h3>
          <TopArticlesChart labels={chart.topArticles.labels} data={chart.topArticles.data} />
        </div>
      )}
    </>
  );
}

function TopArticlesChart({ labels, data }: { labels: string[]; data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {labels.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ width: "1.4rem", fontSize: "0.75rem", fontWeight: 800, color: i < 3 ? "var(--accent, #981b1e)" : "#bbb", textAlign: "right", flexShrink: 0 }}>
            {i + 1}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.75rem", color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "0.2rem" }}>
              {label}
            </div>
            <div style={{ height: 8, background: "#f0f0f0", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, right: `${(1 - data[i] / max) * 100}%`, background: i < 3 ? "var(--accent, #981b1e)" : "#aaa" }} />
            </div>
          </div>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#444", flexShrink: 0, fontFamily: "var(--font-ui)", width: "3.5rem", textAlign: "right" }}>
            {fmt(data[i])}
          </span>
        </div>
      ))}
    </div>
  );
}
