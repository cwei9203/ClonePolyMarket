import Link from "next/link";
import { notFound } from "next/navigation";
import { MARKETS, getMarket, priceHistory } from "@/lib/seed";
import { fmtCloseAt, fmtPct, fmtVolume } from "@/lib/format";
import { PriceChart } from "@/components/PriceChart";
import { TradePanel } from "@/components/TradePanel";
import { MarketCard } from "@/components/MarketCard";
import { CategoryTag, ProbabilityBar, StatusBadge } from "@/components/ui";
import { IconCheck, IconClock, IconFire, IconInfo } from "@/components/icons";

export function generateStaticParams() {
  return MARKETS.map((m) => ({ id: m.id }));
}

export default async function MarketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = getMarket(id);
  if (!m) notFound();

  const history = priceHistory(m.id, m.pricesBps[0]);
  const related = MARKETS.filter((x) => x.category === m.category && x.id !== m.id).slice(0, 3);
  const resolved = m.closed || m.voided;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Link href="/" className="mb-4 inline-flex text-sm text-ink-muted transition-colors hover:text-brand">
        ← 返回市场列表
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* 左：走势与详情 */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CategoryTag>{m.category}</CategoryTag>
            {m.voided ? (
              <StatusBadge kind="voided">已作废 · 成本全额退回</StatusBadge>
            ) : m.closed ? (
              <StatusBadge kind="resolved">
                <IconCheck className="size-3" /> 已结算
              </StatusBadge>
            ) : (
              <StatusBadge kind="live">交易中</StatusBadge>
            )}
          </div>

          <h1 className="mb-4 text-xl font-bold leading-snug text-ink sm:text-2xl">
            {m.question}
          </h1>

          {/* 概率摘要 */}
          <div className="mb-4 flex items-center gap-6">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="tnum text-3xl font-bold text-yes">{fmtPct(m.pricesBps[0])}</span>
                <span className="text-sm text-ink-muted">是</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="tnum text-3xl font-bold text-no">{fmtPct(m.pricesBps[1])}</span>
                <span className="text-sm text-ink-muted">否</span>
              </div>
            </div>
          </div>
          <ProbabilityBar
            yesBps={resolved ? (m.resolvedOutcomeIndex === 0 ? 10000 : 0) : m.pricesBps[0]}
            className="mb-6 h-2.5"
          />

          <PriceChart points={history} />

          {/* 元信息 */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Meta icon={<IconFire className="size-4" />} label="累计交易额" value={`${fmtVolume(m.volume)} 积分`} />
            <Meta icon={<IconClock className="size-4" />} label="截止时间" value={fmtCloseAt(m.closeAt)} />
            <Meta icon={<IconInfo className="size-4" />} label="流动性" value={`${fmtVolume(m.liquidity)} 积分`} />
          </div>

          {/* 规则说明 */}
          <div className="mt-6 rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 text-sm font-semibold text-ink">结算规则</h2>
            <p className="text-sm leading-relaxed text-ink-secondary">
              本市场镜像真实预测市场的行情与结算结果。当结果明确时，持有获胜方每份结算为 1 积分，
              失败方归零。若市场被判定为 50-50 或作废，则按 VOID 处理，
              <span className="font-medium text-ink">全额退回买入成本</span>。
              全程使用虚拟积分，无手续费，非真实交易。
            </p>
          </div>
        </div>

        {/* 右：下注面板（sticky） */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <TradePanel m={m} />
        </aside>
      </div>

      {/* 相关市场 */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-ink">相关市场</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <MarketCard key={r.id} m={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        {icon}
        {label}
      </div>
      <div className="tnum mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
