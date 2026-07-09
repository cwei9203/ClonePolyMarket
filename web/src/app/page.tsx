import { MARKETS } from "@/lib/seed";
import { MarketsExplorer } from "@/components/MarketsExplorer";
import { IconTrend } from "@/components/icons";

export default function HomePage() {
  const active = MARKETS.filter((m) => !m.closed && !m.voided).length;
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Hero */}
      <section className="mb-7 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-transparent p-6 sm:p-8">
        <div className="flex items-center gap-2 text-sm font-medium text-brand">
          <IconTrend className="size-4" /> 用虚拟积分，押注真实世界
        </div>
        <h1 className="mt-2 max-w-2xl text-2xl font-bold leading-tight text-ink sm:text-3xl">
          看得准，就能登上排行榜顶端
        </h1>
        <p className="mt-2 max-w-xl text-sm text-ink-secondary sm:text-base">
          每人初始 10,000 积分，跟随真实预测市场行情下注。猜中即赢，比拼谁的判断更精准。
          <span className="text-ink-muted">全程虚拟积分，纯娱乐。</span>
        </p>
        <div className="mt-4 flex gap-5 text-sm">
          <span className="text-ink-secondary">
            <span className="tnum text-lg font-bold text-ink">{active}</span> 个活跃市场
          </span>
          <span className="text-ink-secondary">
            <span className="tnum text-lg font-bold text-ink">10,000</span> 初始积分
          </span>
        </div>
      </section>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-ink">全部市场</h2>
      </div>
      <MarketsExplorer markets={MARKETS} />
    </div>
  );
}
