import { LEADERBOARD, ME } from "@/lib/seed";
import { fmtPoints } from "@/lib/format";
import { LeaderboardRow } from "@/components/rows";
import { IconTrophy } from "@/components/icons";

export default function LeaderboardPage() {
  const top = LEADERBOARD.filter((r) => r.rank <= 15).sort((a, b) => a.rank - b.rank);
  const me = LEADERBOARD.find((r) => r.isMe);
  const podium = top.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand">
          <IconTrophy className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink">积分排行榜</h1>
          <p className="text-sm text-ink-muted">按净值（余额 + 持仓市值）排序，全网玩家实时对比</p>
        </div>
      </div>

      {/* 前三名领奖台 */}
      <div className="mb-6 grid grid-cols-3 items-end gap-2 sm:gap-3">
        {[podium[1], podium[0], podium[2]].map((r, i) => {
          const place = [2, 1, 3][i];
          const h = ["h-24", "h-32", "h-20"][i];
          const ring = [
            "ring-[oklch(0.7_0.02_265)]",
            "ring-[oklch(0.72_0.15_85)]",
            "ring-[oklch(0.6_0.13_50)]",
          ][i];
          return (
            <div key={r.userId} className="flex flex-col items-center">
              <div
                className={`mb-2 grid size-12 place-items-center rounded-full bg-surface text-base font-bold text-ink shadow-[var(--shadow-md)] ring-2 ${ring}`}
              >
                {r.username.slice(0, 1)}
              </div>
              <div className="mb-1 max-w-full truncate text-sm font-medium text-ink">{r.username}</div>
              <div className="tnum mb-2 text-xs font-semibold text-ink-secondary">
                {fmtPoints(r.netWorthMilli)}
              </div>
              <div
                className={`flex ${h} w-full items-start justify-center rounded-t-lg bg-gradient-to-b from-brand-soft to-surface-sunken pt-2 text-2xl font-bold text-brand`}
              >
                {place}
              </div>
            </div>
          );
        })}
      </div>

      {/* 完整榜单 */}
      <div className="space-y-2">
        {top.map((r) => (
          <LeaderboardRow key={r.userId} r={r} />
        ))}
      </div>

      {/* 我的名次固定条 */}
      {me && me.rank > 15 && (
        <div className="sticky bottom-16 z-[var(--z-sticky)] mt-4 sm:bottom-4">
          <div className="mb-1 px-1 text-xs text-ink-muted">我的名次</div>
          <LeaderboardRow r={me} />
        </div>
      )}

      <p className="mt-6 text-center text-xs text-ink-muted">
        初始积分 {fmtPoints(ME.initialMilli)} · 只发不补 · 排名随行情实时波动
      </p>
    </div>
  );
}
