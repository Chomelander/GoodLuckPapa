# Phase 1: CF Workers 骨架 - Research

**Researched:** 2026-04-22
**Domain:** Cloudflare Workers + D1 + Hono + JWT + WeChat Login
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** 表字段命名使用 snake_case（SQL 标准，与 JS camelCase 通过 API 层转换）
- **D-02:** 6 张表：`users`、`profiles`、`records`、`milestone_states`、`diary_entries`、`ai_usage`
- **D-03:** `records` 和 `diary_entries` 使用 `deleted_at` 软删除；其他表硬删除
- **D-04:** 所有业务表统一 `created_at` / `updated_at` 时间戳（ISO 8601 字符串）
- **D-05:** 所有业务表通过 `user_id` 外键关联 `users` 表
- **D-06:** `users` 表以微信 openid 为唯一标识：`id`（自增主键）、`openid`（unique）、`created_at`、`updated_at`
- **D-07:** `profiles` 表：`id`、`user_id`、`name`、`birth_date`、`gender`、`created_at`、`updated_at`
- **D-08:** `records` 表：`id`、`user_id`、`activity_id`、`init_type`、`focus_sec`、`emotion`、`note`、`created_at`、`updated_at`、`deleted_at`
- **D-09:** `milestone_states` 表：`id`、`user_id`、`milestone_id`、`status`（notStarted/emerging/achieved）、`achieved_at`、`created_at`、`updated_at`
- **D-10:** `diary_entries` 表：`id`、`user_id`、`content`、`image_urls`（JSON 数组字符串）、`created_at`、`updated_at`、`deleted_at`
- **D-11:** JWT secret 存 CF Secrets（`JWT_SECRET`），不硬编码
- **D-12:** JWT payload：`{ sub: user_id, openid: openid, iat, exp }`，有效期 7 天
- **D-13:** 不实现 refresh token — 过期后前端重新 wx.login 获取新 token
- **D-14:** JWT 中间件提取 `Authorization: Bearer <token>`，验证失败返回 401
- **D-15:** 统一 envelope 格式：`{ success: boolean, data: T | null, error: { code: string, message: string } | null }`
- **D-16:** 标准 HTTP status codes：200/201/400/401/404/429/500
- **D-17:** 分页响应格式：`{ success: true, data: [], pagination: { page, pageSize, total } }`
- **D-18:** 错误 code 大写下划线风格：`AUTH_INVALID_TOKEN`、`AUTH_EXPIRED` 等
- **D-19:** 使用真实微信 AppID + AppSecret 测试，不 mock wx.login
- **D-20:** 微信 AppSecret 存 CF Secrets（`WX_APP_SECRET`），AppID 存环境变量（`WX_APP_ID`）
- **D-21:** 本地开发使用 `wrangler dev --local`，D1 数据库使用本地模式
- **D-22:** CF Workers 项目放在 `/worker/` 目录下

### Claude's Discretion

- API 路由组织方式（文件结构、handler 拆分）
- 错误日志策略（console.log 级别与格式）
- D1 迁移文件命名与版本管理
- CORS 配置细节（允许的 origin）

### Deferred Ideas (OUT OF SCOPE)

