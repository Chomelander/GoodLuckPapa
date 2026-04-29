---
version: 2.1
last_updated: 2026-04-28
changelog:
  - v2.1 (2026-04-28): sync.js 集成完成，NAS 后端验证，部署文档完善
  - v2.0 (2026-04-24): Tab 重构 + M_Moments 时光页面 + NAS 后端完成
  - v1.8 (2026-04-21): 活动库/里程碑库全量完成，244 个测试通过
---

# 起起教育 · Good Luck Papa

> 一套帮助父母学会观察孩子的完整解决方案：蒙台梭利家庭观察体系（纯文档）+ 起起成长 App（PWA + 后端服务）

**核心使命**：让你看见你的孩子，而不是看见你对孩子的期待。

---

## 🎯 项目构成

### 📚 蒙台梭利家庭观察体系（分类方案/）
一套面向家长的观察、记录、评估工具体系，纯 Markdown 文档，包含：
- **理念层**：为什么做、给谁用、6 条伦理底线
- **引擎层**：A-H 八模块（活动模板、记录表、可观测指标、评价体系、兴趣识别、优势领域、编号体系）
- **执行层**：7 步心跳 + 周月复盘 + 新手 SOP
- **应用层**：0-6 岁按月龄分阶段的活动示例（143 条完整活动，0-72 月）

详见 `分类方案/README.md`

### 📱 起起成长 App（前端原型 + 实装代码）
PWA 应用，帮助父母数字化记录、查看孩子的成长过程。

**主要功能**（v2.1）：
| 功能 | 说明 |
|-----|------|
| **M1** | 孩子档案（出生日期、月龄自动计算） |
| **M2** | 活动库（0-72月 143 条完整蒙台梭利活动） |
| **M2.5** | 活动↔里程碑双向联动 |
| **M3** | 今日推荐（1 主 2 备，规则驱动） |
| **M4** | 观察记录（4 字段极简：initType/focusSec/emotion/note） |
| **M4.5** | 正向会话结束卡片 |
| **M5** | 7 步心跳（可选流程提示） |
| **M6** | 里程碑对照（10 维度，216 条完整里程碑库） |
| **M6.5** | 情境化正向提示 |
| **M7** | F 规则兴趣识别（锚点机制） |
| **M8** | 周复盘（5 问自检） |
| **M8.5** | 月度复盘（蒙氏 10 维度评估） |
| **M9** | 数据导出/导入 |
| **M_GuideIntensity** | 引导强度切换（轻/中/重三模式） |
| **M_Diary** | 育儿日记（时光页瀑布流展示） |
| **M_Moments** | 时光 Tab（融合日记+活动记录+里程碑，支持完整增删改） |
| **M_RecordEdit** | 记录编辑/删除 |
| **M_CustomActivity** | 自定义活动库管理 |

### 🖥️ 后端服务（server/）
NAS 友好型数据同步服务，支持小白部署。

**技术栈**：Bun + SQLite + Docker Compose + Nginx  
**功能**：
- JWT PIN 认证（无需注册，输入 PIN 码即可登录）
- 数据持久化（观察记录、日记、里程碑、档案）
- REST API（/api/health、/api/auth/pin、/api/profile、/api/records、/api/diary、/api/milestones）
- Push-only 增量同步（前端发起，后端接收）

---

## 📊 数据完成度

| 内容 | 状态 | 数量 | 完成日期 |
|-----|------|------|---------|
| **活动库** | ✅ 完成 | 0-72月 143 条 | 2026-04-16 |
| **里程碑库** | ✅ 完成 | 0-72月 216 条（10维度） | 2026-04-17 |
| **蒙台梭利体系文档** | ✅ 完成 | 7 个分阶段文档 | 2026-04-20 |
| **前端实装** | ✅ v2.1 | 8 个 store IndexedDB + sync.js | 2026-04-28 |
| **后端实装** | ✅ v2.1 | Bun REST API + Docker 部署 | 2026-04-24 |
| **端到端同步验证** | ✅ 通过 | 11 条记录 + 2 条日记 + 1 条里程碑 | 2026-04-28 |
| **单元测试** | ✅ 244/244 通过 | 全覆盖 | 2026-04-21 |

---

## 🚀 快速开始

### 仅使用前端（离线 PWA）

