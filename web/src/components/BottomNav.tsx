"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/format";
import { IconTrend, IconTrophy, IconWallet, IconInfo } from "./icons";

const TABS = [
  { href: "/", label: "市场", Icon: IconTrend },
  { href: "/leaderboard", label: "排行榜", Icon: IconTrophy },
  { href: "/portfolio", label: "持仓", Icon: IconWallet },
  { href: "/about", label: "关于", Icon: IconInfo },
];

// 移动端底部标签栏。桌面隐藏（sm 及以上用顶栏导航）。
export function BottomNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" || pathname.startsWith("/markets") : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] flex border-t border-border bg-surface/95 backdrop-blur-md sm:hidden">
      {TABS.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          className={cx(
            "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
            active(href) ? "text-brand" : "text-ink-muted",
          )}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
