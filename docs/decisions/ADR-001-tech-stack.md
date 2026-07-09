# ADR-001: 采用 Next.js + PostgreSQL + Prisma 作为核心技术栈

## Status
Accepted

## Date
2026-07-09

## Context
ClonePolyMarket 需要：前端渲染市场/排行榜、后端处理下注与结算、后台定时同步 Polymarket 数据、一个保证**积分守恒**的事务型存储。团队规模小、运维能力有限，希望零运维起步、类型安全、前后端一体。

## Decision
- **全栈框架**：Next.js（App Router）+ TypeScript。前端 SSR + 后端 Route Handlers 一体，Serverless 部署友好。
- **数据库**：PostgreSQL。
- **ORM**：Prisma（类型安全 + migration 管理）。
- **鉴权**：MVP 用**昵称 + 密码**（昵称唯一去重，无需邮箱）+ HTTP-only Cookie 会话。详见 [ADR-005](./ADR-005-product-rules.md)。
- **部署**：Vercel + 托管 Postgres（Neon / Supabase）+ 外部 Cron。

## Alternatives Considered

### 数据库：SQLite
- Pros：零配置、嵌入式。
- Cons：并发写弱、无成熟托管、事务隔离在高并发下注场景受限。
- Rejected：多用户并发下注需要可靠的行锁/事务与托管，Postgres 更稳。

### 数据库：MongoDB
- Pros：灵活 schema。
- Cons：用户/持仓/市场是强关系数据；积分守恒需要 ACID 事务，文档库处理跨文档事务更笨重。
- Rejected：关系型数据 + 强事务需求更契合 Postgres。

### 框架：前后端分离（React SPA + 独立 Node/Nest 后端）
- Pros：关注点分离清晰。
- Cons：两套部署、两套类型同步、冷启动更复杂；对小团队是过度工程。
- Rejected：Next.js 单体在此规模下更简单，类型端到端复用。

### 鉴权：JWT（无状态）
- Pros：无状态、易横向扩展。
- Cons：浏览器优先场景下 HTTP-only Cookie 的 CSRF/XSS 权衡更可控，登出/失效更简单。
- Rejected（MVP）：Cookie 会话更简单安全；规模化后可重估。

## Consequences
- 前后端共享 TypeScript 类型，契约一致（见 [04](../04-api-design.md)）。
- Prisma migration 管理 schema 演进（见 [02](../02-data-model.md)）。
- Serverless 环境下**后台常驻轮询不可靠**，故同步走「外部 Cron → 受保护端点」模式（见 [ADR-004](./ADR-004-sync-scheduling.md)）。
- 需要 Postgres 运维知识（标准技能，低风险）。
