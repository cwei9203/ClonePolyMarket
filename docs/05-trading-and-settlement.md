# 05 · 交易、估值与结算逻辑

← [04 API 设计](./04-api-design.md) · [文档索引](./README.md) · 下一篇 → [06 UI/UX 设计系统](./06-ui-ux-design-system.md)

---

> 本文定义核心经济逻辑（`src/lib/trading/`）。所有算术在整数域进行（见 [02 §2](./02-data-model.md#2-数值精度约定重要)），并严守 [02 §4 不变量](./02-data-model.md#4-核心不变量)。

## 1. 心智模型

用户用积分买入某结果的**份额**。逻辑与真实 Polymarket 一致，但**价格外生**（镜像，不因下注波动，见 [ADR-002](./decisions/ADR-002-mirror-pricing.md)）：

- 价格 $p \in [0,1]$ 即隐含概率，也是「每份的当前单价」。
- 每份在市场结算时：若该结果获胜 → 赔付 **1 积分**；若失败 → 归 **0**。
- 因此**低价买入获胜结果 = 高回报**。这正是预测市场的爽点，本站零成本继承。

## 2. 数值与舍入

**单位**：金额 = 厘（1 积分 = 1000 厘）；份额 = 厘份（1 份 = 1000 厘份）；价格 = 基点 bps（$p \times 10000$）。

### 2.1 买入份额计算

花费 `amount`（厘）按价 `pBps` 买入，得到份额（厘份）：

$$\text{shares} = \left\lfloor \frac{\text{amount} \times 1000 \times 10000}{\text{pBps} \times 1000} \right\rfloor = \left\lfloor \frac{\text{amount} \times 10000}{\text{pBps}} \right\rfloor$$

> 例：花 500 积分（`amount = 500000` 厘）买 `pBps = 5150`（0.515）：
> $\text{shares} = \lfloor 500000 \times 10000 / 5150 \rfloor = 970873$ 厘份 ≈ 970.87 份。
> 结算若获胜，赔付 $970873$ 厘份 × 1 积分/份 = `970873` 厘 ≈ 970.87 积分（相对 500 花费，约 +94%）。

**舍入规则**：份额向下取整（floor）。用户略微「少拿」零头，系统永不多发——保证 [INV-1 积分守恒](./02-data-model.md#inv-1-积分守恒) 只会保守偏差，绝不泄漏。

### 2.2 卖出所得计算

卖出 `shares`（厘份）按当前价 `pBps`：

$$\text{proceeds} = \left\lfloor \frac{\text{shares} \times \text{pBps}}{10000} \right\rfloor \text{（厘）}$$

### 2.3 成本与盈亏

`position.costBasis` 累计买入花费（厘）。任意时刻：

- **平均成本价** $= \text{costBasis} \times 10000 / \text{shares}$（bps）
- **当前市值** $= \lfloor \text{shares} \times \text{pBps} / 10000 \rfloor$（厘）
- **未实现盈亏** $= \text{市值} - \text{costBasis}$
- 卖出部分份额时，`costBasis` 按卖出比例等比减少。

## 3. 交易流程

### 3.1 买入（事务伪代码）

```
POST /api/trades (BUY)
BEGIN TRANSACTION
  market = SELECT ... FOR UPDATE where id = marketId
  assert market.closed == false            → 409 MARKET_CLOSED
  assert now - market.syncedAt < STALE_MS  → 409 STALE_PRICE
  pBps = market.lastPriceBps[outcomeIndex]
  user = SELECT ... FOR UPDATE where id = session.userId
  assert user.balance >= amount            → 422 INSUFFICIENT_BALANCE
  shares = floor(amount * 10000 / pBps)
  assert shares > 0                        → 422 VALIDATION_ERROR

  user.balance -= amount
  position = upsert(userId, marketId, outcomeIndex):
      shares    += shares
      costBasis += amount
  insert trade(BUY, shares, pBps, amount = -amount, balanceAfter = user.balance)
COMMIT
```

### 3.2 卖出（事务伪代码）

```
POST /api/trades (SELL)
BEGIN TRANSACTION
  market   = SELECT ... FOR UPDATE
  assert market.closed == false            → 409 MARKET_CLOSED
  assert now - market.syncedAt < STALE_MS  → 409 STALE_PRICE
  pBps     = market.lastPriceBps[outcomeIndex]
  position = SELECT ... FOR UPDATE
  assert position.shares >= shares         → 422 INSUFFICIENT_SHARES
  proceeds = floor(shares * pBps / 10000)

  costRemoved       = floor(position.costBasis * shares / position.shares)
  position.shares  -= shares
  position.costBasis -= costRemoved
  user.balance     += proceeds
  insert trade(SELL, shares, pBps, amount = +proceeds, balanceAfter)
COMMIT
```

> **行锁**：对 `user` 与 `market`/`position` 行加 `FOR UPDATE`（或用 Serializable 事务），防止并发下注造成余额/份额竞态。

## 4. 净值与排行榜计算

> **排行榜口径**：仅按积分净值单一排序（决策 Q6，[08 §4](./08-roadmap-and-open-questions.md#4-已确定的产品决策)）。不做 ROI/已实现多口径——因积分只发不补（每人固定初始 10,000），净值本身已是公平的对比基准。

**用户净值（Net Worth）**：

$$\text{networth}_u = \text{balance}_u + \sum_{p \in \text{positions}_u} \left\lfloor \frac{\text{shares}_p \times \text{pBps}_{p}}{10000} \right\rfloor$$

其中 `pBps` 取该市场当前镜像赔率；**已结算市场**的持仓价值已在结算时并入 balance，故只累加**未结算**持仓。

> 因**积分只发不补**（决策 Q4），无需 ROI 口径，也不存在「领补给虚高 ROI」的问题。破产（余额 0 且无持仓）的用户净值为 0，排名垫底；用户可另注册新号重新开始。

### 4.1 计算策略（性能）

净值依赖实时赔率，无法纯静态。策略：

| 方案 | 适用 | 说明 |
|---|---|---|
| **实时聚合查询** | 用户量小（MVP） | 排行榜请求时 join positions × markets 现算。 |
| **物化视图 + 定时刷新** | 中等规模 | 每次 `sync-prices` 后刷新 `user_networth` 物化视图。 |
| **增量维护** | 大规模 | 交易与价格同步时增量更新缓存净值。 |

MVP 采用实时聚合；随用户增长升级到物化视图（见 [08](./08-roadmap-and-open-questions.md)）。

## 5. 结算

### 5.1 触发

[结算检测任务](./03-polymarket-integration.md#5-同步策略)（默认 60s）对**有本站未结算持仓的市场**轮询 `GET /markets/{id}`，按 [03 §3](./03-polymarket-integration.md#3-结算信号识别) 规则判定结果。

### 5.2 结算流程（事务伪代码）

```
POST /api/cron/settle
for each market with (closed==true, resolvedOutcomeIndex==null in our DB, PM 已确定):
  outcome = classify(market)            # WIN(index) 或 VOID（见 §5.3）
  BEGIN TRANSACTION
    m = SELECT market FOR UPDATE
    if m.resolvedOutcomeIndex != null or m.voided: SKIP  # INV-5 幂等
    if outcome == VOID:                              # 50-50/作废：全额退回成本
      for each position p in market with shares > 0 or costBasis > 0:
        refund = p.costBasis                         # 退回该持仓累计买入成本
        user(p).balance += refund
        insert trade(SETTLE, p.shares, priceBps=null, amount=+refund)  # VOID 退款
        p.shares = 0; p.costBasis = 0
      m.voided = true
    else:                                            # 正常结算：赢家赔 1、输家归零
      winner = outcome.index
      m.resolvedOutcomeIndex = winner
      for each position p in market with shares > 0:
        if p.outcomeIndex == winner:
          payout = p.shares                          # 每份赔 1 积分 = shares 厘份→厘（1:1）
          user(p).balance += payout
          insert trade(SETTLE, p.shares, priceBps=10000, amount=+payout)
        else:
          insert trade(SETTLE, p.shares, priceBps=0, amount=0)   # 失败方归零
        p.shares = 0; p.costBasis = 0
    m.resolvedAt = now
  COMMIT
```

> **幂等（INV-5）**：以 `resolvedOutcomeIndex != null`（正常结算）或 `voided == true`（VOID）为已结算标志，二次运行直接跳过，杜绝重复赔付/重复退款。
>
> **份额→积分**：1 份获胜赔 1 积分，即 `shares`（厘份）直接等值 `payout`（厘），单位对齐无需换算。

### 5.3 VOID 特殊结算（全额退回）

Polymarket 部分市场规则含「若都未发生则 50-50」（此时 `outcomePrices=["0.5","0.5"]`），另有极少数市场被作废。二者本质都是**没有明确赢家**，本站统一按 **VOID 全额退回**处理（决策 Q3，[08 §4](./08-roadmap-and-open-questions.md#4-已确定的产品决策)）：

- 把用户在该市场每个持仓的**累计买入成本 `costBasis` 全额退回**余额，视作这些下注未发生。
- 记一笔 `SETTLE` 流水（`amount = +costBasis`，`priceBps=null`），并清零 `shares`/`costBasis`。
- 市场置 `voided = true`（区别于正常结算的 `resolvedOutcomeIndex`）。

**识别 VOID**（见 [03 §3](./03-polymarket-integration.md#3-结算信号识别)）：`closed==true` 且结算价为 `["0.5","0.5"]`，或 Polymarket 标记市场作废/`umaResolutionStatuses` 指示无效。

> 相比「按 0.5 比例赔付」，全额退回对娱乐玩家更友好——多数人并非在 0.5 价位买入，比例赔付会让其平白亏损；且此类市场极少，单独一条退款分支成本可接受。

## 6. 边界与异常

| 情形 | 处理 |
|---|---|
| **赔率过期**（`syncedAt` 超 `STALE_MS`，默认 90s） | 拒绝下注（409 `STALE_PRICE`），前端提示「赔率更新中」。 |
| **价格 0 或极端** | `pBps=0` 时禁止买入该方（除以 0）；`pBps=10000` 买入几乎无收益，允许但提示。 |
| **市场同步中途关闭** | 下注事务内二次校验 `closed`，已关则回滚。 |
| **并发下注** | 行锁 / Serializable 保证串行化。 |
| **前端展示价 vs 成交价偏差** | 前端提交时带 `expectedPriceBps`，服务端偏差超阈值（如 200bps）返回 409，用户重新确认（滑点保护）。 |
| **市场从 Polymarket 消失** | 保留本站镜像；标 `active=false`，不可再下注；待结算或按 VOID 全额退回（§5.3）。 |
| **用户余额为 0** | 允许继续持有/卖出；无法买入。**无补给/重置**（决策 Q4），用完即止；用户可另注册新号。 |

## 7. 测试要点

- **积分守恒**：随机化大量买/卖/结算后断言 `Σbalance + Σ持仓市值 == 总发行`。
- **舍入方向**：断言 floor 永不导致系统多发积分。
- **结算幂等**：重复调用 settle 不重复赔付。
- **VOID 退回**：50-50/作废市场触发全额退回 `costBasis`，守恒不破，且不与正常结算重复。
- **并发**：并行买入同一用户，余额不会变负。
- **边界价**：`pBps=0/10000` 不崩溃、不除零。
- **过期赔率**：`STALE_PRICE` 正确拦截。

---

← [04 API 设计](./04-api-design.md) · [文档索引](./README.md) · 下一篇 → [06 UI/UX 设计系统](./06-ui-ux-design-system.md)
