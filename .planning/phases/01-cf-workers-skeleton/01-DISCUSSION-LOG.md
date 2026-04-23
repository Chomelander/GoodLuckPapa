# Phase 1: CF Workers 骨架 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 01-cf-workers-skeleton
**Areas discussed:** D1 Schema 设计, JWT 策略, API 响应格式规范, 本地开发与测试策略

---

## D1 Schema 设计

| Option | Description | Selected |
|--------|-------------|----------|
| Claude's Discretion | 按主流成熟方案选定 | ✓ |

**User's choice:** "按照你的方案定，选择主流成熟方案即可"
**Notes:** 用户将 schema 设计完全委托给 Claude。选定：snake_case 命名、6 表结构、软删除（records/diary_entries）、统一时间戳。

---

## JWT 策略

| Option | Description | Selected |
|--------|-------------|----------|
| Claude's Discretion | 按主流成熟方案选定 | ✓ |

**User's choice:** "按照你的方案定，选择主流成熟方案即可"
**Notes:** 选定：JWT_SECRET 存 CF Secrets、payload 含 sub/openid/iat/exp、7 天有效期、不做 refresh token。

---

## API 响应格式规范

| Option | Description | Selected |
|--------|-------------|----------|
| Claude's Discretion | 按主流成熟方案选定 | ✓ |

**User's choice:** "按照你的方案定，选择主流成熟方案即可"
**Notes:** 选定：统一 envelope { success, data, error }、标准 HTTP status codes、分页 { data, pagination }。

---

## 本地开发与测试策略

| Option | Description | Selected |
|--------|-------------|----------|
| 真实微信 AppID 测试 | 使用真实 AppID + AppSecret | ✓ |
| Mock wx.login | 本地用 mock 替代真实登录 | |

**User's choice:** "使用真实微信测试"
**Notes:** 不接受 mock，开发阶段即使用真实微信 AppID 验证完整链路。AppSecret 存 CF Secrets。

---

## Claude's Discretion

- API 路由组织方式（文件结构、handler 拆分）
- 错误日志策略
- D1 迁移文件命名与版本管理
- CORS 配置细节

## Deferred Ideas

- AI 端点实现（Phase 4）
- 图片上传到 CF R2（Phase 3）
- 订阅鉴权系统（Out of scope）
