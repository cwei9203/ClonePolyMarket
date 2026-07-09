# ClonePolyMarket · 技术方案文档

> 一个**娱乐性质**的 Polymarket 模拟盘：镜像真实市场赔率，用户以虚拟积分「下注」，通过排行榜比拼收益。**不涉及真实资金，与 Polymarket 官方无关联。**

本目录是完整技术方案。建议**按序号顺序阅读**；每篇底部有上下篇导航。

## 阅读顺序

| # | 文档 | 内容摘要 |
|---|---|---|
| 00 | [产品概述与愿景](./00-overview.md) | 定义、动机、核心机制、范围、成功标准、术语 |
| 01 | [系统架构](./01-architecture.md) | 组件职责、数据流、目录结构、选型摘要 |
| 02 | [数据模型](./02-data-model.md) | 实体关系、数值精度、表定义、**核心不变量** |
| 03 | [Polymarket 集成](./03-polymarket-integration.md) | Gamma/CLOB API、字段映射、结算识别、同步策略、容错 |
| 04 | [API 设计](./04-api-design.md) | 后端端点、错误语义、鉴权、契约类型 |
| 05 | [交易与结算](./05-trading-and-settlement.md) | 买卖数学、估值、结算流程、边界与异常 |
| 06 | [UI/UX 设计系统](./06-ui-ux-design-system.md) | 色彩(OKLCH)、排版、组件、动效、反 AI 套版 |
| 07 | [页面与交互流程](./07-screens-and-flows.md) | 页面清单、布局、关键流程、状态设计、文案 |
| 08 | [里程碑与开放问题](./08-roadmap-and-open-questions.md) | 实现顺序、边界规则、测试、待决问题、风险 |

## 架构决策记录 (ADR)

记录关键技术决策的「为什么」及被否决的备选方案：

| ADR | 决策 |
|---|---|
| [ADR-001](./decisions/ADR-001-tech-stack.md) | Next.js + PostgreSQL + Prisma 技术栈 |
| [ADR-002](./decisions/ADR-002-mirror-pricing.md) | 镜像 Polymarket 赔率，而非自建做市 |
| [ADR-003](./decisions/ADR-003-frontend-stack.md) | Tailwind + shadcn/ui + 深色终端风设计系统 |
| [ADR-004](./decisions/ADR-004-sync-scheduling.md) | 外部 Cron → 受保护端点的同步调度 |

## 三条贯穿全文的核心约束

1. **只读镜像** — 只消费 Polymarket 公开数据，永不回写，不影响其真实赔率。（[ADR-002](./decisions/ADR-002-mirror-pricing.md)）
2. **积分守恒** — `Σ余额 + Σ持仓市值 = 总发行`，整数域算术 + 事务保证，永不凭空增减。（[02 §4](./02-data-model.md#4-核心不变量)）
3. **结算搭便车** — 市场结果直接读 Polymarket 结算数据，本站不判定。（[03 §3](./03-polymarket-integration.md#3-结算信号识别)）

## 当前状态

📐 **方案设计阶段**。尚未编码。实现按 [08 里程碑](./08-roadmap-and-open-questions.md#1-实现里程碑建议顺序) M0→M6 推进。

有 [8 个开放问题](./08-roadmap-and-open-questions.md#4-开放问题需产品决策) 需在开工前确认（均已给出建议默认值）。