- AI 端点实现（Phase 4）
- 小程序前端（Phase 2/3）
- 图片上传到 CF R2（Phase 3）
- 订阅鉴权系统（Out of scope for P1）
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BACK-01 | CF Workers 项目初始化，可接收 HTTPS 请求并返回响应 | Hono + wrangler init 模式，`npm create hono@latest` 选 cloudflare-workers 模板 |
| BACK-02 | CF D1 数据库 schema 创建（6 张表） | `wrangler d1 create` + migrations apply，D1 SQL 语法已验证 |
| BACK-03 | `/api/health` 健康检查端点可用 | Hono 路由直接实现，返回 `{ success: true, data: { status: "ok" } }` |
| BACK-04 | CF Secrets 存储 `OPENAI_API_KEY`，不暴露到前端 | `wrangler secret put OPENAI_API_KEY`，仅建表占位，不实现逻辑 |
| BACK-05 | CF KV namespace 创建，用于 AI 使用量计数 | `wrangler kv:namespace create "USAGE"`，wrangler.toml 绑定 |
| AUTH-01 | 用户可通过微信 wx.login() 获取 code | 前端（Phase 2）；本 Phase 实现后端接收 code 的端点 |
| AUTH-02 | CF Workers 用 code 换取 openid，生成 JWT（7天有效） | `jscode2session` API + Hono `sign()` 函数，7天 = 604800秒 exp |
| AUTH-03 | 小程序端 JWT 持久化存储 | 前端（Phase 2）；本 Phase 后端返回 token 即完成 |
| AUTH-04 | 所有受保护端点验证 JWT，无效时返回 401 | Hono jwt 中间件 + 显式 `alg: 'HS256'`（CVE-2026-22817 修复） |
| DATA-01 | 用户可创建/读取孩子档案 | POST /api/profile + GET /api/profile，D1 prepare().bind().run() |
| DATA-02 | 用户可创建观察记录 | POST /api/records，5字段映射到 records 表 |
| DATA-03 | 用户可查询历史记录（按日期分页） | GET /api/records?page=&pageSize=，SQL LIMIT/OFFSET + COUNT |
| DATA-04 | 用户可编辑/删除观察记录 | PUT /api/records/:id + DELETE（软删除 deleted_at） |
| DATA-05 | 用户可读写里程碑状态 | GET/PUT /api/milestones/states，upsert 模式（INSERT OR REPLACE） |
| DATA-06 | 用户可创建/查询育儿日记 | POST/GET /api/diary，image_urls 存 JSON 字符串 |
| DATA-07 | 用户可删除育儿日记条目 | DELETE /api/diary/:id（软删除 deleted_at） |
</phase_requirements>

---

## Summary

Phase 1 交付 CF Workers 后端骨架。技术路线已非常清晰：Hono 框架运行在 CF Workers 上，D1 作为关系数据库，JWT（HS256）实现无状态鉴权，微信 jscode2session 完成用户身份绑定。本研究验证了所有关键 API、版本、以及一个需要特别注意的安全问题。

核心发现：Hono 4.11.4 之前存在 JWT 算法混淆漏洞（CVE-2026-22817）。当前最新版 4.12.14 已修复，但必须显式传入 `alg: 'HS256'`，不能依赖默认值。当前 Hono 版本 4.12.14 和 Wrangler 版本 4.84.1 均已验证。

本地开发流程：`wrangler dev --local` 启动后，D1 数据自动持久化在本地 `.wrangler/state/` 目录，迁移通过 `wrangler d1 migrations apply --local` 应用。Secrets 在本地用 `.dev.vars` 文件模拟，不走 `wrangler secret put`。

**Primary recommendation:** 使用 `npm create hono@latest worker` 初始化项目（选 cloudflare-workers 模板），在 `/worker/` 目录内开发，按路由模块拆分 handler 文件。

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTTP 路由 + 中间件 | API / Backend (CF Workers) | — | Hono 运行在 Workers edge runtime |
| JWT 签发 + 验证 | API / Backend (CF Workers) | — | secret 存在服务端 CF Secrets，不能泄露到客户端 |
| 微信 code → openid | API / Backend (CF Workers) | — | 需要 AppSecret，只能在服务端调用 |
| D1 数据读写 | Database / Storage (D1) | API / Backend | Workers 通过 binding 直接访问，无连接池 |
| KV 使用量计数 | Database / Storage (KV) | API / Backend | Phase 1 只建 namespace，Phase 4 实现计数 |
| CORS 策略 | API / Backend (CF Workers) | — | Hono cors 中间件配置 origin |
| Secrets 管理 | API / Backend (CF Workers) | — | CF Secrets + .dev.vars 本地模拟 |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| hono | 4.12.14 | HTTP 框架、路由、中间件 | CF Workers 官方推荐，内置 JWT、CORS、bearer-auth |
| wrangler | 4.84.1 | CLI 工具、本地 dev、D1 管理、deploy | Cloudflare 官方工具链，无替代 |
| TypeScript | 5.x（wrangler 模板自带） | 类型安全 | Workers 标准开发语言 |

