---
version: 2.1
last_updated: 2026-04-28
description: 项目文档导航主页 - 快速定位各类文档
---

# 📚 起起教育 · 文档导航

欢迎来到起起教育项目的文档中心。根据你的需求选择对应的文档类别。

---

## 🚀 快速开始

**初次接触项目？从这里开始**

- [📱 App 用户] → 打开 `index.html`，按 App 内引导操作；或读 `montessori-system/07_新手SOP流程指引.md`
- [👨‍💻 开发者] → 读根目录 `CLAUDE.md`（开发规范、文件结构、checklist）
- [🖥️ 部署者] → 读 `deployment/QUICK-START.md`（5 分钟启动后端服务）

---

## 📖 文档目录

### 📱 [产品与需求](product/)
产品设计、需求规范、功能清单

| 文件 | 用途 |
|-----|------|
| `requirements-v2.1.md` | ✅ 需求说明书 v2.1（当前版本，**开发以此为准**） |
| `prd.md` | 📋 产品需求文档（参考，已被需求说明书取代） |

👉 **推荐**：先读 `requirements-v2.1.md`，了解产品现状

---

### 🏗️ [系统架构](architecture/)
技术架构、系统设计、数据结构

| 文件 | 用途 |
|-----|------|
| `README.md` | ✅ 架构概览（架构图 + 模块说明）|
| ~~`system-design.md`~~ | 📝 计划中 |
| ~~`frontend-architecture.md`~~ | 📝 计划中 |
| ~~`backend-architecture.md`~~ | 📝 计划中 |
| ~~`database-schema.md`~~ | 📝 计划中 |
| ~~`api-specification.md`~~ | 📝 计划中（当前参考 `server/src/index.ts`） |

👉 **推荐**：开发前先读 `architecture/README.md`，完整 schema 查看 `js/db.js` 和 `server/src/index.ts`

---

### 📖 [学习和使用指南](guides/)
用户指南、学习路径、观察体系说明

| 文件 | 用途 |
|-----|------|
| ~~`app-usage-guide.md`~~ | 📝 计划中 |
| ~~`montessori-quick-guide.md`~~ | 📝 计划中 |
| ~~`learning-paths.md`~~ | 📝 计划中 |

