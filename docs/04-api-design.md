# 04 · API 设计

← [03 Polymarket 集成](./03-polymarket-integration.md) · [文档索引](./README.md) · 下一篇 → [05 交易与结算](./05-trading-and-settlement.md)

---

> 遵循接口设计原则：契约优先、错误语义一致、边界校验、加法优先、命名可预测。

## 1. 通则

- **Base**：`/api`（Next.js Route Handlers）。
- **格式**：请求/响应均 JSON。
- **命名**：资源用复数名词，无动词；query 参数 camelCase；响应字段 camelCase；枚举 UPPER_SNAKE。
- **金额单位**：请求与响应中金额/份额一律用**整数厘/厘份**（见 [02 §2](./02-data-model.md#2-数值精度约定重要)），避免浮点。价格用基点（0–10000）。展示层换算。
- **分页**：列表端点统一 `?page=&pageSize=&sortBy=&sortOrder=`。

### 1.1 统一响应包络

成功：
```jsonc
{ "data": { /* ... */ }, "meta": { /* 可选：分页等 */ } }
```

分页列表：
```jsonc
{
  "data": [ /* ... */ ],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 142, "totalPages": 8 }
}
```

### 1.2 统一错误格式

```jsonc
{ "error": { "code": "INSUFFICIENT_BALANCE", "message": "余额不足", "details": {} } }
```

| HTTP | code 示例 | 场景 |
|---|---|---|
| 400 | `BAD_REQUEST` | 请求格式错误 |
| 401 | `UNAUTHENTICATED` | 未登录 |
| 403 | `FORBIDDEN` | 无权限 |
| 404 | `MARKET_NOT_FOUND` | 资源不存在 |
| 409 | `MARKET_CLOSED` / `STALE_PRICE` | 状态冲突（市场已关/价格过期） |
| 422 | `VALIDATION_ERROR` / `INSUFFICIENT_BALANCE` / `INSUFFICIENT_SHARES` | 语义校验失败 |
| 429 | `RATE_LIMITED` | 限流 |
| 500 | `INTERNAL_ERROR` | 服务端错误（不泄露内部细节） |

## 2. 鉴权

- **MVP**：邮箱 + 密码（`passwordHash` 用 bcrypt/argon2），会话用 **HTTP-only Cookie**（session-based）。理由：浏览器优先、CSRF 可控、实现简单。见 [ADR-001](./decisions/ADR-001-tech-stack.md)。
- 也可接第三方 OAuth（GitHub/Google），Post-MVP。
- 所有写端点要求已登录会话；用户身份从会话解析，**绝不信任 body 里的 userId**。

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/auth/register` | POST | 注册，创建用户并发放初始 10,000 积分 |
| `/api/auth/login` | POST | 登录，设置会话 Cookie |
| `/api/auth/logout` | POST | 登出，清除会话 |
| `/api/auth/me` | GET | 当前用户信息（余额、净值） |

**注册请求：**
```jsonc
POST /api/auth/register
{ "username": "alice", "email": "a@x.com", "password": "..." }
```
**响应 201：**
```jsonc
{ "data": { "id": "usr_...", "username": "alice", "balance": 10000000 } }  // 厘 = 10000 积分
```

## 3. 市场端点（读，源自镜像数据）

### 3.1 列出市场

```
GET /api/markets?page=1&pageSize=20&sortBy=volume&sortOrder=desc&status=open&search=&category=
```

| query | 说明 |
|---|---|
| `status` | `open`（默认，未结算）/ `resolved` / `all` |
| `sortBy` | `volume`（热度，默认）/ `closeAt`（临近截止）/ `newest` |
| `search` | 按问题文本模糊匹配（Post-MVP） |
| `category` | 事件/主题分类（Post-MVP） |

**响应（分页）：**
```jsonc
{
  "data": [{
    "id": "540817",
    "question": "New Rihanna Album before GTA VI?",
    "imageUrl": "https://...jpg",
    "outcomes": ["Yes", "No"],
    "pricesBps": [5150, 4850],       // 当前镜像赔率
    "volume": 853164,
    "closeAt": "2026-07-31T12:00:00Z",
    "closed": false,
    "syncedAt": "2026-07-09T09:53:00Z"
  }],
  "pagination": { "page": 1, "pageSize": 20, "totalItems": 142, "totalPages": 8 }
}
```

### 3.2 市场详情

```
GET /api/markets/:id
```
返回单市场完整信息 + 当前用户在该市场的持仓（若已登录）。

### 3.3 市场走势图

```
GET /api/markets/:id/history?interval=1w&outcome=0
```
返回本站缓存或代理的 CLOB 历史价（见 [03 §4](./03-polymarket-integration.md#4-clob-api--历史价格走势图)）。
```jsonc
{ "data": { "interval": "1w", "points": [ { "t": 1783504805, "priceBps": 5150 }, ... ] } }
```

## 4. 交易端点（写，事务）

### 4.1 买入

```
POST /api/trades
```
```jsonc
// 请求
{ "marketId": "540817", "outcomeIndex": 0, "side": "BUY", "amount": 500000 }  // 花 500 积分（厘）
```
- 服务端在事务内：读 `market.lastPrices` 锁定成交价 → 校验市场开放 & 未过期 & 余额足够 → 计算 `shares = amount / price` → 扣余额、增持仓、写流水。见 [05 §2](./05-trading-and-settlement.md#2-数值与舍入)。

```jsonc
// 响应 201
{ "data": {
    "trade": { "id": "trd_...", "side": "BUY", "shares": 970873, "priceBps": 5150, "amount": -500000 },
    "position": { "outcomeIndex": 0, "shares": 970873, "avgPriceBps": 5150 },
    "balance": 9500000
}}
```

> **不接受前端传入价格**。若前端展示价与成交价偏差超过容忍阈值，返回 `409 STALE_PRICE`，前端提示重新确认（滑点保护，见 [05 §5](./05-trading-and-settlement.md#5-边界与异常)）。

### 4.2 卖出

```
POST /api/trades
{ "marketId": "540817", "outcomeIndex": 0, "side": "SELL", "shares": 500000 }  // 卖 500 份（厘份）
```
- 事务内：校验持有份额足够 → 按当前镜像价计算所得积分 → 增余额、减持仓、写流水。

### 4.3 交易历史

```
GET /api/trades?page=1&pageSize=20
```
返回当前用户流水（`trades`，倒序）。

## 5. 边界校验（服务端强制）

| 校验 | 失败响应 |
|---|---|
| 已登录 | 401 `UNAUTHENTICATED` |
| `amount`/`shares` 为正整数 | 422 `VALIDATION_ERROR` |
| 市场存在且 `closed=false` | 404 / 409 `MARKET_CLOSED` |
| 赔率未过期（`syncedAt` 在阈值内） | 409 `STALE_PRICE` |
| 买入：`balance ≥ amount` | 422 `INSUFFICIENT_BALANCE` |
| 卖出：`position.shares ≥ shares` | 422 `INSUFFICIENT_SHARES` |
| 成交价服务端锁定 | —（安全不变量 INV-4） |

> 校验只在 API 边界做；核心 `lib/trading` 函数信任已校验的类型。

## 6. 排行榜端点

```
GET /api/leaderboard?metric=networth&page=1&pageSize=50
```

| query | 说明 |
|---|---|
| `metric` | `networth`（净值，默认）/ `roi`（收益率）/ `realized`（已实现余额） |

```jsonc
{
  "data": [
    { "rank": 1, "userId": "usr_1", "username": "alice", "avatarUrl": "...",
      "networth": 18420000, "roi": 8420, "positionsValue": 8920000, "balance": 9500000 }
  ],
  "pagination": { "page": 1, "pageSize": 50, "totalItems": 1240, "totalPages": 25 },
  "meta": { "me": { "rank": 87, "networth": 12300000, "roi": 2300 } }  // 当前用户自己的排名
}
```
- 净值计算见 [05 §4](./05-trading-and-settlement.md#4-净值与排行榜计算)。`roi` 用基点（8420 = +84.2%）。

## 7. 内部/受保护端点（Cron）

仅供[同步服务](./01-architecture.md#21-同步服务sync-worker)调用，用共享密钥（Header `Authorization: Bearer $CRON_SECRET`）保护，非公开。

| 端点 | 说明 |
|---|---|
| `POST /api/cron/sync-markets` | 同步市场目录 |
| `POST /api/cron/sync-prices` | 刷新赔率 + 写快照 |
| `POST /api/cron/settle` | 结算检测与赔付 |

## 8. 契约类型（TypeScript 摘要）

```typescript
type OutcomeIndex = 0 | 1;                    // MVP 二元市场
type Bps = number;                            // 0..10000
type Milli = number;                          // 厘 / 厘份（整数）

interface MarketDTO {
  id: string;
  question: string;
  imageUrl: string | null;
  outcomes: string[];
  pricesBps: Bps[];
  volume: number;
  closeAt: string;                            // ISO
  closed: boolean;
  syncedAt: string;
}

interface TradeInput {
  marketId: string;
  outcomeIndex: OutcomeIndex;
  side: 'BUY' | 'SELL';
  amount?: Milli;                             // BUY 用
  shares?: Milli;                             // SELL 用
}

interface APIError {
  error: { code: string; message: string; details?: unknown };
}
```

---

← [03 Polymarket 集成](./03-polymarket-integration.md) · [文档索引](./README.md) · 下一篇 → [05 交易与结算](./05-trading-and-settlement.md)
