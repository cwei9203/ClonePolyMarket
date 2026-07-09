"use client";

import { useMemo, useState } from "react";
import type { MarketDTO } from "@/lib/types";
import { CATEGORIES } from "@/lib/seed";
import { cx } from "@/lib/format";
import { MarketCard } from "./MarketCard";
import { IconSearch } from "./icons";

type Sort = "hot" | "closing" | "new";

const SORTS: { key: Sort; label: string }[] = [
  { key: "hot", label: "热度" },
  { key: "closing", label: "即将截止" },
  { key: "new", label: "最新" },
];

// 市场浏览：分类 + 搜索 + 排序。纯前端过滤 mock 数据。
export function MarketsExplorer({ markets }: { markets: MarketDTO[] }) {
  const [cat, setCat] = useState("全部");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("hot");

  const list = useMemo(() => {
    let xs = markets.filter((m) => (cat === "全部" ? true : m.category === cat));
    if (q.trim()) xs = xs.filter((m) => m.question.includes(q.trim()));
    xs = [...xs].sort((a, b) => {
      if (sort === "hot") return b.volume - a.volume;
      if (sort === "closing") return +new Date(a.closeAt) - +new Date(b.closeAt);
      return +new Date(b.syncedAt) - +new Date(a.syncedAt);
    });
    return xs;
  }, [markets, cat, q, sort]);

  return (
    <div>
      {/* 搜索 + 排序 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 focus-within:border-brand">
          <IconSearch className="size-4 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索市场…"
            className="w-full bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-surface-sunken p-0.5">
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={cx(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                sort === s.key
                  ? "bg-surface text-ink shadow-[var(--shadow-sm)]"
                  : "text-ink-muted hover:text-ink-secondary",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 分类 chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cx(
              "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              cat === c
                ? "border-brand bg-brand text-brand-ink"
                : "border-border bg-surface text-ink-secondary hover:border-border-strong",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 网格 */}
      {list.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <MarketCard key={m.id} m={m} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-ink-muted">
          没有匹配的市场，换个关键词试试。
        </div>
      )}
    </div>
  );
}
