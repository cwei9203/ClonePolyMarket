import Link from "next/link";
import type { MarketDTO } from "@/lib/types";
import { fmtChange, fmtCloseAt, fmtPct, fmtVolume } from "@/lib/format";
import { CategoryTag, ChangePill, ProbabilityBar, StatusBadge } from "./ui";
import { IconCheck, IconClock, IconFire } from "./icons";

// 市场卡片：概率优先，一眼可读。列表与相关推荐复用。
export function MarketCard({ m }: { m: MarketDTO }) {
  const yesBps = m.pricesBps[0];
  const resolved = m.closed || m.voided;
  const winnerLabel =
    m.resolvedOutcomeIndex != null ? m.outcomes[m.resolvedOutcomeIndex] : null;

  return (
    <Link
      href={`/markets/${m.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryTag>{m.category}</CategoryTag>
        {m.voided ? (
          <StatusBadge kind="voided">已作废 · 退回</StatusBadge>
        ) : m.closed ? (
          <StatusBadge kind="resolved">
            <IconCheck className="size-3" /> 已结算
          </StatusBadge>
        ) : (
          <ChangePill bps={m.oneDayChangeBps} text={fmtChange(m.oneDayChangeBps)} />
        )}
      </div>

      <h3 className="line-clamp-2 min-h-[2.75rem] text-[0.95rem] font-semibold leading-snug text-ink group-hover:text-brand">
        {m.question}
      </h3>

      {resolved ? (
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink-muted">最终结果</span>
          <span className="text-lg font-bold text-yes">{winnerLabel ?? "全额退回"}</span>
        </div>
      ) : (
        <div className="flex items-baseline justify-between">
          <span className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tnum text-ink">{fmtPct(yesBps)}</span>
            <span className="text-sm text-ink-muted">是</span>
          </span>
          <span className="tnum text-sm font-medium text-ink-secondary">
            {fmtPct(m.pricesBps[1])} 否
          </span>
        </div>
      )}

      <ProbabilityBar yesBps={resolved ? (m.resolvedOutcomeIndex === 0 ? 10000 : 0) : yesBps} />

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <IconFire className="size-3.5" /> {fmtVolume(m.volume)} 交易额
        </span>
        <span className="inline-flex items-center gap-1">
          <IconClock className="size-3.5" /> {fmtCloseAt(m.closeAt)}
        </span>
      </div>
    </Link>
  );
}
