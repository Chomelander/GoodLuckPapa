# Phase 1: CF Workers 骨架 - Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 12 new files in `/worker/`
**Analogs found:** 4 / 12 (P0 is pure-frontend PWA; most patterns come from RESEARCH.md)

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `worker/src/index.ts` | config/entrypoint | request-response | `js/app.js` (app init pattern) | partial |
| `worker/src/types.ts` | config | — | `js/db.js` (store schema definitions) | partial |
| `worker/src/middleware/auth.ts` | middleware | request-response | none in codebase | no-analog |
| `worker/src/routes/health.ts` | route/handler | request-response | none in codebase | no-analog |
| `worker/src/routes/auth.ts` | route/handler | request-response | none in codebase | no-analog |
| `worker/src/routes/profile.ts` | route/handler | CRUD | `js/db.js` getProfile/saveProfile | partial |
| `worker/src/routes/records.ts` | route/handler | CRUD | `js/db.js` addRecord/getRecords/updateRecord/deleteRecord + `js/ui/today.js` | partial |
| `worker/src/routes/milestones.ts` | route/handler | CRUD | `js/db.js` getMilestoneState/saveMilestoneState | partial |
| `worker/src/routes/diary.ts` | route/handler | CRUD | `js/db.js` addDiary/getDiaries/updateDiary/deleteDiary + `js/ui/diary.js` | partial |
| `worker/src/lib/db.ts` | utility | transform | `js/db.js` (field naming convention) | partial |
| `worker/src/lib/response.ts` | utility | request-response | none in codebase | no-analog |
| `worker/migrations/0001_init.sql` | migration | — | `js/db.js` store definitions (field mapping) | partial |

---

## Pattern Assignments

### `worker/src/types.ts` (config, type definitions)

**Analog:** `js/db.js` (store names and field shapes)

D1 table names map directly from IndexedDB store names. The field shapes in `js/db.js` lines 47-165 are the authoritative source for what columns each D1 table must carry, converted to snake_case per D-01.

**IndexedDB → D1 field mapping reference** (`js/db.js` lines 49-165):

```javascript
// P0 IndexedDB store operations (camelCase) → D1 columns (snake_case)
// profile store   → profiles table:  { name, birthDate, gender } → { name, birth_date, gender }
// records store   → records table:   { actId, initType, focusSec, emotion, note, createdAt }
//                                    → { activity_id, init_type, focus_sec, emotion, note, created_at }
// milestones store → milestone_states table: { status } → { milestone_id, status, achieved_at }
// diaryEntries    → diary_entries:   { changes, feelings, images, date, createdAt }
//                                    → { content, image_urls, created_at }
// NOTE: diary images[] (array of {name,dataUrl}) become a JSON string in image_urls column (D-10)
```

**Bindings type pattern** (from RESEARCH.md Pattern 1):

```typescript
// worker/src/types.ts
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
```

---

### `worker/src/index.ts` (entrypoint, request-response)

**Analog:** `js/app.js` (application init + module wiring) — partial match, different runtime

**App init analog** (`js/app.js` lines 1-20 pattern): state object initialized once, modules registered, event bus used. In Workers, the equivalent is `new Hono()` + `app.use()` middlewares + `app.route()` mounts.

**Core pattern** (from RESEARCH.md Pattern 1):

```typescript
// worker/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings, Variables } from './types'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// CORS must come before routes
app.use('*', async (c, next) => {
  const corsMiddleware = cors({ origin: c.env.CORS_ORIGIN ?? '*' })
  return corsMiddleware(c, next)
})

// Route mounts
import healthRoutes from './routes/health'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import recordsRoutes from './routes/records'
import milestonesRoutes from './routes/milestones'
import diaryRoutes from './routes/diary'

app.route('/api', healthRoutes)
app.route('/api', authRoutes)
app.route('/api', profileRoutes)
app.route('/api', recordsRoutes)
app.route('/api', milestonesRoutes)
app.route('/api', diaryRoutes)

export default app
```

