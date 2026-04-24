# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库性质

本仓库是「起起教育」项目的工作目录，包含两个并行内容：

1. **蒙台梭利家庭观察体系**（`分类方案/`）：面向家长的育儿观察工具体系，纯 Markdown 文档
2. **起起成长 App**（PRD + 原型）：AI 辅助育儿系统的产品文档与前端原型

## 运行原型

原型为单文件纯前端，无需构建：

```bash
# 直接用浏览器打开
start prototype.html
```

文件自包含所有 CSS 和 JavaScript，无外部依赖。

## 文档体系结构

### 分类方案（蒙台梭利观察体系）

```
分类方案/
├── 00_体系说明.md          理念层：为什么做、给谁用、6 条原则
├── 01_通用观察评估准则.md   伦理层：成人角色、底线
├── 02_核心框架与模板.md    ⭐ 引擎层：所有活动共用的模板与规则（A-H 八模块）
├── 03_年龄段索引.md        导航层：0-6 岁每 3 月细分
├── 04_示例活动集_0-1岁.md  ⭐ 框架索引（维度覆盖矩阵，选活动先看这里）
├── 04_示例活动_0-1岁.md    详细卡库（25 张活动卡，查操作细节时翻这里）
├── 05_示例活动_3-4岁.md    3-4 岁示例（倒水练习完整案例）
├── 06_阶段汇总评估框架.md   复盘层：月/季/年评估
└── 07_新手SOP流程指引.md   ⭐ 执行层：7 步心跳 + 决策树 + 首月打卡清单
```

分层关系：理念层 → 伦理层 → **引擎层（02）** → 导航层 → 应用层 → 复盘层 → **执行层（07）**

**两个 04 的分工**：`04_示例活动集` 是框架索引（定方向），`04_示例活动` 是详细卡库（查细节）。使用顺序：先集后卡。

### 活动编号规则（02-H）

格式：`{领域前缀}-{月龄}-{序号}`，例如 `S-6-04`（感官/6月龄起/第4号）

| 前缀 | 领域 |
|------|------|
| P | 日常生活 Practical Life |
| S | 感官教育 Sensorial |
| M | 运动 Movement |
| L | 语言 Language |
| E | 社会情绪 Emotional/Social |
| C | 文化（3岁+） |
| N | 数学（3岁+） |

### 需求说明书（起起成长 App 主文档）

当前文件：`起起成长-需求说明书-v1.8.md`（内部版本已升至 **v2.0**，2026-04-24 更新）

**v2.0 新增内容**（Tab 重构 + NAS 后端 + 时光增删改，已实装，2026-04-24）：
- **Tab 结构重构**：活动库 Tab 移除，适龄活动库合并入今日 Tab 推荐下方；Tab 栏 5 个 → 4 个（今日 / 成长 / 时光 / 设置）
- **M_Moments（时光 Tab）**：新增，微信朋友圈式瀑布流，合并育儿日记 + 活动记录，支持完整增删改
  - 发：时光页右上角 + 按钮 → 日记 overlay
  - 改：点击卡片正文区 → 预填 overlay（日记 / 记录）
  - 删：× 按钮（原有）
- **成长 Tab 精简**：移除日记/活动记录时间线，仅保留里程碑分阶段导航
- **NAS 后端**（server/）：Bun + SQLite + Docker Compose，JWT PIN 认证，REST API（/api/health、/api/auth/pin、/api/profile、/api/records、/api/diary、/api/milestones/states）
- **前端同步层**（js/sync.js）：push-only fire-and-forget，未配置 API 时静默跳过，支持 pushRecord/pushDiary/pushProfile/pushMilestoneState/deleteRecord/deleteDiary/pullAll
- **日记字段说明**：diaryEntries 存储 `{changes, feelings, images:[{name,dataUrl}]}`，moments.js 合并显示两段内容

**v1.9 新增内容**（数据库全量完成 + PWA 修复，已实装）：
- 活动库全量完成：0-72月 143 条完整活动（`js/data/activities-complete.js`，2026-04-16）
- 里程碑库全量完成：0-72月 216 条完整（10维度，observeTip/linkedMilestones 100%，`js/data/milestones.js`，2026-04-17）
- CACHE_NAME 升至 qiqi-v4，SW 预缓存列表修正，domain 标签修复

