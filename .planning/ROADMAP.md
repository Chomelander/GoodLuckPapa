# Roadmap: 起起成长 P1

**Created:** 2026-04-22
**Milestone:** P1 — CF Workers 后端 + 微信小程序
**Phases:** 4 | **Requirements:** 31 | **Coverage:** 100% ✓

## Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | CF Workers 骨架 | 后端 API 可用，D1 数据可读写，JWT 鉴权通过 | BACK-01~05, AUTH-01~04, DATA-01~07 | 5 |
| 2 | 小程序核心主路径 | 用户可登录、查看推荐、完成观察记录，数据写入 D1 | MINI-01~04, MINI-12 | 4 |
| 3 | 小程序完整功能 | 全部 P0 功能在小程序可用，里程碑/复盘/日记完整 | MINI-05~11 | 5 |
| 4 | AI 功能接入 | 三项 AI 功能可用，限流/权限控制生效 | AI-01~07 | 4 |

---

## Phase 1: CF Workers 骨架

**Goal:** 后端 API 骨架完成，JWT 鉴权通过，D1 数据可读写

**Requirements:** BACK-01, BACK-02, BACK-03, BACK-04, BACK-05, AUTH-01, AUTH-02, AUTH-03, AUTH-04, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07

**Plans:** 6 plans

Plans:
- [ ] 01-01-PLAN.md — Hono 项目脚手架 + 类型定义 + route stubs + /api/health 实现
- [ ] 01-02-PLAN.md — D1 schema 迁移文件（6张表）
- [ ] 01-03-PLAN.md — vitest 测试基础设施 + health/auth 401 测试
- [ ] 01-04-PLAN.md — POST /api/auth/login 微信登录 + JWT 签发
- [ ] 01-05-PLAN.md — /api/profile + /api/records CRUD（含分页、软删除）
- [ ] 01-06-PLAN.md — /api/milestones/states upsert + /api/diary CRUD（含软删除）

**Deliverables:**
- CF Workers 项目（`/worker/`），wrangler.toml 配置完整
- D1 database `qiqi-db`，schema 迁移文件可执行
- 7个 REST 端点可用（/api/health, /api/auth/login, /api/profile, /api/records, /api/milestones/states, /api/diary）
- JWT middleware 保护受保护端点
- CF KV namespace `USAGE` 创建
- CF Secrets `OPENAI_API_KEY` 配置文档

**Success Criteria:**
1. `GET /api/health` 返回 200 + `{"status":"ok"}`
2. POST wx code → 收到合法 JWT token
3. 携带 JWT 创建孩子档案 → D1 可查到记录
4. 携带 JWT 写入观察记录 → 读取时数据一致
5. 不带 JWT 访问受保护端点 → 返回 401

**UI hint:** no

---

## Phase 2: 小程序核心主路径

**Goal:** 用户可完成"登录 → 查看今日推荐 → 完成观察记录"黄金路径，数据持久化到 D1

**Requirements:** MINI-01, MINI-02, MINI-03, MINI-04, MINI-12

**Deliverables:**
- uni-app 项目初始化（`/miniprogram/`），可在微信开发者工具编译运行
- 微信登录流程完整（wx.login → CF Workers → JWT → Pinia store）
- 「今日」Tab：月龄计算 + 活动推荐（复用 activities-complete.js + rules.js）
- 观察记录 overlay：4字段表单 + observeAnchor 逐问填答
- 每次记录写入 CF D1，断网时本地缓存待同步

**Success Criteria:**
1. 首次打开完成微信授权登录，不需手动输入任何信息
2. 「今日」Tab 根据宝宝月龄展示正确年龄段活动推荐
3. 完成一次观察记录 → CF D1 `records` 表有对应行
4. 重新启动小程序后历史记录仍可见（来自 D1）

**UI hint:** yes

---

## Phase 3: 小程序完整功能

**Goal:** 全部 P0 功能在小程序可用：里程碑、成长时间线、复盘、育儿日记、设置

**Requirements:** MINI-05, MINI-06, MINI-07, MINI-08, MINI-09, MINI-10, MINI-11

**Deliverables:**
- 「成长」Tab：里程碑对照（10维度，状态流转）
- 里程碑状态标记 → 写入 D1
- 「成长」Tab：活动记录时间线（年/周折叠）
- 育儿日记：添加/查看/删除，图片上传到 CF R2
- 「复盘」Tab：周复盘 5问 + 月度复盘蒙氏10维度
- 设置页：孩子档案编辑 + BYOK key 填写 + 引导强度切换

**Success Criteria:**
1. 里程碑页面正确展示10维度，标记后状态持久化
2. 成长时间线展示历史记录，与 D1 数据一致
3. 育儿日记可添加图片，重新打开后仍可见
4. 周复盘5问完成后展示下周关注方向
5. 设置页 BYOK key 填写后下次请求使用该 key

**UI hint:** yes

---

## Phase 4: AI 功能接入

**Goal:** 三项 AI 功能可用，限流和权限控制生效，流式渲染正常

**Requirements:** AI-01, AI-02, AI-03, AI-04, AI-05, AI-06, AI-07

**Deliverables:**
- CF Workers `/api/ai/chat` 端点：key 选择逻辑（BYOK vs Lin's）
- CF KV 限流：免费用户 10次/天，超限 429
- 功能权限：free 用户请求 qa → 403 + 提示
- AI 周方案生成：system prompt 构建 + 小程序 UI 展示
- AI 里程碑分析：system prompt 构建 + 小程序 UI 展示
- AI 对话问答：多轮对话 + 流式渲染（SSE 或 chunked）

**Success Criteria:**
1. BYOK 模式：填入有效 key → AI 周方案生成返回内容
2. 免费用户连续请求 11次 → 第11次返回 429
3. 免费用户请求 AI 问答 → 返回 403 + 提示「订阅后可用」
4. AI 回复逐 token 流式渲染，不等全量

**UI hint:** yes

---

## Dependencies

```
Phase 1 (CF Workers) → Phase 2 (小程序主路径) → Phase 3 (完整功能) → Phase 4 (AI)
```

Phase 2 强依赖 Phase 1 的认证和数据 API 可用。
Phase 3 依赖 Phase 2 的基础架构。
Phase 4 的 CF Workers AI 端点可以与 Phase 2/3 并行开发，但集成测试需要小程序就绪。

---
*Roadmap created: 2026-04-22*
*Last updated: 2026-04-22 — added Plan list for Phase 1 (6 plans), Plan 06 covers DATA-05/06/07*
