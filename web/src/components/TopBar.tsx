"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { fmtPoints } from "@/lib/format";
import { ME } from "@/lib/seed";
import { cx } from "@/lib/format";
import { IconLogo, IconWallet } from "./icons";

const NAV = [
  { href: "/", label: "市场" },
  { href: "/leaderboard", label: "排行榜" },
  { href: "/portfolio", label: "我的持仓" },
  { href: "/about", label: "关于" },
];

export function TopBar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/markets") : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-brand-ink">
            <IconLogo className="size-5" />
          </span>
          <span className="hidden sm:inline">拟市 <span className="text-ink-muted font-normal">ClonePM</span></span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 sm:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(n.href)
                  ? "bg-brand-soft text-brand"
                  : "text-ink-secondary hover:bg-surface-sunken hover:text-ink",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 sm:hidden" />

        <Link
          href="/portfolio"
          className="flex items-center gap-1.5 rounded-full border border-border bg-surface-sunken px-3 py-1.5 text-sm shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong"
          title="我的可用积分"
        >
          <IconWallet className="size-4 text-brand" />
          <span className="tnum font-semibold text-ink">{fmtPoints(ME.balanceMilli)}</span>
          <span className="text-xs text-ink-muted">积分</span>
        </Link>

        <div
          className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-[oklch(0.6_0.18_320)] text-xs font-semibold text-brand-ink"
          title={ME.username}
          aria-hidden
        >
          {ME.username.slice(0, 1)}
        </div>
      </div>
    </header>
  );
}