---

### `worker/src/middleware/auth.ts` (middleware, request-response)

**Analog:** none in P0 codebase (P0 has no auth layer)

**Pattern source:** RESEARCH.md Pattern 2 — CRITICAL: must specify `alg: 'HS256'` explicitly (CVE-2026-22817).

```typescript
// worker/src/middleware/auth.ts
import { jwt } from 'hono/jwt'
import type { MiddlewareHandler } from 'hono'
import type { Bindings, Variables } from '../types'

export const authMiddleware: MiddlewareHandler<{
  Bindings: Bindings
  Variables: Variables
}> = (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    alg: 'HS256', // REQUIRED: prevents CVE-2026-22817 algorithm confusion attack
  })
  return jwtMiddleware(c, next)
}
```

**Applying the middleware to protected routes** (all routes except `/api/health` and `/api/auth/login`):

```typescript
// In each protected route file (profile, records, milestones, diary):
import { authMiddleware } from '../middleware/auth'

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()
router.use('*', authMiddleware)
// ... route handlers follow
```

---

### `worker/src/lib/response.ts` (utility, request-response)

**Analog:** none in P0 codebase (P0 uses direct DOM updates, not HTTP envelopes)

**Pattern source:** RESEARCH.md "统一响应 helper" (D-15, D-16, D-18).

```typescript
// worker/src/lib/response.ts
import type { Context } from 'hono'

export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ success: true, data, error: null }, status)
}

export function fail(
  c: Context,
  status: 400 | 401 | 404 | 429 | 500,
  code: string,
  message: string
) {
  return c.json({ success: false, data: null, error: { code, message } }, status)
}
```

**Error code naming** (D-18): `AUTH_INVALID_TOKEN`, `AUTH_EXPIRED`, `AUTH_WX_FAILED`, `PROFILE_NOT_FOUND`, `RECORD_NOT_FOUND`, `MILESTONE_STATE_NOT_FOUND`, `DIARY_NOT_FOUND`, `RATE_LIMIT_EXCEEDED`

---

### `worker/src/lib/db.ts` (utility, transform)

**Analog:** `js/db.js` lines 36-43 (helper pattern for wrapping async DB calls) — different DB API but same helper philosophy.

P0 uses `rq()` to promisify IDBRequest. D1 already returns Promises. The equivalent utility needed is the snake_case → camelCase converter and the user-scoped query guard.

**P0 helper pattern** (`js/db.js` lines 38-42):

```javascript
// P0: wraps IDBRequest callbacks into a Promise
const rq = (req) => new Promise((res, rej) => {
  req.onsuccess = (e) => res(e.target.result);
  req.onerror = (e) => rej(e.target.error);
});
```

**D1 equivalent** (from RESEARCH.md Pattern 4):

```typescript
// worker/src/lib/db.ts

// Convert D1 row (snake_case) to API response object (camelCase)
export function toCamel(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      v,
    ])
  )
}

// Upsert user by WeChat openid (used in auth route)
export async function upsertUser(db: D1Database, openid: string): Promise<{ id: number }> {
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

**CRITICAL: All D1 queries must include `user_id` filter** (security requirement from RESEARCH.md):

```typescript
// Pattern: always bind userId from JWT payload, never trust request body for ownership
const userId = c.get('userId') // set by authMiddleware after JWT verification
const result = await c.env.DB
  .prepare('SELECT * FROM records WHERE user_id = ?1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?2 OFFSET ?3')
  .bind(userId, pageSize, (page - 1) * pageSize)
  .all()
```

---

### `worker/src/routes/health.ts` (route/handler, request-response)

**Analog:** none (simplest possible route, no P0 equivalent)

```typescript
// worker/src/routes/health.ts
import { Hono } from 'hono'
import type { Bindings, Variables } from '../types'
import { ok } from '../lib/response'

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// No auth middleware — public endpoint
router.get('/health', (c) => ok(c, { status: 'ok' }))

