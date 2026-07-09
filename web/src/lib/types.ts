// 领域类型 —— 对齐 docs/04-api-design.md 的 DTO 形状。
// 前端门面阶段用 mock 数据，后续可无缝替换为真实 API 响应。

export type OutcomeIndex = number; // MVP 二元：0 = Yes, 1 = No
export type Bps = number; // 概率，0..10000 基点（避免浮点）
export type Milli = number; // 积分 ×1000（整数存储）

export interface MarketDTO {
  id: string;
  question: string;
  imageUrl: string | null;
  outcomes: string[]; // ["是", "否"]
  pricesBps: Bps[]; // 与 outcomes 对齐的当前赔率
  volume: number; // 热度（用于排序）
  liquidity: number;
  closeAt: string; // ISO
  closed: boolean;
  voided: boolean;
  resolvedOutcomeIndex: number | null;
  category: string;
  oneDayChangeBps: number; // 24h 概率变化（首个结果）
  syncedAt: string;
}

export interface PositionDTO {
  marketId: string;
  question: string;
  imageUrl: string | null;
  outcomeIndex: OutcomeIndex;
  outcomeLabel: string;
  shares: number; // 份额
  avgPriceBps: Bps; // 平均买入价
  currentPriceBps: Bps; // 当前市值价
  costMilli: Milli; // 累计成本
  closed: boolean;
  voided: boolean;
  resolvedOutcomeIndex: number | null;
}

export interface LeaderRowDTO {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  netWorthMilli: Milli; // 净值 = 余额 + 持仓市值
  balanceMilli: Milli;
  positionsValueMilli: Milli;
  isMe: boolean;
}

export interface PricePoint {
  t: string; // ISO
  yesBps: Bps;
}
