# Phase 1: CF Workers 骨架 - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

交付 CF Workers 后端骨架：D1 数据库 schema 完整可用、JWT 鉴权中间件保护受保护端点、7 个 REST 端点（/api/health, /api/auth/login, /api/profile, /api/records, /api/milestones/states, /api/diary）可接受请求并返回数据。CF KV namespace 和 Secrets 配置完成。

</domain>

<decisions>
## Implementation Decisions

### D1 Schema 设计
- **D-01:** 表字段命名使用 snake_case（SQL 标准，与 JS camelCase 通过 API 层转换）
- **D-02:** 6 张表：`users`（openid 映射）、`profiles`（孩子档案）、`records`（观察记录）、`milestone_states`（里程碑状态）、`diary_entries`（育儿日记）、`ai_usage`（AI 使用量计数）
- **D-03:** `records` 和 `diary_entries` 使用 `deleted_at` 软删除（保留历史数据，支持恢复）；其他表硬删除
- **D-04:** 所有业务表统一 `created_at` / `updated_at` 时间戳（ISO 8601 字符串）
- **D-05:** 所有业务表通过 `user_id` 外键关联 `users` 表
- **D-06:** `users` 表以微信 openid 为唯一标识，字段：`id`（自增主键）、`openid`（unique）、`created_at`、`updated_at`
- **D-07:** `profiles` 表字段映射 P0 IndexedDB `profile` store：`id`、`user_id`、`name`、`birth_date`、`gender`、`created_at`、`updated_at`
- **D-08:** `records` 表字段映射 P0 `records` store：`id`、`user_id`、`activity_id`、`init_type`、`focus_sec`、`emotion`、`note`、`created_at`、`updated_at`、`deleted_at`
- **D-09:** `milestone_states` 表：`id`、`user_id`、`milestone_id`、`status`（notStarted/emerging/achieved）、`achieved_at`、`created_at`、`updated_at`
- **D-10:** `diary_entries` 表：`id`、`user_id`、`content`、`image_urls`（JSON 数组字符串）、`created_at`、`updated_at`、`deleted_at`

### JWT 策略
- **D-11:** JWT secret 存 CF Secrets（`JWT_SECRET`），不硬编码
- **D-12:** JWT payload：`{ sub: user_id, openid: openid, iat, exp }`，有效期 7 天
- **D-13:** 不实现 refresh token — 过期后前端重新 wx.login 获取新 token（MVP 简化）
- **D-14:** JWT 中间件提取 `Authorization: Bearer <token>`，验证失败返回 401

### API 响应格式
- **D-15:** 统一 envelope 格式：`{ success: boolean, data: T | null, error: { code: string, message: string } | null }`
- **D-16:** 标准 HTTP status codes：200（成功）、201（创建）、400（请求错误）、401（未认证）、404（未找到）、429（限流）、500（服务器错误）
- **D-17:** 分页响应格式：`{ success: true, data: [], pagination: { page: number, pageSize: number, total: number } }`
- **D-18:** 错误 code 使用大写下划线风格：`AUTH_INVALID_TOKEN`、`AUTH_EXPIRED`、`RECORD_NOT_FOUND`、`RATE_LIMIT_EXCEEDED`

### 本地开发与测试
- **D-19:** 使用真实微信 AppID + AppSecret 测试完整登录流程，不 mock wx.login
- **D-20:** 微信 AppSecret 存 CF Secrets（`WX_APP_SECRET`），AppID 存环境变量（`WX_APP_ID`）
- **D-21:** 本地开发使用 `wrangler dev --local`，D1 数据库使用本地模式
- **D-22:** CF Workers 项目放在 `/worker/` 目录下

### Claude's Discretion
- API 路由组织方式（文件结构、handler 拆分）
- 错误日志策略（console.log 级别与格式）
- D1 迁移文件命名与版本管理
- CORS 配置细节（允许的 origin）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 需求规范
- `起起成长-需求说明书-v1.8.md` — 完整功能规范、数据结构定义、技术栈
- `.planning/REQUIREMENTS.md` — P1 需求清单（BACK-01~05, AUTH-01~04, DATA-01~07）
- `.planning/ROADMAP.md` — Phase 1 scope、success criteria、deliverables

### P0 数据结构（D1 schema 参考）
- `js/db.js` — IndexedDB 封装，8 个 store 结构定义（D1 表结构需对齐）
- `js/data/activities-complete.js` — 143 条活动数据（前端静态文件，不入 D1）
- `js/data/milestones.js` — 216 条里程碑数据（前端静态文件，不入 D1）

### P0 业务逻辑（API 行为参考）
- `js/rules.js` — F 规则 / 推荐逻辑
- `js/ui/today.js` — 今日记录的 CRUD 行为参考
- `js/ui/diary.js` — 育儿日记 CRUD 行为参考

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `js/db.js`：IndexedDB store 定义可直接映射为 D1 schema 字段
- `js/data/activities-complete.js` 和 `js/data/milestones.js`：静态数据，小程序直接复用，不需后端 API

### Established Patterns
- P0 使用纯 JS + IndexedDB，无框架；P1 后端是全新代码，无需继承前端模式
- 数据字段命名 P0 用 camelCase（JS 风格），D1 用 snake_case，API 层负责转换

### Integration Points
- CF Workers `/api/auth/login` 是小程序（Phase 2）的入口
- 所有 `/api/*` 端点将被 Phase 2 小程序通过 `uni.request` 调用

</code_context>

<specifics>
## Specific Ideas

- 微信登录必须走真实 AppID 验证，不接受 mock — 确保 code-to-openid 链路在开发阶段就可用
- `ai_usage` 表是为 Phase 4 AI 限流预留的，Phase 1 只建表不实现计数逻辑

</specifics>

<deferred>
## Deferred Ideas

- AI 端点实现（Phase 4）
- 小程序前端（Phase 2/3）
- 图片上传到 CF R2（Phase 3 育儿日记图片）
- 订阅鉴权系统（Out of scope for P1）

</deferred>

---

*Phase: 01-cf-workers-skeleton*
*Context gathered: 2026-04-22*
