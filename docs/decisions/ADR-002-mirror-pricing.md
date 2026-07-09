# ADR-002: 镜像 Polymarket 赔率，而非自建做市（LMSR/订单簿）

## Status
Accepted

## Date
2026-07-09

## Context
预测市场需要一个价格来源。有三条路：自建 AMM/LMSR 做市、自建订单簿撮合、或直接镜像 Polymarket 的真实赔率。产品定位是**娱乐模拟盘**，且用户已明确要求「直接走 Polymarket 数据，通过 API 获取，不影响 Polymarket 的赔率」。

## Decision
**直接镜像 Polymarket 的当前赔率**（`outcomePrices`），价格对本站**外生**：用户下注不改变任何市场的赔率。本站只读消费 Polymarket 公开 API，永不回写。

- 买入份额：`shares = amount / price`，`price` 为镜像的当前赔率。
- 卖出：按当前镜像价折现。
- 结算：跟随 Polymarket 的结算结果，本站不判定。

## Alternatives Considered

### 自建 LMSR 做市
- Pros：单用户即可玩，价格随下注自动波动，有「市场感」，亏损有界。
- Cons：与「镜像真实数据」目标冲突；价格与真实 Polymarket 脱节；实现与调参（流动性参数 b）复杂。
- Rejected：用户明确要真实数据镜像；自建做市偏离核心定位。

### 自建订单簿撮合
- Pros：最还原真实交易。
- Cons：需双边流动性，娱乐场景**冷启动死亡**（没人挂单就无法成交）。
- Rejected：冷启动不可行。

## Consequences
- **优点**：实现极简（无做市/撮合/预言机）；无滑点，用户想买多少买多少；结算零成本搭便车（读 Polymarket 结果）；与真实世界赔率一致，有真实感。
- **代价 / 取舍**：
  - 本站「市场」不因本站用户行为波动（价格外生）。娱乐场景可接受，甚至更爽。
  - 强依赖 Polymarket API 可用性 → 需容错与降级（见 [03 §6](../03-polymarket-integration.md#6-容错与校验把外部数据当不可信输入)）。
  - 赔率有同步延迟（≤ 一个同步周期）→ 需滑点/过期保护（见 [05 §6](../05-trading-and-settlement.md#6-边界与异常)）。
  - 特殊结算（50-50 / 作废）无「获胜方」→ 本站按 **VOID 全额退回成本**处理（决策 Q3，见 [05 §5.3](../05-trading-and-settlement.md#53-void-特殊结算全额退回)）。
- 因价格外生，无需在下注时更新市场状态，交易事务只动 `user` + `position` + `trade`（见 [05 §3](../05-trading-and-settlement.md#3-交易流程)）。
