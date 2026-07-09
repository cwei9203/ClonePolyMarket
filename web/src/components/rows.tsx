import Link from "next/link";
import type { LeaderRowDTO, PositionDTO } from "@/lib/types";
import { cx, fmtPct, fmtPoints } from "@/lib/format";
import { StatusBadge } from "./ui";

// 排行榜行：名次 · 头像 · 昵称 · 净值。前三名与「我」高亮。
export function LeaderboardRow({ r }: { r: LeaderRowDTO }) {
  const medal = r.rank <= 3;
  const medalColor = ["text-[oklch(0.72_0.15_85)]", "text-[oklch(0.7_0.02_265)]", "text-[oklch(0.6_0.13_50)]"][r.rank - 1];
  return (
    <div
      className={cx(
        "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
        r.isMe
          ? "border-brand bg-brand-soft"
          : "border-border bg-surface hover:bg-surface-sunken",
      )}
    >
      <span
        className={cx(
          "tnum w-8 shrink-0 text-center text-lg font-bold",
          medal ? medalColor : "text-ink-muted",
        )}
      >
        {r.rank}
      </span>
      <div
        className={cx(
          "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold",
          r.isMe ? "bg-brand text-brand-ink" : "bg-surface-sunken text-ink-secondary",
        )}
        aria-hidden
      >
        {r.username.slice(0, 1)}
      </div>
      <span className="flex-1 truncate font-medium text-ink">
        {r.username}
        {r.isMe && <span className="ml-1.5 text-xs font-normal text-brand">（我）</span>}
      </span>
      <div className="text-right">
        <div className="tnum font-bold text-ink">{fmtPoints(r.netWorthMilli)}</div>
        <div className="tnum text-xs text-ink-muted">
          持仓 {fmtPoints(r.positionsValueMilli)}
        </div>
      </div>
    </div>
  );
}

// 持仓行：市场 · 方向 · 份额 · 成本 · 现值 · 盈亏。
export function PositionRow({ p }: { p: PositionDTO }) {
  const value = (p.shares * p.currentPriceBps) / 10000; // 现值（积分）
  const cost = p.costMilli / 1000;
  const pnl = value - cost;
  const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
  const settled = p.closed || p.voided;
  const won = p.resolvedOutcomeIndex === p.outcomeIndex;

  return (
    <Link
      href={`/markets/${p.marketId}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-sunken"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cx(
              "shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold",
              p.outcomeIndex === 0 ? "bg-yes-soft text-yes" : "bg-no-soft text-no",
            )}
          >
            {p.outcomeLabel}
          </span>
          {p.voided ? (
            <StatusBadge kind="voided">已作废</StatusBadge>
          ) : p.closed ? (
            <StatusBadge kind={won ? "resolved" : "voided"}>
              {won ? "已结算 · 猜中" : "已结算 · 未中"}
            </StatusBadge>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-1 text-sm font-medium text-ink">{p.question}</p>
        <p className="tnum mt-0.5 text-xs text-ink-muted">
          {p.shares.toFixed(0)} 份 · 均价 {fmtPct(p.avgPriceBps)}
          {!settled && <> · 现价 {fmtPct(p.currentPriceBps)}</>}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className="tnum font-semibold text-ink">{value.toFixed(0)}</div>
        <div
          className={cx(
            "tnum text-xs font-medium",
            pnl > 0 ? "text-yes" : pnl < 0 ? "text-no" : "text-ink-muted",
          )}
        >
          {pnl >= 0 ? "+" : ""}
          {pnl.toFixed(0)} ({pnl >= 0 ? "+" : ""}
          {pnlPct.toFixed(0)}%)
        </div>
      </div>
    </Link>
  );
}