[VERIFIED: npm registry — 2026-04-22]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @cloudflare/workers-types | latest（wrangler 模板自带） | D1Database、KVNamespace 等 CF 类型定义 | TypeScript 开发必须 |
| @cloudflare/vitest-pool-workers | latest | Workers 运行时内的 Vitest 集成测试 | 需要测试 D1/KV binding 的端点时 |

[VERIFIED: npm registry]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hono jwt helper | jose 6.2.2 | jose 更通用，但 hono/jwt 已内置且与中间件无缝集成 — 用 Hono 内置 |
| Hono (full) | itty-router | itty-router 更轻，但无内置 JWT/CORS 中间件 |
| wrangler d1 migrations | 手写 execute --file | migrations 有版本追踪，是最佳实践 |

### Installation

```bash
# 在 repo 根目录
npm create hono@latest worker
# 选择 cloudflare-workers 模板

cd worker
npm install

# 安装 CF 类型（通常模板已包含）
npm install -D @cloudflare/workers-types
```

---

## Architecture Patterns

### System Architecture Diagram

```
微信小程序 (Phase 2)
    │
    │ wx.login() → code
    ▼
CF Workers Edge (Hono)
    │
    ├─── POST /api/auth/login
    │       │
    │       │ fetch https://api.weixin.qq.com/sns/jscode2session
    │       ▼
    │   微信 API ──── 返回 openid ────► D1: users (upsert)
    │       │                           │
    │       │◄── user_id ───────────────┘
    │       │
    │       └── sign JWT (HS256, 7d) ──► 返回 { token }
    │
    ├─── JWT Middleware (Authorization: Bearer <token>)
    │       │
    │       ├── 验证失败 → 401
    │       └── 验证成功 → c.set('userId', sub)
    │
    ├─── GET  /api/health          ──► { success: true, data: { status: "ok" } }
    ├─── GET/POST /api/profile     ──► D1: profiles
    ├─── GET/POST/PUT/DELETE /api/records ──► D1: records (软删除)
    ├─── GET/PUT /api/milestones/states   ──► D1: milestone_states
    └─── GET/POST/DELETE /api/diary       ──► D1: diary_entries (软删除)

CF D1 (SQLite)              CF KV (USAGE)       CF Secrets
├── users                   └── [Phase 4]       ├── JWT_SECRET
├── profiles                                    ├── WX_APP_SECRET
├── records                                     └── OPENAI_API_KEY
├── milestone_states
├── diary_entries
└── ai_usage (建表，Phase 4 实现)
```

### Recommended Project Structure

```
worker/
├── wrangler.toml            # CF Workers 配置（binding、env var、compatibility_date）
├── .dev.vars                # 本地 Secrets（不提交 git）
├── package.json
├── tsconfig.json
├── migrations/
│   └── 0001_init.sql        # D1 schema 建表语句
├── src/
│   ├── index.ts             # Hono app 入口 + 路由挂载
│   ├── types.ts             # Bindings / Variables 类型定义
│   ├── middleware/
│   │   └── auth.ts          # JWT 验证中间件（读 c.env.JWT_SECRET）
│   ├── routes/
│   │   ├── health.ts        # GET /api/health
│   │   ├── auth.ts          # POST /api/auth/login（微信 code → JWT）
│   │   ├── profile.ts       # GET/POST /api/profile
│   │   ├── records.ts       # CRUD /api/records
│   │   ├── milestones.ts    # GET/PUT /api/milestones/states
│   │   └── diary.ts         # CRUD /api/diary
│   └── lib/
│       └── db.ts            # D1 查询工具函数（snake_case → camelCase 转换）
└── test/
    ├── vitest.config.ts
    └── routes/
        ├── health.test.ts
        └── auth.test.ts
```

### Pattern 1: Hono App with CF Bindings

