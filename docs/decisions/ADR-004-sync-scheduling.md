# ADR-004: 同步采用「外部 Cron → 受保护端点」而非常驻轮询进程

## Status
Accepted

## Date
2026-07-09

## Context
本站唯一与 Polymarket 通信的组件是[同步服务](../01-architecture.md#21-同步服务sync-worker)，需周期性拉取市场目录、赔率、结算状态。目标部署环境为 Vercel（Serverless），而 Serverless 函数**无法可靠维持常驻后台进程**（`setInterval` 在函数生命周期结束后即停止）。

## Decision
将同步任务实现为**受保护的 HTTP 端点**（`/api/cron/sync-markets`、`/api/cron/sync-prices`、`/api/cron/settle`），由**外部调度器**按频率触发：

- 首选 **Vercel Cron**（或 GitHub Actions / 云函数定时器）。
- 端点用共享密钥保护：`Authorization: Bearer $CRON_SECRET`，非公开。
- 每次调用完成一批同步工作（幂等、可重入）。

自托管场景下，同一套端点也可由独立 Node 常驻进程 `setInterval` 调用（备选）。

## Alternatives Considered

### 应用内常驻轮询进程（`setInterval`）
- Pros：实现直观，无需外部调度。
- Cons：Serverless 环境下不可靠（函数休眠即停）；需要额外常驻 worker 或独立主机，增加运维。
- Rejected（默认部署）：与 Vercel 部署模型冲突；保留为自托管备选。

### 用户请求触发的懒同步（按需拉取）
- Cons：把外部 API 压力放大到每个用户请求，违反[集中轮询、尊重限流](../03-polymarket-integration.md#5-同步策略)的原则；赔率抖动、缓存难控。
- Rejected：不可控且对 Polymarket 不友好。

### 消息队列 / 专用任务系统（如 Inngest、BullMQ）
- Pros：重试、编排能力强。
- Cons：MVP 阶段过度工程。
- Deferred：规模化或同步逻辑复杂化后可引入。

## Consequences
- 同步频率通过调度配置调整（市场目录 5min / 赔率 30s / 结算 60s，见 [03 §5](../03-polymarket-integration.md#5-同步策略)），无需改代码。
- 端点必须**幂等**且**鉴权**：结算端点重复触发不重复赔付（[05 §5.2](../05-trading-and-settlement.md#52-结算流程事务伪代码) INV-5）。
- 需管理 `CRON_SECRET` 密钥（不入库、不提交，见 [08 Boundaries](../08-roadmap-and-open-questions.md#2-边界与规则boundaries)）。
- 需监控每个 cron 端点的成功/失败/延迟（[08 §6 可观测性](../08-roadmap-and-open-questions.md#6-可观测性上线前)）。