还有完整的蒙台梭利体系文档，见下面的 [蒙台梭利观察体系](#蒙台梭利观察体系)

👉 **推荐**：家长直接从 `montessori-system/07_新手SOP流程指引.md` 开始

---

### 🚀 [部署和运维](deployment/)
部署指南、配置说明、故障排查

| 文件 | 用途 |
|-----|------|
| `quick-start.md` | ⚡ 5 分钟快速启动（推荐） |
| `deployment-guide.md` | 📖 完整部署指南 |
| `docker-setup.md` | 🐳 Docker 和 Docker Compose 配置 |
| `api-configuration.md` | ⚙️ API 地址和 PIN 码配置 |
| `https-ddns-setup.md` | 🔒 HTTPS 和动态域名配置 |
| `monitoring.md` | 📊 监控、日志和健康检查 |
| `troubleshooting.md` | 🔧 常见问题排查 |

👉 **推荐**：新手从 `quick-start.md` 开始，5 分钟启动

---

### 🛠️ [开发指南](development/)
开发规范、代码标准、测试方法

| 文件 | 用途 |
|-----|------|
| ~~`setup.md`~~ | 📝 计划中 |
| ~~`coding-standards.md`~~ | 📝 计划中 |
| ~~`testing-guide.md`~~ | 📝 计划中 |
| ~~`git-workflow.md`~~ | 📝 计划中（当前参考 `docs/deployment/GIT-WORKFLOW.md`） |
| ~~`contributing.md`~~ | 📝 计划中 |

**现有开发规范**：根目录的 `CLAUDE.md`（最权威）

👉 **推荐**：开发者直接读根目录 `CLAUDE.md`

---

### 📋 [参考资料](reference/)
术语表、文件结构、版本历史、常见问题

| 文件 | 用途 |
|-----|------|
| `project-navigation-guide.md` | ✅ 详细的项目导航速查表 |
| `M-GUIDINTENSITY-MATRIX.md` | ✅ 引导强度（轻/中/重）矩阵参考 |
| ~~`glossary.md`~~ | 📝 计划中（术语表：H编号、蒙氏10维度等） |
| ~~`file-structure.md`~~ | 📝 计划中（完整文件结构说明见 `CLAUDE.md`） |
| ~~`version-history.md`~~ | 📝 计划中（版本历史见各需求文档 changelog） |
| ~~`faq.md`~~ | 📝 计划中 |
| ~~`design-decisions.md`~~ | 📝 计划中（历史设计见 `archives/design-archives/`） |

👉 **推荐**：遇到问题时查看 `project-navigation-guide.md`

---

### 🎓 [蒙台梭利观察体系](montessori-system/)
完整的蒙台梭利观察、记录、评估体系

这是项目的理论基础和实践框架，包含 9 个文档：

| 编号 | 文件 | 说明 |
|-----|------|------|
| 00 | `00_体系说明.md` | 理念层 — 为什么做、给谁用、6 条伦理原则 |
| 01 | `01_通用观察评估准则.md` | 伦理层 — 成人角色、底线、隐私保护 |
| 02 | `02_核心框架与模板.md` | ⭐ 引擎层 — A-H 八模块定义（最重要） |
| 03 | `03_年龄段索引.md` | 导航层 — 0-6 岁每 3 月细分 |
| 04 | `04_示例活动集_0-1岁.md` | 应用层 · 框架索引 — 维度覆盖矩阵 |
| 04b | `04_示例活动_0-1岁.md` | 应用层 · 卡库 — 25 张活动详细卡 |
| 05 | `05_示例活动_3-4岁.md` | 应用层 — 倒水练习完整示例 |
| 06 | `06_阶段汇总评估框架.md` | 复盘层 — 月/季/年评估 |
| 07 | `07_新手SOP流程指引.md` | ⭐ 执行层 — 7 步心跳 + 决策树 |

**分层理解**：理念 → 伦理 → 引擎 → 导航 → 应用 → 复盘 → 执行

**推荐学习路径**：
- 🚀 **快速上手**：README → 07 → 03 → 04_集 → 实践
- 📚 **系统学习**：00 → 01 → 02 → 03 → 04 → 07 → 实践

👉 **推荐**：家长从 `07_新手SOP流程指引.md` 开始

---

### 📦 [历史和归档](archives/)
已完成的阶段、历史设计方案、旧版本

| 目录 | 用途 |
|-----|------|
| `phase-reviews/` | ✓ Phase 1、Phase 2 的评审和完成报告 |
| `design-archives/` | 📐 历史设计方案、讨论稿 |
| `old-versions/` | 📝 v1.5 等旧版本需求文档 |

---

## 🎯 按角色快速导航

### 我是**家长用户**（想学会观察孩子）
1. 先读 `guides/montessori-quick-guide.md`（10 分钟）
2. 打开 `montessori-system/07_新手SOP流程指引.md`（30 分钟）
3. 按照 7 步心跳开始实践

### 我是**App 用户**（想数字化记录）
1. 打开 App（`index.html`）
2. 跟随 App 内引导完成档案建立
3. 遇到问题看 `reference/faq.md`

### 我是**开发者**（想贡献代码）
1. 读 `development/setup.md`（15 分钟）
2. 读 `development/contributing.md`（20 分钟）
3. 查看 `development/coding-standards.md`
4. 提交 PR 前运行 `npm test`

### 我是**部署者**（想启动后端）
1. 读 `deployment/quick-start.md`（5 分钟）
2. 运行 `docker-compose up -d`
3. 在 App 设置页配置 API 地址

### 我是**架构师**（想理解系统设计）
1. 读 `architecture/system-design.md`
2. 查看 `architecture/frontend-architecture.md` 和 `backend-architecture.md`
3. 查阅 `architecture/database-schema.md` 和 `api-specification.md`

---

## 📊 项目状态速览

| 指标 | 状态 |
|-----|------|
| **项目版本** | v2.1 |
| **活动库** | ✅ 143 条（0-72 月完整） |
| **里程碑库** | ✅ 216 条（10 维度完整） |
| **单元测试** | ✅ 244/244 通过 |
| **功能实装** | ✅ M1-M9 全部完成 |
| **数据同步** | ✅ sync.js 集成、NAS 后端验证 |
| **部署方式** | ✅ Docker + Docker Compose |

---

## 🔗 其他重要文件

### 根目录（项目根本）
- **[README.md](../README.md)** — 项目主入口，功能概览
- **[CLAUDE.md](../CLAUDE.md)** — 开发规范和技能分工（必读）

### 源代码目录
- **`index.html` / `js/` / `css/`** — 前端代码（HTML / CSS / Vanilla JS）
- **`server/`** — 后端代码（Bun / TypeScript / SQLite）
- **`tests/`** — 单元测试（244 个）

### 项目管理
- **.planning/** — GSD 项目规划和阶段文档
- **memory/** — 项目内存和工作笔记

---

## 💡 文档维护规范

所有文档都遵循以下规范：

- **Frontmatter**：包含 `version`, `last_updated`, `description`
- **版本号**：v主.次（如 v2.1）
- **更新日期**：YYYY-MM-DD 格式
- **Changelog**：每个主要版本记录变更

这确保文档可追踪、可维护。

---

## 🆘 找不到你要的文档？

1. 查看 [`reference/project-navigation-guide.md`](reference/project-navigation-guide.md) — 详细的导航速查表
2. 按 Ctrl+F 搜索关键词
3. 查看根目录的 [`README.md`](../README.md) — 项目主入口

---

**最后更新**：2026-04-28  
**下一次计划更新**：里程碑完成后（预计每周）