```typescript
// Source: https://hono.dev/docs/getting-started/cloudflare-workers
// src/types.ts
export type Bindings = {
  DB: D1Database
  USAGE: KVNamespace
  JWT_SECRET: string
  WX_APP_SECRET: string
  WX_APP_ID: string
}

export type Variables = {
  userId: number
  openid: string
}

// src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings, Variables } from './types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', async (c, next) => {
  const corsMiddleware = cors({ origin: c.env.CORS_ORIGIN ?? '*' })
  return corsMiddleware(c, next)
})

// 路由挂载
app.route('/api', apiRoutes)

export default app
```

### Pattern 2: JWT Middleware（必须显式指定 alg）

```typescript
// Source: https://hono.dev/docs/middleware/builtin/jwt
// CVE-2026-22817 修复：必须显式传 alg，不能依赖默认值
// src/middleware/auth.ts
import { jwt } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'
import type { Bindings, Variables } from '../types'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Bindings
  Variables: Variables
}> = (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256', // REQUIRED: explicit alg prevents CVE-2026-22817
  })
  return jwtMiddleware(c, next)
}
```

### Pattern 3: JWT 签发（微信登录）

```typescript
// Source: https://hono.dev/docs/helpers/jwt
// routes/auth.ts
import { sign } from 'hono/jwt'

// POST /api/auth/login
app.post('/auth/login', async (c) => {
  const { code } = await c.req.json<{ code: string }>()

  // 1. code → openid
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${c.env.WX_APP_ID}&secret=${c.env.WX_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
  const wxRes = await fetch(url)
  const wxData = await wxRes.json<{ openid?: string; errcode?: number; errmsg?: string }>()

  if (!wxData.openid) {
    return c.json({ success: false, data: null, error: { code: 'AUTH_WX_FAILED', message: wxData.errmsg ?? 'WeChat login failed' } }, 400)
  }

  // 2. upsert user
  const user = await upsertUser(c.env.DB, wxData.openid)

  // 3. 签发 JWT（7天 = 604800秒）
  const payload = {
    sub: user.id,
    openid: wxData.openid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800,
  }
  const token = await sign(payload, c.env.JWT_SECRET)

  return c.json({ success: true, data: { token }, error: null }, 200)
})
```

### Pattern 4: D1 查询 + snake_case → camelCase 转换

```typescript
// Source: https://developers.cloudflare.com/d1/worker-api/
// lib/db.ts
export function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ])
  )
}

// 使用示例
const profile = await c.env.DB
  .prepare('SELECT * FROM profiles WHERE user_id = ?1 LIMIT 1')
  .bind(userId)
  .first<Record<string, unknown>>()

return c.json({ success: true, data: profile ? toCamel(profile) : null, error: null })
```

### Pattern 5: wrangler.toml 完整配置

```toml
# Source: https://developers.cloudflare.com/workers/wrangler/configuration
name = "qiqi-worker"
main = "src/index.ts"
compatibility_date = "2026-04-22"

[vars]
WX_APP_ID = "wx_your_app_id_here"

[[d1_databases]]
binding = "DB"
database_name = "qiqi-db"
database_id = "placeholder-run-wrangler-d1-create-to-fill"
migrations_dir = "migrations"

[[kv_namespaces]]
binding = "USAGE"
id = "placeholder-run-wrangler-kv-namespace-create-to-fill"
```

### Pattern 6: .dev.vars（本地 Secrets 模拟）

```bash
# worker/.dev.vars — 不提交 git（加入 .gitignore）
JWT_SECRET=dev-jwt-secret-at-least-32-chars-long
WX_APP_SECRET=your_real_wechat_app_secret
OPENAI_API_KEY=sk-placeholder
CORS_ORIGIN=http://localhost:3000
```

### Anti-Patterns to Avoid