export default router
```

---

### `worker/src/routes/auth.ts` (route/handler, request-response)

**Analog:** none in P0 (P0 has no server-side auth)

**Pattern source:** RESEARCH.md Pattern 3 — WeChat jscode2session + JWT sign.

```typescript
// worker/src/routes/auth.ts
import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import type { Bindings, Variables } from '../types'
import { ok, fail } from '../lib/response'
import { upsertUser } from '../lib/db'

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

router.post('/auth/login', async (c) => {
  const body = await c.req.json<{ code?: string }>().catch(() => ({}))
  if (!body.code) {
    return fail(c, 400, 'AUTH_MISSING_CODE', 'code is required')
  }

  // Exchange code for openid via WeChat API
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${c.env.WX_APP_ID}&secret=${c.env.WX_APP_SECRET}&js_code=${body.code}&grant_type=authorization_code`
  const wxRes = await fetch(url)
  const wxData = await wxRes.json<{ openid?: string; errcode?: number; errmsg?: string }>()

  if (!wxData.openid) {
    return fail(c, 400, 'AUTH_WX_FAILED', wxData.errmsg ?? 'WeChat login failed')
  }

  const user = await upsertUser(c.env.DB, wxData.openid)

  // JWT payload (D-12): sub=user_id, exp=7 days
  const payload = {
    sub: user.id,
    openid: wxData.openid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 604800,
  }
  const token = await sign(payload, c.env.JWT_SECRET)

  return ok(c, { token })
})

export default router
```

---

### `worker/src/routes/profile.ts` (route/handler, CRUD)

**Analog:** `js/db.js` lines 47-56 — `getProfile()` and `saveProfile()` operations.

P0 profile is a singleton (one profile per device). D1 profile is per `user_id` (one per user). The CRUD shape is GET (read or 404) + POST (create/update).

**P0 profile pattern** (`js/db.js` lines 49-56):

```javascript
// P0: single profile, key='profile'
async getProfile() {
  return (await rq(tx('profile').objectStore('profile').get('profile'))) ?? null;
},
async saveProfile(data) {
  const store = tx('profile', 'readwrite').objectStore('profile');
  await rq(store.put({ ...data }, 'profile'));
},
```

**D1 equivalent pattern:**

```typescript
// worker/src/routes/profile.ts
router.get('/profile', async (c) => {
  const userId = c.get('userId')
  const row = await c.env.DB
    .prepare('SELECT * FROM profiles WHERE user_id = ?1 LIMIT 1')
    .bind(userId)
    .first<Record<string, unknown>>()
  if (!row) return fail(c, 404, 'PROFILE_NOT_FOUND', 'Profile not found')
  return ok(c, toCamel(row))
})

router.post('/profile', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ name?: string; birthDate?: string; gender?: string }>()
  if (!body.name || !body.birthDate || !body.gender) {
    return fail(c, 400, 'PROFILE_INVALID', 'name, birthDate, gender are required')
  }
  const existing = await c.env.DB
    .prepare('SELECT id FROM profiles WHERE user_id = ?1 LIMIT 1')
    .bind(userId)
    .first<{ id: number }>()
  if (existing) {
    await c.env.DB
      .prepare('UPDATE profiles SET name=?1, birth_date=?2, gender=?3, updated_at=datetime(\'now\') WHERE user_id=?4')
      .bind(body.name, body.birthDate, body.gender, userId)
      .run()
    return ok(c, null)
  }
  await c.env.DB
    .prepare('INSERT INTO profiles (user_id, name, birth_date, gender) VALUES (?1,?2,?3,?4)')
    .bind(userId, body.name, body.birthDate, body.gender)
    .run()
  return ok(c, null, 201)
})
```

---

### `worker/src/routes/records.ts` (route/handler, CRUD)

**Analog:** `js/db.js` lines 58-88 — `addRecord`, `getRecords`, `updateRecord`, `deleteRecord`.

P0 `deleteRecord` is a hard delete. D1 uses soft delete (`deleted_at`, D-03). P0 `getRecords` returns all; D1 adds pagination (D-17).

**P0 records pattern** (`js/db.js` lines 60-88):

```javascript
async addRecord(record) {
  return rq(store.add({ ...record, createdAt: new Date().toISOString() }));
},
async updateRecord(id, patch) {
  const existing = await rq(store.get(id));
  if (!existing) return;
  await rq(store.put({ ...existing, ...patch, id }));
},
async deleteRecord(id) {  // P0: hard delete
  await rq(tx('records', 'readwrite').objectStore('records').delete(id));
},
```

**D1 soft-delete pattern** (records and diary_entries use `deleted_at`):

```typescript
// DELETE — soft delete (D-03)
router.delete('/records/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  const row = await c.env.DB
    .prepare('SELECT id FROM records WHERE id=?1 AND user_id=?2 AND deleted_at IS NULL')
    .bind(id, userId)
    .first()
  if (!row) return fail(c, 404, 'RECORD_NOT_FOUND', 'Record not found')
  await c.env.DB
    .prepare('UPDATE records SET deleted_at=datetime(\'now\'), updated_at=datetime(\'now\') WHERE id=?1')
    .bind(id)
    .run()
  return ok(c, null)
})

// GET with pagination (D-17)
router.get('/records', async (c) => {
  const userId = c.get('userId')
  const page = parseInt(c.req.query('page') ?? '1')
  const pageSize = parseInt(c.req.query('pageSize') ?? '20')
  const offset = (page - 1) * pageSize

  const [rows, countRow] = await Promise.all([
    c.env.DB.prepare(
      'SELECT * FROM records WHERE user_id=?1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?2 OFFSET ?3'
    ).bind(userId, pageSize, offset).all(),
    c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM records WHERE user_id=?1 AND deleted_at IS NULL'
    ).bind(userId).first<{ total: number }>(),
  ])
  return c.json({
    success: true,
    data: (rows.results ?? []).map(toCamel),
    pagination: { page, pageSize, total: countRow?.total ?? 0 },
  })
})
```

---

### `worker/src/routes/milestones.ts` (route/handler, CRUD)

**Analog:** `js/db.js` lines 90-98 — `getMilestoneState`, `saveMilestoneState`.

P0 uses a simple key→value put. D1 uses `UNIQUE(user_id, milestone_id)` with upsert via `ON CONFLICT DO UPDATE` (see RESEARCH.md Open Question 3 — avoid `INSERT OR REPLACE` which resets auto-increment id).

**P0 milestone pattern** (`js/db.js` lines 92-98):

```javascript
async getMilestoneState(id) {
  return (await rq(tx('milestones').objectStore('milestones').get(id))) ?? null;
},
async saveMilestoneState(id, state) {
  await rq(tx('milestones', 'readwrite').objectStore('milestones').put(state, id));
},
```

**D1 upsert pattern** (preferred over INSERT OR REPLACE per RESEARCH.md):

```typescript
// PUT /api/milestones/states — bulk upsert
router.put('/milestones/states', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ milestoneId: string; status: string; achievedAt?: string }[]>()
  if (!Array.isArray(body)) return fail(c, 400, 'MILESTONE_INVALID', 'body must be array')

  for (const item of body) {
    await c.env.DB
      .prepare(`
        INSERT INTO milestone_states (user_id, milestone_id, status, achieved_at)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(user_id, milestone_id) DO UPDATE SET
          status = excluded.status,
          achieved_at = excluded.achieved_at,
          updated_at = datetime('now')
      `)
      .bind(userId, item.milestoneId, item.status, item.achievedAt ?? null)
      .run()
  }
  return ok(c, null)
})
```

---

### `worker/src/routes/diary.ts` (route/handler, CRUD)

**Analog:** `js/db.js` lines 122-143 — `addDiary`, `getDiaries`, `updateDiary`, `deleteDiary`. Also `js/ui/diary.js` lines 240-268 for the CRUD flow shape (edit vs. create branch logic).

P0 diary stores `images` as array of `{name, dataUrl}` objects. D1 stores `image_urls` as JSON string (D-10). The conversion happens in the API layer.

**P0 diary CRUD pattern** (`js/db.js` lines 124-143):

```javascript
async addDiary(entry) {
  return rq(store.add({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
},
async updateDiary(id, patch) {
  const existing = await rq(store.get(id));
  if (!existing) return;
  await rq(store.put({ ...existing, ...patch, id, updatedAt: new Date().toISOString() }));
},
async deleteDiary(id) {  // P0: hard delete
  await rq(tx('diaryEntries', 'readwrite').objectStore('diaryEntries').delete(id));
},
```

**P0 diary form submit branch** (`js/ui/diary.js` lines 251-268):

```javascript
// P0: edit vs. create branch — mirrors what API PUT vs POST should do
if (entryId) {
  await state.db.updateDiary(parseInt(entryId, 10), entryData);
} else {
  await state.db.addDiary(entryData);
}
```

**D1 pattern (soft delete, image_urls JSON string):**

```typescript
// POST /api/diary — create entry
router.post('/diary', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ content: string; imageUrls?: string[] }>()
  if (!body.content?.trim()) return fail(c, 400, 'DIARY_INVALID', 'content is required')
  const imageUrlsJson = JSON.stringify(body.imageUrls ?? [])
  await c.env.DB
    .prepare('INSERT INTO diary_entries (user_id, content, image_urls) VALUES (?1,?2,?3)')
    .bind(userId, body.content, imageUrlsJson)
    .run()
  return ok(c, null, 201)
})

// DELETE /api/diary/:id — soft delete (D-03)
router.delete('/diary/:id', async (c) => {
  const userId = c.get('userId')
  const id = parseInt(c.req.param('id'))
  const row = await c.env.DB
    .prepare('SELECT id FROM diary_entries WHERE id=?1 AND user_id=?2 AND deleted_at IS NULL')
    .bind(id, userId)
    .first()
  if (!row) return fail(c, 404, 'DIARY_NOT_FOUND', 'Diary entry not found')
  await c.env.DB
    .prepare('UPDATE diary_entries SET deleted_at=datetime(\'now\'), updated_at=datetime(\'now\') WHERE id=?1')
    .bind(id)
    .run()
  return ok(c, null)
})
```

---

### `worker/migrations/0001_init.sql` (migration, schema)

**Analog:** `js/db.js` lines 21-31 — the `onupgradeneeded` block defines the same 6 conceptual stores.

**P0 store creation** (`js/db.js` lines 22-31):

```javascript
// P0: IndexedDB store creation (maps to D1 tables)
db.createObjectStore('profile')                                          // → profiles table
db.createObjectStore('activities', { keyPath: 'id' })                   // → NOT in D1 (static data)
db.createObjectStore('milestones')                                       // → milestone_states table
db.createObjectStore('records', { autoIncrement: true, keyPath: 'id' }) // → records table
db.createObjectStore('monthlyReviews')                                   // → NOT in D1 (local-only)
db.createObjectStore('settings')                                         // → NOT in D1 (local-only)
db.createObjectStore('diaryEntries', { autoIncrement: true, keyPath: 'id' }) // → diary_entries table
db.createObjectStore('customActivities', { keyPath: 'id' })             // → NOT in D1 (local-only)
```

Full SQL schema is in RESEARCH.md "D1 Schema Migration 文件" — copy verbatim. Key points:
- All 6 tables use `INTEGER PRIMARY KEY AUTOINCREMENT` (maps to P0's `autoIncrement: true`)
- Soft-delete tables (`records`, `diary_entries`) get `deleted_at TEXT` nullable column
- `milestone_states` gets `UNIQUE(user_id, milestone_id)` constraint for upsert support
- `ai_usage` is created but no logic implemented in Phase 1 (D-19 note)

---

### Config files: `wrangler.toml`, `.dev.vars`, `package.json`, `tsconfig.json`

**No P0 analog** — pure Cloudflare Workers toolchain configuration.

Use RESEARCH.md Pattern 5 verbatim for `wrangler.toml`.
Use RESEARCH.md Pattern 6 verbatim for `.dev.vars`.
`.dev.vars` must be added to `.gitignore` immediately.

---

## Shared Patterns

### JWT Authentication (all protected routes)
**Source:** RESEARCH.md Pattern 2 + `worker/src/middleware/auth.ts`
**Apply to:** `profile.ts`, `records.ts`, `milestones.ts`, `diary.ts` — all routes except `health.ts` and `auth.ts`

```typescript
// At top of each protected route file:
import { authMiddleware } from '../middleware/auth'
const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()
router.use('*', authMiddleware)
// Extract userId from JWT payload set by middleware:
const userId = c.get('userId')
```

### Envelope Response Format (all routes)
**Source:** RESEARCH.md "统一响应 helper" + D-15/D-16/D-18
**Apply to:** all route files

```typescript
import { ok, fail } from '../lib/response'
// Success:  return ok(c, data)          → { success: true, data, error: null }
// Created:  return ok(c, data, 201)     → 201 + envelope
// Error:    return fail(c, 404, 'RECORD_NOT_FOUND', 'message')
```

### D1 Parameterized Query Pattern (all routes touching D1)
**Source:** RESEARCH.md Anti-Patterns + Pitfall 5
**Apply to:** `profile.ts`, `records.ts`, `milestones.ts`, `diary.ts`, `auth.ts`, `lib/db.ts`

```typescript
// ALWAYS use .prepare().bind() — NEVER string concatenation
// ALWAYS filter by user_id — NEVER allow cross-user data access
// Use ?1, ?2 placeholders (D1/SQLite style, NOT $1/$2)
await c.env.DB.prepare('SELECT * FROM records WHERE user_id = ?1 AND id = ?2')
  .bind(userId, recordId)
  .first()
```

### Soft Delete Pattern (records and diary_entries only)
**Source:** RESEARCH.md D-03
**Apply to:** `records.ts` DELETE handler, `diary.ts` DELETE handler

```typescript
// Soft delete: set deleted_at, not actual row removal
// All SELECT queries must include: AND deleted_at IS NULL
await c.env.DB
  .prepare('UPDATE records SET deleted_at=datetime(\'now\'), updated_at=datetime(\'now\') WHERE id=?1 AND user_id=?2')
  .bind(id, userId)
  .run()
```

### camelCase Conversion (all GET responses)
**Source:** RESEARCH.md Pattern 4 + `lib/db.ts`
**Apply to:** all route GET handlers that return D1 rows

```typescript
import { toCamel } from '../lib/db'
// Single row:  return ok(c, toCamel(row))
// Array rows:  return ok(c, results.map(toCamel))
```

---

## No Analog Found

Files with no close match in the existing P0 codebase (use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `worker/src/middleware/auth.ts` | middleware | request-response | P0 has no server-side auth; P0 has no middleware concept |
| `worker/src/routes/health.ts` | route/handler | request-response | P0 has no HTTP endpoints |
| `worker/src/routes/auth.ts` | route/handler | request-response | P0 has no login/JWT logic |
| `worker/src/lib/response.ts` | utility | request-response | P0 uses direct DOM updates, not HTTP envelopes |
| `worker/wrangler.toml` | config | — | CF Workers-specific, no P0 equivalent |
| `worker/.dev.vars` | config | — | CF Secrets simulation, no P0 equivalent |

---

## Metadata

**Analog search scope:** `js/db.js`, `js/ui/diary.js`, `js/ui/today.js`, `js/rules.js`, `js/app.js`
**Files scanned:** 5 P0 source files
**Pattern extraction date:** 2026-04-22
**Note:** This is a greenfield backend. P0 is pure-frontend PWA. The primary pattern sources are RESEARCH.md (Hono/D1/JWT verified patterns) with P0 files consulted for field-level schema alignment only.
