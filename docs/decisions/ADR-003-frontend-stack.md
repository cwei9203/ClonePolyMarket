# ADR-003: 前端采用 Tailwind CSS + shadcn/ui，深色终端风自有设计系统

## Status
Accepted

## Date
2026-07-09

## Context
UI 需要：数据密集（价格、概率、盈亏、排行）却仍愉悦；快速落地一致的设计系统；建立**区别于 Polymarket 的自有识别度**；规避 AI 套版审美。用户明确要求「完整考虑整体 UI 设计和交互」。

## Decision
- **样式**：Tailwind CSS（约束一致、快速）。
- **组件基座**：shadcn/ui（Radix + Tailwind，可访问、可组合、代码可控），在其上构建项目专用组件（`MarketCard`、`TradePanel`、`PriceChart` 等）。
- **设计系统**：三层 Token（primitive → semantic → component），OKLCH 色彩空间，**深色主题为默认**（场景：昏暗环境快速刷手机）。
- **品牌色**：电光青紫（区别于预测市场惯用蓝白），色彩策略为 Committed。
- **图表**：轻量图表库绘制赔率走势（如 Recharts / visx / 轻量 canvas）。
- 完整规范见 [06 设计系统](../06-ui-ux-design-system.md)。

## Alternatives Considered

### CSS-in-JS（styled-components / Emotion）
- Cons：运行时开销，与 RSC/Server Components 兼容性差。
- Rejected：Tailwind 零运行时、SSR 友好。

### 成品组件库（MUI / Ant Design）
- Pros：开箱即用。
- Cons：强品牌样式难定制、易「一眼看出用了什么库」、包体大。
- Rejected：需要自有识别度与精细控制，shadcn 的「拥有代码」模式更合适。

### 浅色 / 跟随 Polymarket 风格
- Cons：偏离自有识别；浅色不贴合昏暗使用场景；模仿易混淆归属。
- Rejected：深色终端风更契合场景与差异化。

## Consequences
- 设计 Token 落为 CSS 变量，主题切换（暗/亮）低成本。
- 严格执行对比度与[反 AI 套版红线](../06-ui-ux-design-system.md#8-反-ai-套版红线absolute-bans)：禁渐变文字、侧边色条、默认玻璃拟态、每段 eyebrow 等。
- 动效作为构建的一部分（关键愉悦时刻 + `prefers-reduced-motion` 降级），而非事后装饰。
- 数字用等宽字体 + `tabular-nums` 保证对齐。