- **不要在 jwt() 中省略 alg 参数:** 版本 < 4.11.4 时使用 token header 中的 alg，存在 CVE-2026-22817 算法混淆攻击。始终显式写 `alg: 'HS256'`
- **不要在 vars 中存 Secret:** `wrangler.toml` 的 `[vars]` 不加密，AppSecret 和 JWT_SECRET 必须走 `wrangler secret put` 或 `.dev.vars`
- **不要在 D1 查询中拼接字符串:** 必须用 `.prepare().bind()` 参数化查询，防止 SQL 注入
- **不要假设 D1 .first() 不返回 null:** 查询结果可能为空，需要 null 检查后返回 404
- **不要在 migrations 中 DROP 已有数据:** migration 文件只用于 CREATE TABLE IF NOT EXISTS，不破坏现有数据

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT 签发/验证 | 自己实现 HMAC-SHA256 + base64 | `hono/jwt` sign/verify | WebCrypto API 细节复杂，已有 CVE 案例 |
| JWT 中间件 | 手写 Authorization header 解析 | `hono/jwt` middleware | 内置 Bearer 解析 + 验证逻辑 |
| CORS 处理 | 手写 Access-Control-* headers | `hono/cors` | preflight OPTIONS 处理有细节陷阱 |
| 路由分发 | 手写 URL 匹配 | Hono 路由 | 路径参数、方法匹配已完善 |
| HTTP 状态码响应 | 手写 Response 对象 | `c.json(body, status)` | Hono context helper 更简洁 |
| SQL 迁移版本管理 | 手动 execute --file | `wrangler d1 migrations apply` | 自动追踪已应用迁移，支持回滚 |

**Key insight:** CF Workers 没有 npm 生态的 ORM 层（如 Drizzle 在 Workers 可用但增加复杂度），Phase 1 直接用 D1 的 prepare/bind/run 即可，代码量很小。

---

## Common Pitfalls

### Pitfall 1: 本地 D1 数据状态遗留

**What goes wrong:** `wrangler dev --local` 默认持久化 D1 数据到 `.wrangler/state/`，重启后 schema 变更与旧数据冲突，出现 "table already exists" 或列名不匹配错误。
**Why it happens:** Wrangler v3+ 默认持久化，而不是每次清空。
**How to avoid:** 开发阶段 schema 变更时，先 `DROP TABLE` 再重建，或在 migration SQL 开头加 `DROP TABLE IF EXISTS`（仅本地开发用）。生产迁移不能 DROP。
**Warning signs:** `UNIQUE constraint failed` 或列找不到的错误，即使刚重启。

### Pitfall 2: JWT alg 未显式指定

**What goes wrong:** Hono 4.12.14 已修复，但如果省略 `alg` 选项，行为依赖框架版本，且未来升级可能引入回归。
**Why it happens:** CVE-2026-22817 — 旧版本从 token header 读取算法，攻击者可用公钥伪造 HS256 token。
**How to avoid:** 始终写 `jwt({ secret: c.env.JWT_SECRET, alg: 'HS256' })`。
**Warning signs:** JWT 验证通过但 payload 数据异常。

### Pitfall 3: .dev.vars 缺失导致 c.env.X 为 undefined

**What goes wrong:** 本地开发时，`c.env.JWT_SECRET` 是 `undefined`，`sign()` 抛出错误或产生无效 token。
**Why it happens:** CF Secrets 只在 `wrangler deploy` 后绑定到生产环境；本地模拟必须用 `.dev.vars` 文件。
**How to avoid:** 在 `/worker/` 目录创建 `.dev.vars`，将其加入 `.gitignore`；启动前检查 env 变量是否存在。
**Warning signs:** `TypeError: Cannot read properties of undefined (reading 'length')` 在 sign() 内部。

### Pitfall 4: 微信 jscode2session 在本地测试的网络问题

**What goes wrong:** 本地 `wrangler dev --local` 调用微信 API 需要能访问 `api.weixin.qq.com`，如果网络受限会超时。
**Why it happens:** 真实 AppSecret 测试（D-19）要求真实网络调用，无法 mock。
**How to avoid:** 本地开发确保网络畅通，或用 `wrangler dev --remote` 借助 CF 边缘网络（但需要已部署的 Worker）。
**Warning signs:** `fetch failed` 或 `network error` 在 /api/auth/login 调用时。

### Pitfall 5: D1 query 参数占位符格式

