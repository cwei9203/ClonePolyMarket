import Link from "next/link";
import { IconCheck, IconInfo, IconTrend, IconTrophy, IconWallet } from "@/components/icons";

const STEPS = [
  { icon: <IconWallet className="size-5" />, title: "注册领积分", desc: "用昵称+密码注册，立即获得 10,000 虚拟积分。只发不补，用完为止。" },
  { icon: <IconTrend className="size-5" />, title: "挑市场下注", desc: "浏览真实预测市场行情，选「是」或「否」，用积分买入份额。" },
  { icon: <IconCheck className="size-5" />, title: "等待结算", desc: "结果揭晓后，猜中方每份结算 1 积分，猜错归零；50-50/作废则全额退回。" },
  { icon: <IconTrophy className="size-5" />, title: "冲榜排名", desc: "净值 = 余额 + 持仓市值，实时对比全网玩家，看谁判断最准。" },
];

const FAQ = [
  { q: "这是真钱交易吗？", a: "不是。全程使用虚拟积分，纯娱乐模拟，不涉及任何真实资金、充值或提现。" },
  { q: "行情数据从哪来？", a: "镜像公开的真实预测市场行情，仅作展示。本站不影响、不回写任何真实市场的赔率。" },
  { q: "积分用完了怎么办？", a: "积分只发不补，没有签到补给或破产重置。你可以继续用当前账号观战，或注册新号重新开始。" },
  { q: "有手续费吗？", a: "没有。买入、卖出、结算都不收取任何费用。" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-ink">关于拟市 ClonePM</h1>
        <p className="mx-auto mt-2 max-w-lg text-ink-secondary">
          一个用虚拟积分跟随真实预测市场行情下注的娱乐模拟盘。看得准，就能登顶排行榜。
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-ink">怎么玩</h2>
        <div className="space-y-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                {s.icon}
              </span>
              <div>
                <h3 className="font-semibold text-ink">
                  <span className="tnum mr-1.5 text-ink-muted">{i + 1}.</span>
                  {s.title}
                </h3>
                <p className="mt-0.5 text-sm text-ink-secondary">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-ink">常见问题</h2>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4">
              <h3 className="font-medium text-ink">{f.q}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4">
        <IconInfo className="mt-0.5 size-5 shrink-0 text-warning" />
        <p className="text-sm text-ink-secondary">
          <span className="font-semibold text-ink">免责声明：</span>
          本站为娱乐性质的模拟产品，所有积分均为虚拟，非真实交易。行情数据仅作展示用途，
          与 Polymarket 官方无任何关联，不构成任何投资建议。
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/register"
          className="inline-block cursor-pointer rounded-lg bg-brand px-6 py-3 font-semibold text-brand-ink transition-colors hover:bg-brand-hover"
        >
          免费注册，领 10,000 积分
        </Link>
      </div>
    </div>
  );
}