```bash
# 不需要任何构建，直接用浏览器打开
start prototype.html       # 查看视觉设计参考
# 或用 HTTP 服务器
npx serve . --listen 3000
# 访问 http://localhost:3000/index.html
```

**特点**：
- 所有数据存储在设备本地（IndexedDB）
- 支持 PWA 安装到手机桌面
- 完全离线可用，无需网络

### 带后端服务（数据云同步）

#### 快速部署（Docker）

```bash
# 1. 进入后端目录
cd server

# 2. 启动 Docker Compose（含 Nginx + 后端服务）
docker-compose up -d

# 3. 在 App 设置页配置 API 地址
# API 地址：http://localhost:8088  （或你的域名）
# PIN 码：任意 4 位数字（自定义）
```

详见 `部署文档/QUICK-START.md`

#### 配置 API（App 内）

1. 打开 App → 设置 Tab → 下滑找到「NAS API 配置」
2. 输入 API 地址（e.g. `http://192.168.1.100:8088`）
3. 输入 PIN 码（e.g. `1234`）
4. 点击保存
5. 之后每次记录、日记、里程碑都会自动同步到后端

更多配置方案见：
- `部署文档/DEPLOYMENT.md` — 完整部署指南
- `部署文档/API-CONFIG.md` — API 配置详解
- `部署文档/HTTPS-DDNS-SETUP.md` — 外网访问配置

---

## 📁 项目结构

```
起起教育/
├── README.md                          ← 你在这里
├── CLAUDE.md                          开发指南
├── index.html                         App 实装主入口
├── prototype.html                     视觉设计参考原型
│
├── js/                                前端代码
│   ├── db.js                         IndexedDB 8 个 store 封装
│   ├── app.js                        应用初始化 + 事件总线
│   ├── sync.js                       ⭐ NAS 同步层（push-only）
│   ├── ui/                           各模块 UI 代码
│   │   ├── today.js                 今日 Tab
│   │   ├── growth.js                成长 Tab
│   │   ├── moments.js               时光 Tab（日记+活动+里程碑）
│   │   ├── record.js                记录编辑/新增
│   │   ├── diary.js                 日记编辑
│   │   ├── milestones.js            里程碑页面
│   │   ├── settings.js              设置页（含 API 配置）
│   │   └── ...
│   ├── data/                         数据文件
│   │   ├── activities-complete.js   ⭐ 143 条活动库
│   │   ├── milestones.js            ⭐ 216 条里程碑库
│   │   └── ...
│   └── lib/                          辅助库
│
├── css/                               样式表
│   └── app.css                       主样式（含日记时间线、override）
│
├── server/                            ⭐ 后端服务（Bun + SQLite）
│   ├── src/
│   │   ├── index.ts                 REST API 主文件
│   │   └── db.ts                    SQLite 初始化
│   ├── migrations/                  数据库版本管理
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── 分类方案/                          蒙台梭利观察体系文档
│   ├── README.md                     （详见此文件）
│   ├── 00_体系说明.md
│   ├── 01_通用观察评估准则.md
│   ├── 02_核心框架与模板.md          ⭐ A-H 八模块定义
│   ├── 03_年龄段索引.md
│   ├── 04_示例活动集_0-1岁.md        ⭐ 维度覆盖矩阵
│   ├── 04_示例活动_0-1岁.md          ⭐ 25 张活动卡详细版
│   ├── 05_示例活动_3-4岁.md
│   ├── 06_阶段汇总评估框架.md
│   └── 07_新手SOP流程指引.md         ⭐ 7 步心跳 + 决策树
│
├── 部署文档/                          部署与运维指南
│   ├── QUICK-START.md                5 分钟快速启动
│   ├── DEPLOYMENT.md                 完整部署指南
│   ├── API-CONFIG.md                 API 配置详解
│   ├── HTTPS-DDNS-SETUP.md           外网访问配置
│   └── GIT-WORKFLOW.md               版本管理工作流
│
├── tests/                             测试用例（244/244 通过）
├── docs/                              其他文档
├── manifest.json                      PWA 清单
└── docker-compose.yml                 一键启动配置
```

---

## 🛠 开发指南

### 前端开发

