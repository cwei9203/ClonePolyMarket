import { cx } from "@/lib/format";

// 概率条：Yes 绿 / No 红 双色填充，宽度反映概率。
export function ProbabilityBar({ yesBps, className }: { yesBps: number; className?: string }) {
  const yesPct = yesBps / 100;
  return (
    <div
      className={cx("flex h-2 overflow-hidden rounded-full bg-no-soft", className)}
      role="img"
      aria-label={`是 ${yesPct.toFixed(0)}%，否 ${(100 - yesPct).toFixed(0)}%`}
    >
      <div
        className="h-full rounded-full bg-yes transition-[width] duration-500 [transition-timing-function:var(--ease-out-quart)]"
        style={{ width: `${yesPct}%` }}
      />
    </div>
  );
}

// 分类标签
export function CategoryTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-secondary">
      {children}
    </span>
  );
}

// 状态徽标：已结算 / 已作废 / 即将截止
export function StatusBadge({
  kind,
  children,
}: {
  kind: "resolved" | "voided" | "closing" | "live";
  children: React.ReactNode;
}) {
  const styles = {
    resolved: "bg-yes-soft text-yes",
    voided: "bg-warning-soft text-warning",
    closing: "bg-warning-soft text-warning",
    live: "bg-brand-soft text-brand",
  } as const;
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        styles[kind],
      )}
    >
      {children}
    </span>
  );
}

// 涨跌标签：带方向色与符号
export function ChangePill({ bps, text }: { bps: number; text: string }) {
  const up = bps >= 0;
  return (
    <span
      className={cx(
        "tnum inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
        up ? "bg-yes-soft text-yes" : "bg-no-soft text-no",
      )}
    >
      {up ? "▲" : "▼"} {text}
    </span>
  );
}