**v1.8 新增内容**（bug修复 + 功能增强，已实装）：
- observeAnchor 填空引导：记录表单拆分 observeAnchor 为逐条问题，逐问填答后合并到 note
- M_ActivityTimeline：成长 Tab 活动记录时间线（`growth-records.js`，年/周折叠，支持编辑/删除）
- 历史记录管理迁移：从设置页移除，改至成长 Tab 时间线展示（v2.0 已移至时光 Tab）
- PWA 自动更新：`controllerchange` 事件 + 顶部提示条，CACHE_NAME 升至 qiqi-v3

**v1.7 新增内容**（用户内容管理模块，已实装）：
- M_Diary：育儿日记（今日 Tab + 按钮，成长 Tab 三级折叠时间线；v2.0 重构至时光 Tab）
- M_RecordEdit：今日记录编辑/删除（inline confirm）
- M_CustomActivity：自定义活动库管理（设置页，增查改删，合并入推荐）
- M_RecordManage：历史记录管理（v2.0 已迁移至时光 Tab）
- IndexedDB DB_VERSION 2，新增 Store 7 diaryEntries + Store 8 customActivities

**v1.6 新增内容**（已实装）：
- M2.5：活动↔里程碑双向联动（活动卡显示促进的里程碑，里程碑卡显示相关活动）
- M_GuideIntensity：引导强度切换（设置页 轻/中/重 三模式，适配父母成熟度）
- M4.5：正向会话结束卡片（记录后展示「本次观察的意义」反馈，自然结束）
- M8.5：月度复盘（蒙氏 10 维度评估 + 环境调整建议 + 优势发现）

该文档是双轨融合（分类方案 + App 设计）的产物，涵盖：数据结构、MVP 功能模块（M1-M9 + M_GuideIntensity + M_ObsGuide + M_Onboarding + M_MilestoneConfirm + M_ReEntry + M_Diary + M_RecordEdit + M_CustomActivity + M_RecordManage + **M_Moments**）、页面结构、技术规范。**开发以此文档为准，PRD 仅作历史参考。**

### PRD（起起成长 App）

当前版本：v0.4（草稿，已被需求说明书取代）

- **阶段零**：个人版，纯前端无服务端（MVP 已确认）
- **阶段一**：对外版，加入 API 服务 + 订阅鉴权
- **产品形态**：PWA/H5（手机端）+ API 服务（服务端）
- **开发方式**：Claude Code Vibe Coding

理论框架层次（从底到顶）：皮亚杰 → 蒙台梭利（主框架）→ RIE/瑞吉欧/正面管教/华德福（补充）→ 多元智能（评估层）

### prototype.html

单文件 H5 原型，模拟 375×780 手机框架。技术栈：原生 HTML/CSS/JS，无框架。
CSS 变量集中在 `:root`（颜色、圆角、阴影）；页面切换使用 `.page.active` 显示/隐藏；弹层分两类：`.modal`（全屏）和 `.overlay`（底部弹出）。

## MVP 开发范围

### 当前进度
- **状态**：v1.8 已实装，244 测试全通，浏览器 Golden Path 验收完成
- **活动库**：**0-72月（0-6岁）143 条完整数据**，`js/data/activities-complete.js`（2026-04-16 完成，Golden Path 14/14 通过）
- **里程碑库**：**0-72月 216 条完整**（10维度，observeTip/linkedMilestones 100%，`js/data/milestones.js`，2026-04-17）
- **数据文件**：`js/data/activities-complete.js`（活动主文件）+ `js/data/milestones.js`（里程碑主文件）

