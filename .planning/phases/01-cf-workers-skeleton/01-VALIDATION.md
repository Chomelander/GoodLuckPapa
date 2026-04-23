---
phase: 01
slug: cf-workers-skeleton
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @cloudflare/vitest-pool-workers |
| **Config file** | worker/vitest.config.ts |
| **Quick run command** | `cd worker && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd worker && npx vitest run --reporter=verbose --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd worker && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd worker && npx vitest run --reporter=verbose --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | BACK-01 | — | N/A | setup | `cd worker && npx wrangler --version` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | BACK-02 | — | N/A | migration | `cd worker && npx wrangler d1 migrations apply qiqi-db --local` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 1 | BACK-03 | — | N/A | integration | `cd worker && npx vitest run -t "health"` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | AUTH-02, AUTH-04 | T-01-01 | JWT alg:HS256 enforced | integration | `cd worker && npx vitest run -t "auth"` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | DATA-01~07 | — | N/A | integration | `cd worker && npx vitest run -t "data"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `worker/vitest.config.ts` — vitest + pool-workers config
- [ ] `worker/test/setup.ts` — shared test fixtures (D1 bindings, KV mock)
- [ ] `@cloudflare/vitest-pool-workers` — install as devDependency
- [ ] `worker/.dev.vars` — local secrets for testing (JWT_SECRET, WX_APP_ID, WX_APP_SECRET)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 微信 wx.login → openid 真实返回 | AUTH-01 | 需要真实微信环境 | 在微信开发者工具发送真实 code |
| CF Secrets 生产配置 | BACK-04 | 需要 CF dashboard 操作 | `wrangler secret put JWT_SECRET` |
| CF KV namespace 生产创建 | BACK-05 | 需要 CF dashboard 操作 | `wrangler kv:namespace create USAGE` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
