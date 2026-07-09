"use client";

import { useMemo, useState } from "react";
import type { PricePoint } from "@/lib/types";
import { fmtPct } from "@/lib/format";

const RANGES = [
  { key: "7d", label: "7天", days: 7 },
  { key: "30d", label: "30天", days: 30 },
  { key: "all", label: "全部", days: 999 },
] as const;

// 概率走势图：纯 SVG 面积折线，含 hover 游标。无第三方图表库。
export function PriceChart({ points }: { points: PricePoint[] }) {
  const [rangeIdx, setRangeIdx] = useState(1);
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(() => {
    const days = RANGES[rangeIdx].days;
    return points.slice(Math.max(0, points.length - days - 1));
  }, [points, rangeIdx]);

  const W = 720;
  const H = 240;
  const padX = 8;
  const padY = 16;

  const geo = useMemo(() => {
    const xs = (i: number) => padX + (i / (data.length - 1)) * (W - padX * 2);
    const ys = (bps: number) => padY + (1 - bps / 10000) * (H - padY * 2);
    const line = data.map((p, i) => `${xs(i)},${ys(p.yesBps)}`).join(" ");
    const area = `${padX},${H - padY} ${line} ${W - padX},${H - padY}`;
    return { xs, ys, line, area };
  }, [data]);

  const last = data[data.length - 1]?.yesBps ?? 0;
  const first = data[0]?.yesBps ?? 0;
  const up = last >= first;
  const stroke = up ? "var(--yes)" : "var(--no)";
  const active = hover != null ? data[hover] : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-ink-muted">是 · 当前概率</span>
          <span className="tnum text-2xl font-bold text-ink">{fmtPct(active?.yesBps ?? last)}</span>
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-sunken p-0.5">
          {RANGES.map((r, i) => (
            <button
              key={r.key}
              onClick={() => setRangeIdx(i)}
              className={
                "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors " +
                (rangeIdx === i
                  ? "bg-surface text-ink shadow-[var(--shadow-sm)]"
                  : "text-ink-muted hover:text-ink-secondary")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((x - padX) / (W - padX * 2)) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
        role="img"
        aria-label={`概率走势，当前 ${fmtPct(last)}`}
      >
        <defs>
          <linearGradient id="pcArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 50% 参考线 */}
        <line
          x1={padX}
          y1={geo.ys(5000)}
          x2={W - padX}
          y2={geo.ys(5000)}
          stroke="var(--border)"
          strokeDasharray="4 5"
          strokeWidth={1}
        />

        <polygon points={geo.area} fill="url(#pcArea)" />
        <polyline
          points={geo.line}
          fill="none"
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {active && (
          <g>
            <line
              x1={geo.xs(hover!)}
              y1={padY}
              x2={geo.xs(hover!)}
              y2={H - padY}
              stroke="var(--ink-muted)"
              strokeWidth={1}
            />
            <circle cx={geo.xs(hover!)} cy={geo.ys(active.yesBps)} r={4.5} fill={stroke} stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>

      <div className="mt-1 flex justify-between text-xs text-ink-muted">
        <span>{new Date(data[0]?.t).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</span>
        <span>
          {active
            ? new Date(active.t).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
            : "今天"}
        </span>
      </div>
    </div>
  );
}
