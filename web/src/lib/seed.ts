import type { LeaderRowDTO, MarketDTO, PositionDTO, PricePoint } from "./types";

// 门面阶段的确定性 mock 数据。形状对齐 API DTO，可整体替换为 fetch 结果。

const YES_NO = ["是", "否"];
const NOW = Date.now();
const DAY = 86_400_000;
// 相对当前时间的未来截止，保证演示中「活跃」市场不显示为已截止。
const future = (days: number) => new Date(NOW + days * DAY).toISOString();

export const MARKETS: MarketDTO[] = [
  {
    id: "mkt-btc-200k",
    question: "2025 年底前比特币会突破 20 万美元吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [3800, 6200],
    volume: 12_840_000,
    liquidity: 892_000,
    closeAt: future(96),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "加密货币",
    oneDayChangeBps: 240,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-cn-gdp-5",
    question: "中国 2025 全年 GDP 增速会达到 5% 吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [6700, 3300],
    volume: 8_210_000,
    liquidity: 640_000,
    closeAt: future(180),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "宏观经济",
    oneDayChangeBps: -120,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-gta6-2025",
    question: "GTA VI 会在 2025 年内正式发售吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [900, 9100],
    volume: 21_500_000,
    liquidity: 1_320_000,
    closeAt: future(12),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "娱乐",
    oneDayChangeBps: -80,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-lakers-champ",
    question: "湖人会赢得 2025-26 赛季 NBA 总冠军吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [1450, 8550],
    volume: 5_600_000,
    liquidity: 410_000,
    closeAt: future(320),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "体育",
    oneDayChangeBps: 60,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-openai-ipo",
    question: "OpenAI 会在 2026 年底前 IPO 吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [2800, 7200],
    volume: 9_950_000,
    liquidity: 720_000,
    closeAt: future(410),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "科技",
    oneDayChangeBps: 310,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-fed-cut-march",
    question: "美联储会在 3 月会议上降息吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [5200, 4800],
    volume: 15_300_000,
    liquidity: 1_050_000,
    closeAt: future(3),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "宏观经济",
    oneDayChangeBps: -430,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-spacex-mars",
    question: "SpaceX 会在 2026 年内完成星舰入轨复用吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [4100, 5900],
    volume: 3_400_000,
    liquidity: 280_000,
    closeAt: future(240),
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
    category: "科技",
    oneDayChangeBps: 150,
    syncedAt: new Date().toISOString(),
  },
  {
    id: "mkt-worldcup-resolved",
    question: "阿根廷会闯入 2026 世界杯决赛吗？",
    imageUrl: null,
    outcomes: YES_NO,
    pricesBps: [10000, 0],
    volume: 18_700_000,
    liquidity: 0,
    closeAt: "2026-07-12T23:59:00Z",
    closed: true,
    voided: false,
    resolvedOutcomeIndex: 0,
    category: "体育",
    oneDayChangeBps: 0,
    syncedAt: new Date().toISOString(),
  },
];

export const CATEGORIES = [
  "全部",
  "加密货币",
  "宏观经济",
  "科技",
  "体育",
  "娱乐",
];

// 为走势图生成确定性的历史序列（无随机，SSR 稳定）。
export function priceHistory(marketId: string, currentYesBps: number): PricePoint[] {
  const points: PricePoint[] = [];
  const days = 30;
  // 用 id 派生一个稳定的振幅/相位
  let seed = 0;
  for (let i = 0; i < marketId.length; i++) seed += marketId.charCodeAt(i);
  const amp = 800 + (seed % 700);
  const phase = seed % 7;
  const start = currentYesBps - Math.round(Math.sin(phase) * amp * 0.6);
  for (let d = days; d >= 0; d--) {
    const wave = Math.sin((days - d) / 4 + phase) * amp * (0.4 + ((days - d) / days) * 0.6);
    const drift = ((currentYesBps - start) * (days - d)) / days;
    let v = start + drift + wave * 0.5;
    v = Math.max(200, Math.min(9800, Math.round(v)));
    if (d === 0) v = currentYesBps;
    const t = new Date(Date.now() - d * 86400000).toISOString();
    points.push({ t, yesBps: v });
  }
  return points;
}

export function getMarket(id: string): MarketDTO | undefined {
  return MARKETS.find((m) => m.id === id);
}

// 当前登录用户（mock）
export const ME = {
  userId: "usr_me",
  username: "我",
  balanceMilli: 7_420_000, // 7,420 积分
  initialMilli: 10_000_000,
};

export const MY_POSITIONS: PositionDTO[] = [
  {
    marketId: "mkt-btc-200k",
    question: "2025 年底前比特币会突破 20 万美元吗？",
    imageUrl: null,
    outcomeIndex: 0,
    outcomeLabel: "是",
    shares: 1200,
    avgPriceBps: 3100,
    currentPriceBps: 3800,
    costMilli: 372_000,
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
  },
  {
    marketId: "mkt-fed-cut-march",
    question: "美联储会在 3 月会议上降息吗？",
    imageUrl: null,
    outcomeIndex: 1,
    outcomeLabel: "否",
    shares: 800,
    avgPriceBps: 5500,
    currentPriceBps: 4800,
    costMilli: 440_000,
    closed: false,
    voided: false,
    resolvedOutcomeIndex: null,
  },
  {
    marketId: "mkt-worldcup-resolved",
    question: "阿根廷会闯入 2026 世界杯决赛吗？",
    imageUrl: null,
    outcomeIndex: 0,
    outcomeLabel: "是",
    shares: 500,
    avgPriceBps: 7200,
    currentPriceBps: 10000,
    costMilli: 360_000,
    closed: true,
    voided: false,
    resolvedOutcomeIndex: 0,
  },
];

const NAMES = [
  "老王抄底", "预言帝", "梭哈狂魔", "稳健老李", "西二旗巴菲特",
  "AllIn小张", "概率论战神", "深夜下注人", "反指之王", "佛系持有",
  "量化韭菜", "多头急先锋", "空军司令", "接盘侠本侠", "看多中国",
];

export const LEADERBOARD: LeaderRowDTO[] = NAMES.map((name, i) => {
  const netWorth = Math.round((24800 - i * 1180 + (i % 3) * 260) * 1000);
  const positionsValue = Math.round((netWorth * (0.3 + (i % 5) * 0.08)) / 1000) * 1000;
  return {
    rank: i + 1,
    userId: `usr_${i}`,
    username: name,
    avatarUrl: null,
    netWorthMilli: netWorth,
    balanceMilli: netWorth - positionsValue,
    positionsValueMilli: positionsValue,
    isMe: false,
  };
}).concat([
  {
    rank: 87,
    userId: ME.userId,
    username: ME.username,
    avatarUrl: null,
    netWorthMilli: 11_240_000,
    balanceMilli: ME.balanceMilli,
    positionsValueMilli: 11_240_000 - ME.balanceMilli,
    isMe: true,
  },
]);
