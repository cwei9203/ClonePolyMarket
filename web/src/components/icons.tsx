// 轻量内联 SVG 图标（Lucide 风格 stroke=1.75），避免 emoji 当图标。
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconTrend(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M17 7h4v4" />
    </svg>
  );
}

export function IconTrophy(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M6 9a6 6 0 0 0 12 0V4H6z" />
      <path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3" />
      <path d="M9 21h6M12 15v6" />
    </svg>
  );
}

export function IconWallet(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M16 12h.01M3 8h18" />
    </svg>
  );
}

export function IconSearch(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconInfo(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

export function IconClock(p: P) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconCheck(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconArrowUp(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

export function IconArrowDown(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  );
}

export function IconFire(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3c1 3-2 4-2 7a2 2 0 0 0 4 0c0-.5-.2-1-.3-1.3C15 11 17 13 17 16a5 5 0 0 1-10 0c0-4 3-6 5-13z" />
    </svg>
  );
}

export function IconChart(p: P) {
  return (
    <svg {...base} {...p}>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-6" />
    </svg>
  );
}

export function IconLogo(p: P) {
  return (
    <svg {...base} {...p} strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 13.5 11 16l5-6.5" />
    </svg>
  );
}