### 包含的功能模块（MVP P0）
| 模块 | 说明 |
|------|------|
| M1 | 孩子档案（出生日期、月龄自动计算） |
| M2 | 活动库（0-12月，H编号体系，5个观察引导新字段） |
| **M2.5** | **活动↔里程碑双向联动**（v1.6新） |
| M3 | 今日推荐（1主2备，规则驱动） |
| M4 | 观察记录（4字段：initType/focusSec/emotion/note） |
| **M4.5** | **正向会话结束卡**（v1.6新） |
| M5 | 7步心跳（折叠提示，非强制流程） |
| M6 | 里程碑对照（5维度分类，状态流转） |
| M6.5 | 情境化正向提示（不禁令，只支持） |
| M7 | F规则兴趣识别（锚点机制：专注时长必满+其他任意1项） |
| M8 | 周复盘（5问自检 + 连续性预警 + 下周关注方向） |
| **M8.5** | **月度复盘**（v1.6新，蒙氏10维度） |
| M9 | 数据导出/导入 |
| **M_GuideIntensity** | **引导强度切换**（v1.6新，轻/中/重模式） |
| M_ObsGuide | 4层观察引导（开始前焦点 → 计时锚点 → 提交反馈 → 下次阶段提示） |
| M_Onboarding | 首次使用引导（档案建立 → 使用路径说明） |
| M_MilestoneConfirm | 里程碑达成确认（弹出 observeTip 引导） |
| M_ReEntry | 断记重返路径（≥3天无记录时欢迎回来卡） |
| **M_Diary** | **育儿日记**（v1.7新，今日+按钮，成长Tab三级折叠时间线） |
| **M_RecordEdit** | **今日记录编辑/删除**（v1.7新，inline confirm） |
| **M_CustomActivity** | **自定义活动库管理**（v1.7新，设置页增查改删） |
| **M_RecordManage** | **历史记录管理**（v1.7新，设置页分页查删） |

### 延后 P1 的功能
- Claude API 接入 + AI 周方案生成
- AI 里程碑分析、兴趣报告
- 月/季度复盘的 AI 辅助
- 多照料者支持

## 关键概念速查表

### H 编号体系（活动分类）
- **格式**：`{领域前缀}-{月龄}-{序号}`，如 `S-6-04`
- **前缀**：P(日常生活) / S(感官) / M(运动) / L(语言) / E(社会情绪) / C(文化) / N(数学)
- **用途**：统一编码规则，便于跨文档引用和数据库查询

### A-H 八模块（活动数据结构）
来自 `02_核心框架与模板.md`：
- **A1**：基础信息（id、年龄范围、维度、敏感期、WHO领域）
- **A2**：材料与环境（物料清单、场地要求、错误控制）
- **A3**：操作指引（3-5步详细说明）
- **A4**：可观测指标（v1.5+：observeAnchor/observeFocus[]/phases[]/linkedMilestones[]/theoryBite）
- **B**：记录表（4字段：initType/focusSec/emotion/note）
- **F**：快速判定（兴趣识别 5 项规则，锚点为专注时长）
- **G**：优势领域（G.3 映射表：兴趣信号 → 环境准备方向）
- **H**：编号体系

### F规则锚点机制（兴趣识别）
- **必须满足**：第2项「专注超典型50%」（focusSec > typicalSec × 1.5）
- **加分项**：单日重复≥3次 / 连续3天主动 / 拓展/迁移行为
- **结果**：满足锚点 + 任意1加分项 → 标注「兴趣候选」并开启4周追踪

### 数据存储（IndexedDB）
DB_VERSION: **2**（v1.7 升级，新增 Store 7/8）

| Store | 用途 | 更新频率 |
|-------|------|--------|
| `profile` | 孩子档案 | 低（设置页编辑） |
| `records` | 观察记录 | 高（每次活动，含 updateRecord/deleteRecord） |
| `milestones` | 里程碑库 | 低（标记达成）|
| `monthlyReviews` | 月度评估 | 月度（M8.5）|
| `settings` | 设置（含 guideIntensity）| 低（手动修改） |
| `milestoneStates` | 里程碑达成状态 | 低（父母标记） |
| **`diaryEntries`** | **育儿日记**（v1.7新，autoIncrement）| 不定期（父母写日记） |
| **`customActivities`** | **自定义活动库**（v1.7新，id='custom-{ts}'）| 低（手动维护） |

## 当前文件清单

### 核心规范文档
| 文件 | 版本 | 用途 |
|------|------|------|
| `起起成长-需求说明书-v1.7.md` | **v1.7** | **开发主文档**，详细功能规范 + 数据结构 + 技术栈 |
| `起起成长-需求说明书-v1.5.md` | v1.6 | 历史归档（v1.7 的基础版本） |
| `分类方案/02_核心框架与模板.md` | 参考 | A-H 八模块定义，所有活动共用模板 |
| `分类方案/04_示例活动集_0-1岁.md` | 参考 | 活动框架索引，维度覆盖矩阵 |
| `分类方案/04_示例活动_0-1岁.md` | 参考 | 25张活动卡详细内容 |
| `分类方案/07_新手SOP流程指引.md` | 参考 | 7步心跳 + 周复盘5问 |

