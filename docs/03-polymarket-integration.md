# 03 · Polymarket 集成

← [02 数据模型](./02-data-model.md) · [文档索引](./README.md) · 下一篇 → [04 API 设计](./04-api-design.md)

---

> 本文所有端点与字段均于 **2026-07** 对公开 API 实测确认。第三方 API 可能变更，实现时应加版本探测与容错。

## 1. 数据源概览

Polymarket 暴露两套公开、无需鉴权的只读 API：

| API | Base URL | 用途 |
|---|---|---|
| **Gamma API** | `https://gamma-api.polymarket.com` | 市场/事件元数据、当前赔率、结算状态 |
| **CLOB API** | `https://clob.polymarket.com` | 价格历史（走势图）、更细价格档 |

> **原则**：仅本站[同步服务](./01-architecture.md#21-同步服务sync-worker)访问这些 API，集中轮询 + 缓存，绝不按用户请求转发。

## 2. Gamma API — 市场目录与赔率

### 2.1 列出活跃市场

```
GET https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=100&offset=0
```

返回 `Market[]`。关键字段（实测样本）：

```jsonc
{
  "id": "540817",                          // → markets.id (PK)
  "conditionId": "0x1fad72...772be",       // → markets.conditionId
  "question": "New Rihanna Album before GTA VI?",
  "description": "This market will resolve to \"Yes\" if ...",
  "outcomes": "[\"Yes\", \"No\"]",         // ⚠️ JSON 字符串，需二次 parse
  "outcomePrices": "[\"0.515\", \"0.485\"]", // ⚠️ JSON 字符串 → 当前赔率
  "clobTokenIds": "[\"98022...227\", \"53831...026\"]", // ⚠️ JSON 字符串 → 查历史价用
  "volume": "853164.69",                   // 热度排序
  "liquidity": "29332.09",
  "image": "https://polymarket-upload.s3...jpg",
  "icon":  "https://polymarket-upload.s3...jpg",
  "endDate": "2026-07-31T12:00:00Z",       // → markets.closeAt
  "active": true,
  "closed": false,
  "lastTradePrice": 0.51,
  "bestBid": 0.51,
  "bestAsk": 0.52,
  "enableOrderBook": true
}
```

> ⚠️ **关键陷阱**：`outcomes`、`outcomePrices`、`clobTokenIds` 三个字段的值是 **JSON 字符串**（不是数组），必须 `JSON.parse` 后再用。这是最容易踩的坑。

### 2.2 单个市场（结算检测用）

```
GET https://gamma-api.polymarket.com/markets/{id}
```

返回单个完整 `Market` 对象。结算检测轮询此端点判断 `closed` 与结果。

### 2.3 事件分组（可选，用于分类导航）

```
GET https://gamma-api.polymarket.com/events?active=true&closed=false&limit=50
```

一个 `event` 含 `markets[]` 数组（多个相关市场归组），带 `title`、`ticker`、`slug`、`image`。用于按主题聚合展示（如「GTA VI 之前会发生什么？」下挂多个子市场）。

## 3. 结算信号识别

**本站不判定任何结果**，完全读取 Polymarket 的结算状态。判定规则：

| 条件（来自 `GET /markets/{id}`） | 含义 | 本站动作 |
|---|---|---|
| `closed == false` | 仍在交易 | 不结算，继续镜像赔率 |
| `closed == true` 且 `outcomePrices == ["1","0"]` | **Yes 获胜** | 结算：`resolvedOutcomeIndex = 0` |
| `closed == true` 且 `outcomePrices == ["0","1"]` | **No 获胜** | 结算：`resolvedOutcomeIndex = 1` |
| `closed == true` 且 `outcomePrices == ["0.5","0.5"]` | 50-50 特殊结算 | 见[开放问题 Q3](./08-roadmap-and-open-questions.md)——按比例赔付 |
| `umaResolutionStatus == "proposed"` | 结果提议中、未最终确定 | **暂不结算**，等待 `resolved` |

> **稳健判定**：以 `closed == true` **且** `outcomePrices` 中出现一个 `≥ 0.99` 的值作为「已确定」信号；否则视为未定，下周期重试。避免在 `proposed` 阶段过早结算。实测已结算样本：Kraken IPO 市场 `closed:true, outcomePrices:["0","1"]`。

## 4. CLOB API — 历史价格（走势图）

```
GET https://clob.polymarket.com/prices-history?market={clobTokenId}&interval={interval}&fidelity={minutes}
```

| 参数 | 说明 |
|---|---|
| `market` | **`clobTokenId`**（来自 `market.clobTokenIds[0]`，即 Yes 的 ERC1155 token id），**不是** `conditionId` 或 `market.id` |
| `interval` | `1h` / `6h` / `1d` / `1w` / `1m` / `max` |
| `fidelity` | 采样间隔（分钟） |

返回：

```jsonc
{ "history": [ { "t": 1783504805, "p": 0.515 }, ... ] }  // t = Unix 秒, p = 价格
```

> 走势图默认展示 Yes 结果的价格曲线。No 曲线 = $1 - p_{yes}$，或用 `clobTokenIds[1]` 单独拉取。

## 5. 同步策略

| 任务 | 频率 | 端点 | 落库 | 参见 |
|---|---|---|---|---|
| 市场目录 | 5 min | `/markets?active=true&closed=false` 分页 | upsert `markets` | [01 §2.1](./01-architecture.md#21-同步服务sync-worker) |
| 赔率刷新 | 30 s | `/markets?closed=false` 批量 | `markets.lastPrices` + `price_snapshots` | |
| 结算检测 | 60 s | `/markets/{id}`（仅有本站持仓的市场） | 触发[结算](./05-trading-and-settlement.md#3-结算) | |
| 历史价缓存 | 按需/15 min | `/prices-history` | `price_history` 缓存 | |

### 5.1 客户端封装（`src/lib/polymarket/`）

```typescript
// 契约（实现时具体化）
interface PolymarketClient {
  // 拉取活跃市场（自动分页 + parse JSON 字符串字段）
  fetchActiveMarkets(params?: { limit?: number; offset?: number }): Promise<GammaMarket[]>;
  // 单市场（结算检测）
  fetchMarket(id: string): Promise<GammaMarket>;
  // 历史价（走势图）
  fetchPriceHistory(clobTokenId: string, interval: Interval, fidelity: number): Promise<PricePoint[]>;
}

// 规范化后的内部类型（已 parse，数值转基点）
interface NormalizedMarket {
  id: string;
  conditionId: string;
  question: string;
  outcomes: string[];          // 已 parse
  outcomePricesBps: number[];  // 已转基点 [5150, 4850]
  clobTokenIds: string[];      // 已 parse
  volume: bigint;
  closeAt: Date;
  closed: boolean;
  resolvedOutcomeIndex: number | null;  // 已按 §3 规则判定
}
```

## 6. 容错与校验（把外部数据当不可信输入）

> 依据接口设计原则：**第三方 API 响应是不可信数据，使用前必须校验形状与内容。**

| 风险 | 处理 |
|---|---|
| 字段缺失/类型异常 | 用 schema（如 zod）在 `polymarket/` 边界校验；解析失败的市场跳过并记日志，不落库脏数据。 |
| `outcomes`/`prices` 非法 JSON | try-parse，失败即丢弃该条。 |
| API 超时/5xx | 指数退避重试（如 3 次）；仍失败则本周期保留旧快照。 |
| API 长时间不可用 | 前端标记「赔率更新中」，`syncedAt` 超过阈值（如 5 min）则**禁用下注**（见 [05 §5](./05-trading-and-settlement.md#5-边界与异常)）。 |
| 限流 | 集中批量拉取；如遇 429，退避并降低频率。 |
| 价格越界 | 校验 $p \in [0,1]$，异常值丢弃。 |
| 非二元市场 | MVP 仅支持二元（Yes/No）市场；`outcomes.length != 2` 的市场过滤掉（见[开放问题 Q1](./08-roadmap-and-open-questions.md)）。 |

## 7. 合规与归属

- 页面显著标注：**「娱乐模拟，非真实交易；本站与 Polymarket 无关联，仅只读消费其公开数据。」**
- 不使用 Polymarket 商标暗示官方背书。
- 尊重其服务条款与限流；如对方要求停止访问则遵从。
- 详见 [00 §法律声明](../README.md) 与 [08](./08-roadmap-and-open-questions.md)。

---

← [02 数据模型](./02-data-model.md) · [文档索引](./README.md) · 下一篇 → [04 API 设计](./04-api-design.md)
