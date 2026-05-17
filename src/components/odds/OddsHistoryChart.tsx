"use client";

import { useState } from "react";
import type { MatchOddsHistory, OutcomeOddsHistory } from "@/types";
import { getBookmaker } from "@/data/bookmakers";
import { formatOdds } from "@/lib/odds";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { locale, t } from "@/lib/i18n/en-IN";

interface OddsHistoryChartProps {
  history: MatchOddsHistory;
  homeLabel: string;
  awayLabel: string;
}

function MiniChart({
  series,
  width = 600,
  height = 160,
}: {
  series: OutcomeOddsHistory[];
  width?: number;
  height?: number;
}) {
  const padding = { top: 16, right: 16, bottom: 28, left: 40 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const allPoints = series.flatMap((s) => s.points.map((p) => p.value));
  const min = Math.min(...allPoints) * 0.98;
  const max = Math.max(...allPoints) * 1.02;
  const range = max - min || 1;
  const colors = ["#c62828", "#757575", "#1565c0"];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + innerH * (1 - pct);
        const val = min + range * pct;
        return (
          <g key={pct}>
            <line
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#e0e0e0"
              strokeDasharray="4"
            />
            <text x={4} y={y + 4} fontSize={10} fill="#757575">
              {val.toFixed(2)}
            </text>
          </g>
        );
      })}
      {series.map((s, si) => {
        const pts = s.points;
        const path = pts
          .map((p, i) => {
            const x = padding.left + (innerW * i) / (pts.length - 1);
            const y = padding.top + innerH * (1 - (p.value - min) / range);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
          })
          .join(" ");
        return (
          <g key={s.outcome}>
            <path d={path} fill="none" stroke={colors[si]} strokeWidth={2} />
            <circle
              cx={padding.left + innerW}
              cy={
                padding.top +
                innerH * (1 - (pts[pts.length - 1].value - min) / range)
              }
              r={4}
              fill={colors[si]}
            />
          </g>
        );
      })}
      {series[0]?.points
        .filter((_, i) => i % 6 === 0)
        .map((p, i) => {
          const idx = i * 6;
          const x =
            padding.left + (innerW * idx) / (series[0].points.length - 1);
          return (
            <text
              key={p.timestamp}
              x={x}
              y={height - 6}
              fontSize={9}
              fill="#757575"
              textAnchor="middle"
            >
              {format(new Date(p.timestamp), "dd MMM HH:mm", { locale })}
            </text>
          );
        })}
    </svg>
  );
}

export function OddsHistoryChart({
  history,
  homeLabel,
  awayLabel,
}: OddsHistoryChartProps) {
  const oddsFormat = useStore((s) => s.settings.oddsFormat);
  const [active, setActive] = useState<"all" | "home" | "draw" | "away">("all");
  const bm = getBookmaker(history.histories[0]?.bookmakerId ?? "bet365");

  const labels: Record<string, string> = {
    home: homeLabel,
    draw: t.match.draw,
    away: awayLabel,
  };

  const displaySeries =
    active === "all"
      ? history.histories
      : history.histories.filter((h) => h.outcome === active);

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-sm">{t.match.oddsHistory}</h3>
          <p className="text-xs text-op-text-muted">
            {bm.name} · {t.match.last48h}
          </p>
        </div>
        <div className="flex gap-1">
          {(["all", "home", "draw", "away"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={cn(
                "px-3 py-1 text-xs rounded-md border transition-colors",
                active === key
                  ? "bg-op-accent text-white border-op-accent"
                  : "border-op-border hover:bg-op-row-hover"
              )}
            >
              {key === "all" ? t.match.all : key === "home" ? "1" : key === "draw" ? "X" : "2"}
            </button>
          ))}
        </div>
      </div>

      <MiniChart series={displaySeries} />

      <div className="grid grid-cols-3 gap-3 mt-4">
        {history.histories.map((h) => (
          <div
            key={h.outcome}
            className="bg-op-row-alt rounded-lg p-3 border border-op-border text-center"
          >
            <p className="text-xs text-op-text-muted mb-1">
              {labels[h.outcome] ?? h.label}
            </p>
            <p className="text-lg font-bold text-op-accent">
              {formatOdds(h.current, oddsFormat)}
            </p>
            <div className="flex justify-center gap-3 mt-1 text-[10px] text-op-text-muted">
              <span>
                {t.match.opening}: {h.opening.toFixed(2)}
              </span>
              <span>↑{h.high.toFixed(2)}</span>
              <span>↓{h.low.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