**What goes wrong:** D1 使用 `?1`、`?2` 等带数字的占位符（SQLite 风格），而不是 PostgreSQL 的 `$1`、`$2`。
**Why it happens:** D1 基于 SQLite，但与常见 ORM 期望的 `?` 或 `$n` 格式略有差异。
**How to avoid:** 统一使用 `.prepare('... WHERE id = ?1').bind(id)` 格式。
**Warning signs:** 绑定参数数量与占位符不匹配的运行时错误。

---

## Code Examples

### D1 Schema Migration 文件

```sql
-- Source: https://developers.cloudflare.com/d1/get-started/
-- migrations/0001_init.sql

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openid TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  activity_id TEXT NOT NULL,
  init_type TEXT NOT NULL CHECK(init_type IN ('child', 'adult')),
  focus_sec INTEGER NOT NULL DEFAULT 0,
  emotion TEXT NOT NULL CHECK(emotion IN ('positive', 'neutral', 'negative')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS milestone_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  milestone_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'notStarted' CHECK(status IN ('notStarted', 'emerging', 'achieved')),
  achieved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, milestone_id)
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  image_urls TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS ai_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, date)
);
```

### 统一响应 helper

```typescript
// Source: 基于 D-15/D-16 决策设计
// src/lib/response.ts
import type { Context } from 'hono'

export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data, error: null }, status)
}

export function fail(c: Context, status: 400 | 401 | 404 | 429 | 500, code: string, message: string) {
  return c.json({ success: false, data: null, error: { code, message } }, status)
}
```

### upsert user（微信登录后建立用户）

```typescript
// Source: https://developers.cloudflare.com/d1/worker-api/
async function upsertUser(db: D1Database, openid: string): Promise<{ id: number }> {
  // INSERT OR IGNORE，再 SELECT
  await db
    .prepare('INSERT OR IGNORE INTO users (openid) VALUES (?1)')
    .bind(openid)
    .run()
  const user = await db
    .prepare('SELECT id FROM users WHERE openid = ?1')
    .bind(openid)
    .first<{ id: number }>()
  if (!user) throw new Error('Failed to upsert user')
  return user
}
```

### Vitest 单元测试（Workers 运行时）

