import type { Bps, Milli } from "./types";

// 概率基点 -> 百分比字符串。1 位小数，去除多余 0。
export function fmtPct(bps: Bps): string {
  const pct = bps / 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1)}%`;
}

// 概率基点 -> 每份价格（¢ 分，1 份结算 1 积分 = 100 分）。
export function fmtCents(bps: Bps): string {
  return `${(bps / 100).toFixed(0)}¢`;
}

// 积分（milli）-> 显示字符串，千分位，默认不带小数。
export function fmtPoints(milli: Milli, opts?: { sign?: boolean; decimals?: number }): string {
  const v = milli / 1000;
  const decimals = opts?.decimals ?? (Number.isInteger(v) ? 0 : 1);
  const s = v.toLocaleString("zh-CN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (opts?.sign && v > 0) return `+${s}`;
  return s;
}

// 24h 变化基点 -> 带符号百分比（用于涨跌标签）。
export function fmtChange(bps: number): string {
  const pct = bps / 100;
  const s = Math.abs(pct) % 1 === 0 ? Math.abs(pct).toFixed(0) : Math.abs(pct).toFixed(1);
  return `${pct >= 0 ? "+" : "-"}${s}%`;
}

// 截止时间 -> 相对/绝对中文描述。
export function fmtCloseAt(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = d.getTime() - now;
  if (diff <= 0) return "已截止";
  const days = Math.floor(diff / 86400000);
  if (days >= 1) {
    return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  }
  const hours = Math.floor(diff / 3600000);
  if (hours >= 1) return `${hours} 小时后截止`;
  const mins = Math.floor(diff / 60000);
  return `${mins} 分钟后截止`;
}

// 大数热度 -> 紧凑中文（万/亿）。
export function fmtVolume(n: number): string {
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}亿`;
  if (n >= 1e4) return `${(n / 1e4).toFixed(1)}万`;
  return n.toLocaleString("zh-CN");
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