```bash
# 安装依赖（可选，仅用于测试）
npm install

# 运行单元测试
npm test

# 查看结果
# 244 个测试全通过，覆盖：
# - IndexedDB CRUD 操作
# - 活动推荐规则
# - 里程碑流转逻辑
# - F 规则兴趣识别
# - 日期计算
```

**关键文件**：
- `js/db.js` — 数据库操作抽象
- `js/sync.js` — NAS 同步逻辑（API 地址配置后自动启用）
- `js/data/activities-complete.js` — 活动库（A-H 八模块结构）
- `js/data/milestones.js` — 里程碑库（10 维度）

**开发流程**：
1. 修改 `index.html` / `js/ui/*.js` / `css/app.css`
2. 刷新浏览器测试
3. 如涉及数据逻辑，补充单元测试 `tests/`
4. 确保 `npm test` 全通过

### 后端开发

```bash
cd server
npm install

# 本地开发（热重载）
npm run dev

# 生产部署（Docker）
docker-compose up -d

# 查看日志
docker logs -f qiqi-api
```

**API 端点**：
- `POST /api/auth/pin` — PIN 登录
- `GET /api/profile` — 获取档案
- `POST /api/records` — 保存记录
- `POST /api/diary` — 保存日记
- `POST /api/milestones/states` — 更新里程碑状态
- `GET /api/health` — 健康检查

详见 `server/src/index.ts`

---

## 🔒 数据安全

| 场景 | 数据存储位置 |
|-----|-----------|
| **仅用前端（不配置 API）** | 设备本地 IndexedDB |
| **配置 API 后** | 设备 IndexedDB + NAS 后端（SQLite） |
| **备份** | 导出 JSON 到本地文件 |

**同步机制**：
- 前端 push-only：发起操作时调用 sync.js，向后端推送数据
- 后端被动接收，无反向同步（保证单向流向）
- 如 API 地址未配置或不可达，同步静默跳过，不影响离线使用

---

## 🧪 测试

```bash
# 运行全量测试
npm test

# 预期结果
# ✓ 244/244 tests pass
```

**测试覆盖**：
- IndexedDB 数据库 CRUD（8 个 store）
- 活动库推荐算法（2 主 2 备）
- 里程碑状态流转
- F 规则兴趣识别（锚点机制）
- 日期和月龄计算
- 同步层 API 调用

---

## 📖 学习路径

### 我想快速用上 App
→ 打开 `index.html`，按照 App 内引导完成档案建立

### 我想理解蒙台梭利观察体系
→ 从 `分类方案/README.md` 的推荐路径 A（小白快速上手）开始

### 我想部署后端服务
→ 按照 `部署文档/QUICK-START.md` 运行 Docker Compose

### 我想为项目贡献代码
→ 阅读 `CLAUDE.md`，了解开发规范和技能分工

### 我想理解数据结构
→ 查看 `js/db.js`（IndexedDB schema）和 `js/data/` 的数据文件

---

## 📝 版本历史

**v2.1**（2026-04-28）
- ✅ sync.js 集成完成（push-only 增量同步）
- ✅ 前端 API 配置模块（地址 + PIN）
- ✅ 端到端验证通过（11 条记录 + 2 条日记 + 1 条里程碑）
- ✅ 部署文档完善

**v2.0**（2026-04-24）
- ✅ Tab 结构重构（5 → 4 个 Tab）
- ✅ M_Moments 时光页面（日记+活动+里程碑瀑布流）
- ✅ NAS 后端完成（Bun + SQLite）
- ✅ 浏览器 Golden Path 验收通过

**v1.8**（2026-04-21）
- ✅ 活动库完整（143 条 0-72 月）
- ✅ 里程碑库完整（216 条 10 维度）
- ✅ 244 个单元测试全通过

---

## 📞 支持

- **文档问题** → 查阅 `CLAUDE.md` 开发指南
- **功能 Bug** → 提交 Issue（含重现步骤）
- **功能建议** → 讨论部分见 `.planning/`
- **部署问题** → 参考 `部署文档/` 相关文件或 GIT-WORKFLOW.md

---

**最后的话**：这套系统最终只为一句话服务：**让你看见你的孩子，而不是看见你对孩子的期待。**

如果某一天你发现数据都漂亮但孩子眼中的光淡了——**立刻合上记录本，去陪他**。

---

*项目维护者：Zelin Zhang  
更新于 2026-04-28*
