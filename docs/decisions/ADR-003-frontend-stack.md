# ADR-003: 前端采用 Tailwind CSS，清新浅色自有设计系统

## Status
Accepted（v2，2026-07-09 修订：由深色终端风改为清新浅色）

## Date
2026-07-09

## Context
UI 需要：数据密集（价格、概率、盈亏、排行）却仍愉悦；快速落地一致的设计系统；建立**区别于 Polymarket 的自有识别度**；规避 AI 套版审美。用户明确要求「完整考虑整体 UI 设计和交互」，并在实现阶段进一步明确：**清新好看、易操作、可参考 Polymarket 原网站、页面先只做中文**。Polymarket 官网本身为浅色、清爽、蓝调风格。

## Decision
- **样式**：Tailwind CSS v4（`@theme` CSS 变量，零运行时、SSR 友好）。
- **主题**：**清新浅色为默认**（场景：白天办公室 / 通勤，快速扫概率、下注、看排名）。冷调近白背景（非纯白），纯白卡片浮起。
- **品牌色**：**靛紫（indigo-violet）** —— 区别于 Polymarket 的蓝，跳出「预测市场=蓝白」的第一反射，同时保留清新气质。色彩策略为 Restrained（一个承诺型品牌色 + 中性浅底 + 语义涨跌色）。
- **语义色**：Yes/涨/胜=绿，No/跌/负=红；不仅靠色彩（辅以符号 ▲▼ 与文字）。
- **组件**：在 Tailwind 之上手写项目专用组件（`MarketCard`、`TradePanel`、`PriceChart`、`LeaderboardRow`、`PositionRow` 等），保持代码可控与识别度。未引入成品组件库。
- **图表**：纯 SVG 手绘赔率走势（面积折线 + hover 游标），不引第三方图表库，保持包体小、贴合数据终端精度。
- **设计系统**：三层 Token（primitive → semantic → component），OKLCH 色彩空间，CSS 变量落地。
- 完整规范见 [06 设计系统](../06-ui-ux-design-system.md)。实现位于 `web/`。

## Alternatives Considered

### 深色终端风（v1 原决策）
- Pros：昏暗环境友好、数据高亮聚焦。
- Cons：与用户「清新好看 + 参考 Polymarket（浅色）」的明确要求相悖。
- Rejected：用户显式指定浅色清新方向，且白天/办公室场景更贴合浅色。保留浅色主题优先，深色可作为后续可选主题（Token 已为切换预留）。

### 成品组件库（MUI / Ant Design）
- Pros：开箱即用。
- Cons：强品牌样式难定制、易「一眼看出用了什么库」、包体大。
- Rejected：需要自有识别度与精细控制。

### 跟随 Polymarket 蓝白配色
- Cons：直接照搬易混淆归属、落入「预测市场=蓝」的套版。
- Rejected：借鉴其浅色清爽与信息密度，但用靛紫品牌色建立差异。

### 第三方图表库（Recharts / visx）
- Cons：包体与运行时开销，样式定制受限。
- Rejected：走势图需求简单（二元概率单线），纯 SVG 更轻更可控。

## Consequences
- 设计 Token 落为 CSS 变量，深/浅主题切换低成本（当前仅实现浅色）。
- 严格执行对比度与[反 AI 套版红线](../06-ui-ux-design-system.md#8-反-ai-套版红线absolute-bans)：禁渐变文字、侧边色条、默认玻璃拟态、每段 eyebrow 等。
- 动效作为构建的一部分（关键愉悦时刻 + `prefers-reduced-motion` 降级），而非事后装饰。
- 数字用等宽字体 + `tabular-nums`（`.tnum`）保证对齐。
- 图标一律 SVG（Lucide 风格），不用 emoji 当图标。
