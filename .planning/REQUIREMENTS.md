# Requirements: 起起成长 P1

**Defined:** 2026-04-22
**Core Value:** 父母填入孩子月龄和观察记录，AI 给出个性化建议，让新手父母"会观察、懂孩子"

## v1 Requirements

### 后端基础设施（Backend）

- [ ] **BACK-01**: CF Workers 项目初始化，可接收 HTTPS 请求并返回响应
- [ ] **BACK-02**: CF D1 数据库 schema 创建（users / profiles / records / milestone_states / diary_entries / ai_usage）
- [ ] **BACK-03**: `/api/health` 健康检查端点可用
- [ ] **BACK-04**: CF Secrets 存储 `OPENAI_API_KEY`，不暴露到前端
- [ ] **BACK-05**: CF KV namespace 创建，用于 AI 使用量计数

### 用户鉴权（Auth）

- [ ] **AUTH-01**: 用户可通过微信 wx.login() 获取 code
- [ ] **AUTH-02**: CF Workers 用 code 换取 openid，生成 JWT（7天有效）
- [ ] **AUTH-03**: 小程序端 JWT 持久化存储（uni.setStorageSync）
- [ ] **AUTH-04**: 所有受保护端点验证 JWT，无效时返回 401

### 数据持久化（Data）

- [ ] **DATA-01**: 用户可创建/读取孩子档案（name, birth_date, gender）
- [ ] **DATA-02**: 用户可创建观察记录（activity_id, init_type, focus_sec, emotion, note）
- [ ] **DATA-03**: 用户可查询历史记录（按日期分页）
- [ ] **DATA-04**: 用户可编辑/删除观察记录
- [ ] **DATA-05**: 用户可读写里程碑状态（notStarted / emerging / achieved）
- [ ] **DATA-06**: 用户可创建/查询育儿日记
- [ ] **DATA-07**: 用户可删除育儿日记条目

### 微信小程序（MiniApp）

- [ ] **MINI-01**: uni-app 项目初始化，可在微信开发者工具中运行
- [ ] **MINI-02**: 用户首次打开自动完成微信登录
- [ ] **MINI-03**: 「今日」Tab：根据月龄展示 1主+2备活动推荐
- [ ] **MINI-04**: 用户可开始活动计时并完成观察记录（4字段）
- [ ] **MINI-05**: 「成长」Tab：展示里程碑对照（10维度）
- [ ] **MINI-06**: 用户可标记里程碑状态
- [ ] **MINI-07**: 「成长」Tab：展示活动记录时间线（年/周折叠）
- [ ] **MINI-08**: 用户可查看/添加育儿日记
- [ ] **MINI-09**: 「复盘」Tab：周复盘 5问自检
- [ ] **MINI-10**: 月度复盘（蒙氏10维度）
- [ ] **MINI-11**: 设置页：孩子档案编辑 + BYOK key 填写
- [ ] **MINI-12**: 小程序数据实时写入 CF D1（每次操作后同步）

### AI 功能（AI）

- [ ] **AI-01**: CF Workers `/api/ai/chat` 端点：接收请求，选择 key（BYOK/Lin's），转发 OpenAI-compatible API
- [ ] **AI-02**: 每日限流：免费用户 10次/天，超限返回 429
- [ ] **AI-03**: 功能权限控制：问答功能对 free 用户返回 403
- [ ] **AI-04**: AI 周方案生成：基于月龄 + 近7天记录生成下周活动建议
- [ ] **AI-05**: AI 里程碑分析：基于月龄 + 里程碑状态生成解读与建议
- [ ] **AI-06**: AI 对话问答：订阅用户可与 AI 自由对话育儿问题
- [ ] **AI-07**: 流式响应（SSE）：AI 回复逐 token 渲染，不等全量

## v2 Requirements

### 订阅鉴权（Subscription）

- **SUB-01**: 用户可通过第三方平台购买订阅
- **SUB-02**: 订阅用户自动获得 subscriber 权限
- **SUB-03**: 订阅到期后降级为免费用户

### 多端同步

- **SYNC-01**: PWA 用户可导出数据导入小程序
- **SYNC-02**: 同一微信账号多设备数据一致

### AI 增强

- **AI-08**: AI 兴趣报告：基于4周追踪数据生成兴趣分析报告
- **AI-09**: AI 月度复盘辅助：AI 解读蒙氏10维度数据

## Out of Scope

| Feature | Reason |
|---------|--------|
| PWA 后端持久化迁移 | P1 仅小程序走云端，PWA 保持 IndexedDB，降低复杂度 |
| 多照料者账号 | 需账号体系重设计，P2 |
| iOS/Android 原生 App | PWA + 小程序已覆盖主要场景 |
| 视频/语音记录 | 存储成本高，不是 MVP 核心 |
| 社区/分享功能 | 超出个人育儿工具范畴 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BACK-01 | Phase 1 | Pending |
| BACK-02 | Phase 1 | Pending |
| BACK-03 | Phase 1 | Pending |
| BACK-04 | Phase 1 | Pending |
| BACK-05 | Phase 1 | Pending |
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| DATA-06 | Phase 1 | Pending |
| DATA-07 | Phase 1 | Pending |
| MINI-01 | Phase 2 | Pending |
| MINI-02 | Phase 2 | Pending |
| MINI-03 | Phase 2 | Pending |
| MINI-04 | Phase 2 | Pending |
| MINI-05 | Phase 3 | Pending |
| MINI-06 | Phase 3 | Pending |
| MINI-07 | Phase 3 | Pending |
| MINI-08 | Phase 3 | Pending |
| MINI-09 | Phase 3 | Pending |
| MINI-10 | Phase 3 | Pending |
| MINI-11 | Phase 3 | Pending |
| MINI-12 | Phase 2 | Pending |
| AI-01 | Phase 4 | Pending |
| AI-02 | Phase 4 | Pending |
| AI-03 | Phase 4 | Pending |
| AI-04 | Phase 4 | Pending |
| AI-05 | Phase 4 | Pending |
| AI-06 | Phase 4 | Pending |
| AI-07 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-22*
*Last updated: 2026-04-22 after initial definition*