```typescript
// Source: https://developers.cloudflare.com/workers/testing/vitest-integration/
// test/routes/health.test.ts
import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { describe, it, expect } from 'vitest'
import worker from '../../src/index'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const req = new Request('http://localhost/api/health')
    const ctx = createExecutionContext()
    const res = await worker.fetch(req, env, ctx)
    await waitOnExecutionContext(ctx)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ success: true, data: { status: 'ok' } })
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Wrangler v2 — 本地不持久化 | Wrangler v3+ — 默认持久化 `.wrangler/state/` | Wrangler v3.0 | 本地开发数据跨重启保留，迁移需注意 |
| `wrangler.json` | `wrangler.toml` 或 `wrangler.jsonc` | 近期 | 两者均可，TOML 更通用 |
| hono jwt 不验证 alg | hono >= 4.11.4 要求显式 alg | 2026-01 CVE | 必须写 `alg: 'HS256'` |
| `wrangler kv:namespace` | 命令格式相同，但需注意 `--preview` 用于 dev | 持续 | 本地 dev 用 preview namespace ID |

**Deprecated/outdated:**
- `wrangler 2.x --persist` 标志：v3+ 已默认持久化，`--persist` 已废弃
- Hono jwt 不传 alg：安全漏洞，必须显式传

---

## Runtime State Inventory

> 本 Phase 是全新 CF Workers 项目，没有既有运行时状态需要迁移。

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | 无 — 全新 D1 数据库 | 建表即可 |
| Live service config | 无 — 新 CF Workers project | 执行 wrangler d1 create / kv:namespace create |
| OS-registered state | 无 | — |
| Secrets/env vars | 无已有 Secrets | 建立 .dev.vars 本地文件 + 生产 wrangler secret put |
| Build artifacts | 无 | — |

---

## Open Questions

1. **CORS origin 在生产环境如何配置**
   - What we know: 小程序端不走浏览器 CORS，但 PWA 端（Phase 2 之前的 H5）可能跨域
   - What's unclear: 是否需要在 Phase 1 就锁定 CORS origin
   - Recommendation: 开发阶段 `origin: '*'`，Phase 2 部署时通过 `WX_APP_ID` 环境变量推断或直接用 wildcard（小程序不受 CORS 限制）

2. **D1 database_id 何时填入**
   - What we know: `wrangler.toml` 中需要真实的 `database_id`（UUID），在执行 `wrangler d1 create qiqi-db` 后获得
   - What's unclear: CI/CD 阶段的 database_id 管理
   - Recommendation: Phase 1 任务中包含 `wrangler d1 create` 步骤，将返回的 UUID 填入 wrangler.toml

3. **milestone_states 的 UNIQUE 约束与 upsert**
   - What we know: 已在 schema 中加入 `UNIQUE(user_id, milestone_id)`
   - What's unclear: 更新时用 `INSERT OR REPLACE` 会重置 id 自增值
   - Recommendation: 改用 `INSERT OR IGNORE` + `UPDATE WHERE user_id=?1 AND milestone_id=?2` 两步操作，或 `ON CONFLICT(user_id, milestone_id) DO UPDATE SET status=excluded.status`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | wrangler CLI 运行 | ✓ | v24.13.0 | — |
| npm | 包管理 | ✓ | 11.6.2 | — |
| wrangler | CF Workers 开发 | ✗（未全局安装） | — | `npx wrangler` 或 `npm install -D wrangler` |
| CF 账户 + API Token | wrangler d1 create / deploy | [ASSUMED] 已有 | — | 如无账户需先注册 |
| 微信小程序 AppID + AppSecret | AUTH-02 真实测试 | [ASSUMED] 已有（CONTEXT.md D-19） | — | 无 fallback，是 locked decision |

**Missing dependencies with no fallback:**
- wrangler 需要安装为 devDependency（通过 `npm create hono@latest` 会自动包含）

**Missing dependencies with fallback:**
- 无阻塞性缺失项

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | vitest（项目已有 vitest ^2.0.0）+ @cloudflare/vitest-pool-workers（Wave 0 新增） |
| Config file | `worker/vitest.config.ts`（Wave 0 创建） |
| Quick run command | `cd worker && npm test` |
| Full suite command | `cd worker && npm test -- --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BACK-01 | Worker 启动并响应请求 | smoke | `wrangler dev --local &; curl http://localhost:8787/api/health` | ❌ Wave 0 |
| BACK-03 | GET /api/health 返回 200 + {"status":"ok"} | unit | `vitest run test/routes/health.test.ts` | ❌ Wave 0 |
| AUTH-02 | POST /api/auth/login + valid code → JWT | integration | manual（需真实微信 code，不可自动化） | manual-only |
| AUTH-04 | 不带 JWT 访问受保护端点 → 401 | unit | `vitest run test/middleware/auth.test.ts` | ❌ Wave 0 |
| DATA-01 | POST /api/profile 创建档案，GET 读取 | unit (mock D1) | `vitest run test/routes/profile.test.ts` | ❌ Wave 0 |
| DATA-02 | POST /api/records 创建记录 | unit (mock D1) | `vitest run test/routes/records.test.ts` | ❌ Wave 0 |
| DATA-04 | DELETE /api/records/:id 软删除 | unit (mock D1) | `vitest run test/routes/records.test.ts` | ❌ Wave 0 |
| DATA-05 | PUT /api/milestones/states 写入状态 | unit (mock D1) | `vitest run test/routes/milestones.test.ts` | ❌ Wave 0 |
| DATA-06 | POST /api/diary 创建日记 | unit (mock D1) | `vitest run test/routes/diary.test.ts` | ❌ Wave 0 |

**AUTH-02 manual-only 理由:** 微信 wx.login code 是一次性的、有时效的，需要真实小程序发起，无法在 CI 自动化测试中生成。Phase 1 成功标准中已包含手动验证步骤。

### Sampling Rate
- **Per task commit:** `cd worker && npm test`（仅运行已存在的测试，初期为空）
- **Per wave merge:** `cd worker && npm test -- --reporter=verbose`
- **Phase gate:** 全部 unit test 绿，手动执行 5 条 success criteria 验证

