"use client";

import { useState } from "react";
import type { MarketDTO } from "@/lib/types";
import { cx, fmtPct, fmtPoints } from "@/lib/format";
import { ME } from "@/lib/seed";
import { IconCheck } from "./icons";

const QUICK = [100, 500, 1000, 5000];

// 下注面板：选择 是/否 → 输入积分 → 预览份额与潜在收益 → 确认。
// 门面阶段用本地状态模拟成交，弹出成功提示。
export function TradePanel({ m }: { m: MarketDTO }) {
  const [side, setSide] = useState<0 | 1>(0);
  const [amount, setAmount] = useState<number>(500);
  const [toast, setToast] = useState<string | null>(null);

  const balance = ME.balanceMilli / 1000;
  const priceBps = m.pricesBps[side];
  const price = priceBps / 10000; // 每份价格（积分）
  const shares = amount > 0 && price > 0 ? amount / price : 0;
  const maxPayout = shares; // 每份结算 1 积分
  const profit = maxPayout - amount;
  const overBalance = amount > balance;
  const invalid = amount <= 0 || overBalance;

  function confirm() {
    if (invalid) return;
    setToast(
      `已买入 ${shares.toFixed(0)} 份「${m.outcomes[side]}」，成交价 ${fmtPct(priceBps)}`,
    );
    setTimeout(() => setToast(null), 3200);
  }

  if (m.closed || m.voided) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <p className="text-sm font-medium text-ink">
          {m.voided ? "该市场已作废，成本已全额退回。" : "该市场已结算，交易已关闭。"}
        </p>
        {m.resolvedOutcomeIndex != null && (
          <p className="mt-1 text-sm text-ink-secondary">
            最终结果：<span className="font-semibold text-yes">{m.outcomes[m.resolvedOutcomeIndex]}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-ink">下注</h3>
        <span className="text-xs text-ink-muted">
          可用 <span className="tnum font-medium text-ink-secondary">{fmtPoints(ME.balanceMilli)}</span> 积分
        </span>
      </div>

      {/* 是/否 选择 */}
      <div className="grid grid-cols-2 gap-2">
        {([0, 1] as const).map((i) => (
          <button
            key={i}
            onClick={() => setSide(i)}
            className={cx(
              "flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border py-2.5 font-semibold transition-all",
              side === i
                ? i === 0
                  ? "border-yes bg-yes-soft text-yes"
                  : "border-no bg-no-soft text-no"
                : "border-border bg-surface-sunken text-ink-secondary hover:border-border-strong",
            )}
          >
            <span>{m.outcomes[i]}</span>
            <span className="tnum text-sm font-bold">{fmtPct(m.pricesBps[i])}</span>
          </button>
        ))}
      </div>

      {/* 金额输入 */}
      <label className="mt-4 block text-xs font-medium text-ink-secondary">投入积分</label>
      <div className="mt-1.5 flex items-center rounded-lg border border-border bg-surface-sunken px-3 focus-within:border-brand">
        <input
          type="number"
          inputMode="numeric"
          value={amount || ""}
          min={0}
          onChange={(e) => setAmount(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
          className="tnum w-full bg-transparent py-2.5 text-lg font-semibold text-ink outline-none"
          placeholder="0"
        />
        <span className="text-sm text-ink-muted">积分</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => setAmount(q)}
            className="tnum flex-1 cursor-pointer rounded-md border border-border bg-surface py-1 text-xs font-medium text-ink-secondary transition-colors hover:border-brand hover:text-brand"
          >
            {q}
          </button>
        ))}
        <button
          onClick={() => setAmount(Math.floor(balance))}
          className="cursor-pointer rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-ink-secondary transition-colors hover:border-brand hover:text-brand"
        >
          全部
        </button>
      </div>

      {/* 预览 */}
      <dl className="mt-4 space-y-2 rounded-lg bg-surface-sunken p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">成交价</dt>
          <dd className="tnum font-medium text-ink">{fmtPct(priceBps)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">预计买入</dt>
          <dd className="tnum font-medium text-ink">{shares.toFixed(0)} 份</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <dt className="text-ink-muted">若猜中可得</dt>
          <dd className="tnum font-semibold text-yes">
            {maxPayout.toFixed(0)} 积分
            <span className="ml-1 text-xs font-medium text-yes/80">
              (+{profit > 0 ? profit.toFixed(0) : 0})
            </span>
          </dd>
        </div>
      </dl>

      <button
        onClick={confirm}
        disabled={invalid}
        className={cx(
          "mt-4 w-full cursor-pointer rounded-lg py-3 font-semibold transition-all",
          invalid
            ? "cursor-not-allowed bg-surface-sunken text-ink-muted"
            : side === 0
              ? "bg-yes text-white hover:bg-yes-hover"
              : "bg-no text-white hover:bg-no-hover",
        )}
      >
        {overBalance ? "积分不足" : `买入「${m.outcomes[side]}」`}
      </button>
      <p className="mt-2 text-center text-xs text-ink-muted">
        娱乐模拟 · 使用虚拟积分 · 无手续费
      </p>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="animate-fade-up mt-3 flex items-center gap-2 rounded-lg bg-yes-soft px-3 py-2 text-sm font-medium text-yes"
        >
          <IconCheck className="size-4" /> {toast}
        </div>
      )}
    </div>
  );
}
