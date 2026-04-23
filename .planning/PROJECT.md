# 起起成长 App — P1 milestone

## What This Is

面向新手父母的蒙台梭利育儿辅助 App，帮助父母观察、记录、理解 0-6 岁孩子的成长。P0 已完整交付（纯前端 PWA，规则驱动）。P1 目标：引入 AI 功能 + 发布微信小程序版本。

## Core Value

父母填入孩子月龄和观察记录，AI 给出个性化的活动建议与发展解读，让新手父母"会观察、懂孩子"。

## Requirements

### Validated

- ✓ 活动库（0-72月，143条）— P0
- ✓ 里程碑库（0-72月，216条，10维度）— P0
- ✓ 今日推荐（1主2备，F规则驱动）— P0
- ✓ 观察记录（4字段 + observeAnchor 逐问填答）— P0
- ✓ 里程碑对照（5维度，状态流转）— P0
- ✓ 周/月复盘 — P0
- ✓ 育儿日记（M_Diary）— P0
- ✓ 自定义活动库（M_CustomActivity）— P0
- ✓ PWA 离线支持（Service Worker, CACHE_NAME qiqi-v5）— P0

### Active

- [ ] CF Workers 后端骨架（D1 schema + auth + CRUD API）
- [ ] 微信登录鉴权（wx.login → openid → JWT）
- [ ] 用户 & 孩子档案后端持久化
- [ ] 观察记录、里程碑状态、育儿日记后端持久化
- [ ] 微信小程序（uni-app）— 完整 P0 功能移植
- [ ] AI 周方案生成（免费 + 订阅用户）
- [ ] AI 里程碑分析（免费 + 订阅用户）
- [ ] AI 对话问答（仅订阅用户）
- [ ] BYOK 模式（免费用户自带 API key）
- [ ] 每日 AI 限流（free: 10次/天）

### Out of Scope

- 订阅鉴权 / 付款系统 — P1-e 延后迭代，先跑通技术链路
- PWA 后端持久化 — P1 仅小程序走云端，PWA 继续 IndexedDB
- 多照料者支持 — P2
- AI 兴趣报告 — P2
- 多端同步（PWA ↔ 小程序数据互通）— P2

## Context

**现有代码状态（P0 完成）：**
- `index.html` — 主入口，含所有 overlay 骨架
- `js/app.js` — 应用入口，事件总线
- `js/db.js` — IndexedDB 封装（DB_VERSION 2，8个store）
- `js/data/activities-complete.js` — 143条活动（可直接复用到小程序）
- `js/data/milestones.js` — 216条里程碑（可直接复用到小程序）
- `js/ui/` — 各功能模块（today, record, milestones, growth-records, diary, etc.）
- `js/rules.js` — F规则/推荐逻辑（可直接复用到小程序）
- `css/app.css` — 样式
- `sw.js` — Service Worker

**技术栈（P1 新增）：**
- CF Workers — 后端运行时
- CF D1 — SQLite 数据库（用户/档案/记录/里程碑/日记）
- CF KV — AI 使用量限流计数
- CF R2 — 图片存储（日记图片）
- CF Secrets — `OPENAI_API_KEY`（Lin 的 key，不暴露）
- uni-app Vue 3 + Pinia — 小程序框架
- OpenAI-compatible API — AI 功能统一接口

## Constraints

- **平台**：小程序仅发布微信，不走多端编译（保持简单）
- **数据隔离**：PWA 继续用 IndexedDB，不迁移历史数据
- **AI 成本控制**：免费用户 10次/天限流；Lin 的 key 仅供订阅用户（P1 先跳过鉴权）
- **技术风险**：微信小程序 SSE 流式响应兼容性需验证

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 单一 CF Workers 代理（方案A） | 架构统一，key 安全存 Secrets，未来加鉴权只改后端 | — Pending |
| uni-app Vue 3 | 一套代码编译微信小程序，Vue 语法可读性好 | — Pending |
| CF D1 而非独立数据库 | 与 CF Workers 同平台零延迟，免费额度够用 | — Pending |
| 活动/里程碑数据留在前端 JS 文件 | 143+216条静态数据无需后端，直接复用 P0 | — Pending |
| OpenAI-compatible 格式统一端点 | system prompt 区分功能，前端只需一个 base URL | — Pending |

---
*Last updated: 2026-04-22 after P1 brainstorming + design confirmation*