### Wave 0 Gaps
- [ ] `worker/vitest.config.ts` — 配置 @cloudflare/vitest-pool-workers pool
- [ ] `worker/test/routes/health.test.ts` — covers BACK-03
- [ ] `worker/test/middleware/auth.test.ts` — covers AUTH-04
- [ ] `worker/test/routes/profile.test.ts` — covers DATA-01
- [ ] `worker/test/routes/records.test.ts` — covers DATA-02、DATA-03、DATA-04
- [ ] `worker/test/routes/milestones.test.ts` — covers DATA-05
- [ ] `worker/test/routes/diary.test.ts` — covers DATA-06、DATA-07
- [ ] Framework install: `npm install -D @cloudflare/vitest-pool-workers` in worker/

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Hono jwt middleware，显式 `alg: 'HS256'`，secret 存 CF Secrets |
| V3 Session Management | no | 无状态 JWT，不实现 server-side session |
| V4 Access Control | yes | authMiddleware 保护所有非 /health、非 /auth/login 端点 |
| V5 Input Validation | yes | c.req.json() 类型检查 + null/undefined guard |
| V6 Cryptography | yes | HMAC-SHA256（HS256），WebCrypto，不手写；secret >= 32 字符 |

### Known Threat Patterns for CF Workers + JWT Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| JWT 算法混淆攻击 | Spoofing | 显式传 `alg: 'HS256'`，升级 hono >= 4.11.4 |
| JWT Secret 泄露 | Information Disclosure | 存 CF Secrets，不进 wrangler.toml vars，不进 git |
| SQL 注入 | Tampering | D1 prepare().bind() 参数化，禁止字符串拼接 SQL |
| 未授权访问 D1 数据 | Elevation of Privilege | 所有 D1 查询包含 `user_id = ?` 过滤，不允许跨用户查询 |
| 微信 AppSecret 泄露 | Information Disclosure | 存 CF Secrets（`WX_APP_SECRET`），不进 AppID 环境变量（AppID 是公开的） |
| code replay（微信登录） | Spoofing | 微信 code 是一次性的，服务端不缓存 code，直接转发给 WeChat API |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | CF 账户已创建，有权限创建 D1 数据库和 Workers | Environment Availability | 需要先注册 CF 账户，影响所有部署步骤 |
| A2 | 微信小程序 AppID + AppSecret 已获取（基于 D-19） | Environment Availability | AUTH-02 无法测试，需要 AppID 申请 |
| A3 | `compatibility_date = "2026-04-22"` 不会引入 breaking changes | Standard Stack | 极低风险，CF 兼容日期是前向锁定 |

---

## Sources

### Primary (HIGH confidence)
- `/websites/developers_cloudflare_workers` (Context7) — D1 配置、migrations apply、KV 创建、secrets、local dev
- `/websites/hono_dev` (Context7) — JWT middleware、sign/verify、CORS、Bindings 类型
- `/honojs/middleware` (Context7) — bearer auth、casbin JWT 用法

### Secondary (MEDIUM confidence)
- [auth.code2Session | Weixin public doc](https://developers.weixin.qq.com/miniprogram/en/dev/api-backend/open-api/login/auth.code2Session.html) — WeChat jscode2session 端点和参数
- [CVE-2026-22817 GHSA-f67f-6cw9-8mq4](https://github.com/honojs/hono/security/advisories/GHSA-f67f-6cw9-8mq4) — Hono JWT 算法混淆漏洞说明
- [Cloudflare D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/) — 本地持久化行为

### Tertiary (LOW confidence)
- 无 LOW confidence 条目

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — 版本通过 npm registry 验证，Hono/Wrangler 均是现役最新
- Architecture: HIGH — 基于官方文档和 Context7 验证的模式
- Pitfalls: HIGH（技术类）/ MEDIUM（微信网络类）— 技术陷阱来自官方文档；微信测试环境依赖网络
- JWT CVE: HIGH — 来自 GitHub Security Advisory 官方公告

**Research date:** 2026-04-22
**Valid until:** 2026-05-22（wrangler 更新频繁，建议 30 天内重验证版本）
