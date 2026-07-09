# ClonePolyMarket

> 一个**娱乐性质**的 Polymarket 模拟盘：镜像 Polymarket 真实市场赔率，用户以虚拟积分「下注」，通过排行榜比拼收益。**不涉及任何真实资金，与 Polymarket 官方无任何关联。**

## 这是什么

- 每个用户初始获得 **10,000 虚拟积分**。
- 市场（问题、赔率、结算结果）全部来自 Polymarket 公开只读 API（Gamma / CLOB），本站**从不向 Polymarket 回写任何数据**，不影响其真实赔率。
- 用户按当前镜像赔率买入 Yes/No 份额，市场在 Polymarket 结算后自动结算并赔付积分。
- 全站排行榜按积分净值 / 收益率排名。

## 文档

完整技术方案位于 [`docs/`](./docs)：

| # | 文档 | 内容 |
|---|---|---|
| — | [docs/README.md](./docs/README.md) | 文档索引 |
| 00 | [00-overview.md](./docs/00-overview.md) | 产品愿景、范围、成功标准 |
| 01 | [01-architecture.md](./docs/01-architecture.md) | 系统架构、组件、数据流 |
| 02 | [02-data-model.md](./docs/02-data-model.md) | 数据库模型与不变量 |
| 03 | [03-polymarket-integration.md](./docs/03-polymarket-integration.md) | Polymarket API 集成与同步策略 |
| 04 | [04-api-design.md](./docs/04-api-design.md) | 本站后端 API 设计 |
| 05 | [05-trading-and-settlement.md](./docs/05-trading-and-settlement.md) | 交易、估值、结算逻辑 |
| 06 | [06-ui-ux-design-system.md](./docs/06-ui-ux-design-system.md) | 设计系统：色彩、排版、组件 |
| 07 | [07-screens-and-flows.md](./docs/07-screens-and-flows.md) | 页面清单与交互流程 |
| 08 | [08-roadmap-and-open-questions.md](./docs/08-roadmap-and-open-questions.md) | 里程碑与待决问题 |
| — | [decisions/](./docs/decisions) | 架构决策记录 (ADR) |

## 技术栈（拟定）

- **前端 / 全栈**：Next.js (App Router) + TypeScript + Tailwind CSS
- **数据库**：PostgreSQL + Prisma
- **同步**：服务端定时任务轮询 Polymarket Gamma / CLOB API
- **部署**：Vercel + 托管 Postgres（Neon / Supabase）

详见 [ADR-001](./docs/decisions/ADR-001-tech-stack.md)。

## 状态

📐 **方案设计阶段** — 目前仅有技术方案文档，尚未开始编码。实现顺序见 [08-roadmap](./docs/08-roadmap-and-open-questions.md)。

## 法律声明

本项目为娱乐与技术演示用途。所有「下注」均使用虚拟积分，无任何现实货币价值。本项目非 Polymarket 官方产品，与 Polymarket 无隶属或合作关系，仅只读消费其公开数据。
