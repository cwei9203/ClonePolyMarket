import Link from "next/link";
import { ME, MY_POSITIONS } from "@/lib/seed";
import { fmtPoints } from "@/lib/format";
import { PositionRow } from "@/components/rows";
import { IconWallet } from "@/components/icons";

export default function PortfolioPage() {
  const positionsValue = MY_POSITIONS.filter((p) => !p.closed && !p.voided).reduce(
    (s, p) => s + (p.shares * p.currentPriceBps) / 10000,
    0,
  );
  const balance = ME.balanceMilli / 1000;
  const netWorth = balance + positionsValue;
  const pnl = netWorth - ME.initialMilli / 1000;
  const pnlPct = (pnl / (ME.initialMilli / 1000)) * 100;

  const open = MY_POSITIONS.filter((p) => !p.closed && !p.voided);
  const settled = MY_POSITIONS.filter((p) => p.closed || p.voided);
  const bankrupt = balance <= 0 && open.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <h1 className="mb-5 text-xl font-bold text-ink">我的持仓</h1>

      {/* 净值概览卡 */}
      <div className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-surface p-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-1.5 text-sm text-ink-secondary">
          <IconWallet className="size-4 text-brand" /> 总净值
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <span className="tnum text-3xl font-bold text-ink">{fmtPoints(Math.round(netWorth * 1000))}</span>
          <span
            className={`tnum text-sm font-semibold ${pnl >= 0 ? "text-yes" : "text-no"}`}
          >
            {pnl >= 0 ? "▲" : "▼"} {fmtPoints(Math.round(Math.abs(pnl) * 1000))} ({pnl >= 0 ? "+" : "-"}
            {Math.abs(pnlPct).toFixed(1)}%)
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
          <div>
            <div className="text-ink-muted">可用积分</div>
            <div className="tnum mt-0.5 font-semibold text-ink">{fmtPoints(ME.balanceMilli)}</div>
          </div>
          <div>
            <div className="text-ink-muted">持仓市值</div>
            <div className="tnum mt-0.5 font-semibold text-ink">{fmtPoints(Math.round(positionsValue * 1000))}</div>
          </div>
        </div>
      </div>

      {bankrupt && (
        <div className="mb-6 rounded-xl border border-no/30 bg-no-soft p-4 text-sm text-no">
          你的积分已归零。积分只发不补，可用当前账号继续观战，或
          <Link href="/register" className="font-semibold underline">注册新号</Link>重新开始。
        </div>
      )}

      {/* 持仓中 */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-ink-secondary">持仓中（{open.length}）</h2>
        {open.length ? (
          <div className="space-y-2">
            {open.map((p) => (
              <PositionRow key={p.marketId} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-ink-muted">
            还没有持仓。<Link href="/" className="font-medium text-brand">去看看市场 →</Link>
          </div>
        )}
      </section>

      {/* 已结算 */}
      {settled.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink-secondary">已结算（{settled.length}）</h2>
          <div className="space-y-2">
            {settled.map((p) => (
              <PositionRow key={p.marketId} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