### 数据文件（活动与里程碑）
| 文件 | 内容 | 状态 |
|------|------|------|
| `js/data/activities-complete.js` | **0-72月 143条完整活动**（2026-04-16，Golden Path 14/14 通过） | ✅ **主文件** |
| `js/data/activities.js` | 旧版 0-6月 7条 | ⚠️ DEPRECATED，勿引用 |
| `js/data/milestones.js` | **0-72月 216条完整里程碑**（10维度，observeTip/linkedMilestones 100%，2026-04-17） | ✅ **主文件** |
| `milestone-sample-phase1.js` | 9条示范里程碑（历史归档） | ⚠️ 已被 milestones.js 取代 |
| `activity-sample-phase1.js` | 3条示范活动（历史归档） | 参考 |
| `PHASE2-COMPLETION-REPORT.md` | Phase 2 完成报告 | 参考 |
| `PHASE1-REVIEW-CHECKLIST.md` | Phase 1 评审清单 | 参考 |

### 前端原型与实装代码
| 文件/目录 | 用途 |
|------|------|
| `prototype.html` | 视觉参考原型，新起代码开发（不直接修改） |
| `index.html` | 实装主入口（含 overlay 骨架：diary-overlay / custom-act-overlay） |
| `js/db.js` | IndexedDB 封装（DB_VERSION 2，8个store，含 diary/customActivity CRUD） |
| `js/app.js` | 应用入口（初始化 + 事件总线 + customActs 合并） |
| `js/ui/diary.js` | 育儿日记模块（M_Diary，图片压缩 + 时间线渲染） |
| `js/ui/custom-activity.js` | 自定义活动 overlay（M_CustomActivity） |
| `js/ui/today.js` | 今日 Tab（含记录编辑/删除，M_RecordEdit） |
| `js/ui/settings.js` | 设置页（含历史记录管理 + 自定义活动管理） |
| `css/app.css` | 样式（含日记时间线、缩略图、inline-confirm 样式） |

## 开发前检查清单

启动开发时，确认以下内容：

- [x] 需求说明书 v1.8 已实装（244 测试全通，Golden Path 验收通过）
- [x] 活动库完整（**143条 0-72月**，`js/data/activities-complete.js`，14/14 验收通过，2026-04-16）
- [x] 里程碑库完整（**216条 0-72月**，observeTip/linkedMilestones 100%，`js/data/milestones.js`，2026-04-17）
- [x] IndexedDB schema 包含全部 8 个 store（DB_VERSION 2）
- [x] 原型 CSS 变量完整迁移
- [x] 轻/中/重三模式切换逻辑已实现（guideIntensity 全局状态）
- [x] 育儿日记 overlay + 时间线已实装（Store 7 diaryEntries）
- [x] 自定义活动 overlay 已实装（Store 8 customActivities）
- [x] 今日记录编辑/删除已实装（updateRecord / deleteRecord）
- [x] 设置页历史记录管理 + 自定义活动管理已实装

## 写作规范（Markdown 文档）

- 所有 `.md` 文件顶部有 YAML frontmatter，包含 `version`、`last_updated`、`changelog`
- 版本号：小修末位 +1（v1.0 → v1.1），结构性变更中位 +1（v1.1 → v2.0）
- 活动卡采用统一模板（`02_核心框架与模板.md` A 部分），修改活动内容需保持模板字段完整
- 记录表字段固定 11 项（02-B），不得随意增删

## 特殊说明

- **多源融合**：本项目结合了 WHO、CDC、蒙台梭利、皮亚杰、多元智能等多个理论框架。需求说明书中每条规范都有理论依据。
- **小白父母导向**：系统设计最终目标是让新手父母也能"学会观察"，而不仅是记录。UI 复杂度通过「轻/中/重」模式在原型层面解决。
- **数据库已全量完成**：活动库 143条（0-72月）+ 里程碑库 216条（0-72月，10维度），P0 阶段数据基础完整，P1 专注 AI 功能引入。
- **无 AI 约束**：MVP 不包含任何 AI 调用，所有推荐和识别均为规则驱动（F规则、G规则）。P1 才引入 Claude API。
