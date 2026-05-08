# 项目 Harness 指令

## 工作流自动路由

**每次对话开始时，AI 必须按以下规则检测项目阶段并路由到正确的 Skill。按顺序检查，命中即执行，不可跳阶段。**

### 阶段检测与路由表

| 阶段 | 检测条件 | 调用 Skill | 产出 → 写入 |
|------|---------|-----------|------------|
| 0. 存量接入 | `.claude/.brownfield` 标记存在 | 自动扫描代码库（按 rules/08 执行指南） | 推断产出 → docs/01-03（用户确认后锁定） |
| 1. 需求锚定 | docs/01 包含【待填充】或【待AI生成】 | `brainstorming` | 用户画像、痛点、价值主张 → docs/01 |
| 2. MVP 功能规划 | docs/02 包含【功能名称】占位符 | 基于 docs/01 痛点推导 | Must have 功能清单（≤5个）→ docs/02 |
| 3. 验收标准制定 | docs/03 包含【功能1名称】占位符 | 基于 docs/02 逐功能生成 | 每个 Must have 的验收条件 → docs/03 |
| 4. 核心信息锁定 | CLAUDE.md 产品核心信息包含【待填充】 | 从 docs/01 提取摘要 | 一句话定位 + 用户 + 痛点 → CLAUDE.md |
| 5. 项目初始化 | .planning/ 目录不存在 | `/gsd-new-project` | .planning/ 结构 + 里程碑 |
| 6. 开发规划 | 当前阶段无 PLAN.md | `/gsd-plan-phase` | PLAN.md |
| 7. UI/UX 设计 | docs/07 含【待填充】且 PLAN.md 含 UI 关键词 | `ui-ux-pro-max` + Pencil MCP | 设计稿 + 视觉规范 → docs/07 + .pen 文件 |
| 8. 迭代开发 | PLAN.md 存在但有未完成任务 | `/gsd-execute-phase`（前端任务同时调用 `front-end-design`） | 代码实现 |
| 9. 代码审查 | 有未审查的代码变更 | `requesting-code-review` | 审查报告 |
| 10. UI 视觉审查 | 审查通过，且本迭代涉及前端文件 | `front-end-design` | UI 一致性报告 |
| 11. 功能测试 | UI审查通过（或跳过），未执行验收测试 | Chrome DevTools MCP | 测试报告 → docs/测试报告归档/ |
| 12. 交付更新 | 测试通过 | 自动更新 | docs/04 + docs/05 + docs/06 + docs/07 + git commit |

> **阶段 0 优先检测**：检测到 `.claude/.brownfield` 标记时，跳过阶段 1-12 的条件检测，直接进入阶段 0。

### 阶段详细执行规则

#### 阶段 0：存量项目接入（扫描推断 → docs/01-03）

**触发**：检测到 `.claude/.brownfield` 标记文件存在。

**背景**：存量项目已有代码，但 Harness 体系需要 docs/01-03 作为开发决策锚点。阶段 0 的任务是从代码中"反向推断"产品信息，而非从零开始 brainstorming。

**执行**：
1. 告知用户："检测到存量项目接入标记，现在进行存量项目扫描，无需从头 brainstorming"
2. 扫描项目现状（只读，不修改任何文件）：
   - **代码结构**：语言、框架、主要目录、入口文件
   - **已有文档**：README.md、CHANGELOG.md、现有 docs/ 内容
   - **功能清单**：从路由文件、API 定义、菜单配置等推断主要功能
   - **测试覆盖**：已有测试文件数量和覆盖范围
   - **git 历史**：最近 10 条 commit 摘要，了解项目演进方向
3. 基于扫描结果，**起草** docs/01-03 的存量版内容：
   - docs/01：从 README + 代码推断产品定位、用户、痛点（标注"AI 推断，请确认"）
   - docs/02：从代码功能推断 Must have 清单（标注已有功能，区分待开发功能）
   - docs/03：从已有测试推断验收标准草案（无测试的功能标注"待制定"）
4. 将草案呈现给用户确认："以上是 AI 根据代码推断的产品信息，是否准确？请逐项确认或修正"
5. 用户确认后，将确认内容写入 docs/01-03，替换占位符
6. 写入完成后，**删除** `.claude/.brownfield` 标记文件

**退出条件**：`.claude/.brownfield` 标记已删除，docs/01-03 无占位符，用户已确认。

**退出后动作**：告知用户"存量项目接入完成，自动进入阶段 4：锁定核心信息到 CLAUDE.md"。

**注意**：
- 存量代码无需补写测试（若 `.claude/.brownfield-baseline` 存在，pre-commit hook 自动豁免基准 commit 之前的文件）
- docs/ 中已存在的文档（如 README）保留原位，不替换

---

#### 阶段 1：需求锚定（brainstorming → docs/01）

**触发**：读取 docs/01-产品核心定位.md，发现包含【待填充】或【待AI生成】。

**执行**：
1. 告知用户："项目处于需求锚定阶段，现在调用 brainstorming 帮你梳理产品定位"
2. 调用 `brainstorming` skill
3. 引导用户完成以下产出：
   - 产品一句话价值主张
   - 核心目标用户画像
   - 用户 Top3 核心痛点
   - 产品差异化优势
   - 产品长期愿景
4. 每项产出需用户确认（"这个定位准确吗？需要调整吗？"）
5. 全部确认后，将产出写入 docs/01-产品核心定位.md，替换所有占位符

**退出条件**：docs/01 无任何【待填充】/【待AI生成】占位符，用户已确认。

**退出后动作**：告知用户"产品定位已锁定，自动进入阶段 2：MVP 功能规划"。

---

#### 阶段 2：MVP 功能规划（docs/01 → docs/02）

**触发**：读取 docs/02-MVP功能清单.md，发现包含【功能名称】占位符。

**执行**：
1. 读取 docs/01 中已确认的痛点列表
2. 针对每个核心痛点，提出 1-2 个功能建议
3. 按 MoSCoW 法则分类：
   - Must have：最多 5 个，每个必须对应解决某个核心痛点
   - Should have：二期迭代候选
   - Could have：远期优化
   - Won't have：明确不做的功能（锁定边界）
4. 逐条向用户确认："这个功能是否必须？优先级对吗？"
5. 确认后写入 docs/02-MVP功能清单.md

**退出条件**：docs/02 Must have 部分有具体功能名称和对应痛点，无占位符，用户已确认。

**退出后动作**：告知用户"MVP 范围已锁定，自动进入阶段 3：验收标准制定"。

---

#### 阶段 3：验收标准制定（docs/02 → docs/03）

**触发**：读取 docs/03-功能验收标准.md，发现包含【功能1名称】占位符。

**执行**：
1. 读取 docs/02 中 Must have 清单
2. 逐个功能生成验收标准草案，每个功能包含：
   - 用户可以【具体操作】，实现【具体效果】
   - 当【具体场景】时，系统给出【具体反馈】
   - 不允许出现【具体问题】
   - 全流程操作步骤不超过【具体数字】步
3. 标准必须"零代码可验证"——用户看得到、操作得了、判断得出
4. 逐条向用户确认："这个验收条件合理吗？"
5. 确认后写入 docs/03-功能验收标准.md

**退出条件**：docs/03 每个 Must have 功能都有具体验收标准，无占位符，用户已确认。

**退出后动作**：告知用户"验收标准已锁定，自动进入阶段 4：锁定核心信息"。

---

#### 阶段 4：核心信息锁定（docs/01 → CLAUDE.md）

**触发**：CLAUDE.md 的"产品核心信息"段仍包含【待填充】。

**执行**：
1. 从 docs/01 中提取：
   - 产品定位（一句话）
   - 目标用户（一句话）
   - 核心痛点（Top3 列表）
2. 更新 CLAUDE.md 中的"产品核心信息"段
3. 告知用户更新内容

**退出条件**：CLAUDE.md 产品核心信息段无占位符。

**退出后动作**：告知用户"核心信息已锁定到 CLAUDE.md，后续所有开发围绕此定位展开。自动进入阶段 5：项目初始化"。

---

#### 阶段 5：项目初始化（/gsd-new-project）

**触发**：项目根目录下 .planning/ 目录不存在。

**执行**：
1. 告知用户："现在调用 /gsd-new-project 创建项目结构和里程碑"
2. 调用 `/gsd-new-project` skill
3. 基于 docs/01 的产品定位和 docs/02 的 MVP 功能清单，创建项目里程碑

**退出条件**：.planning/ 目录已创建，包含 PROJECT.md 和 ROADMAP.md。

**退出后动作**：告知用户"项目结构已创建，自动进入阶段 6：开发规划"。

---

#### 阶段 6：开发规划（/gsd-plan-phase）

**触发**：当前阶段没有 PLAN.md。

**执行**：
1. 告知用户："现在调用 /gsd-plan-phase 制定开发计划"
2. 调用 `/gsd-plan-phase` skill
3. 基于 docs/02 的 Must have 功能清单和 docs/03 的验收标准，制定具体开发计划

**退出条件**：PLAN.md 已创建。

**退出后动作**：告知用户"开发计划已就绪，自动进入阶段 7：UI/UX 设计"。

---

#### 阶段 7：UI/UX 设计（ui-ux-pro-max + Pencil MCP → docs/07）

**触发**：读取 PLAN.md，发现包含 UI/前端相关任务，且 docs/07-UI设计交付.md 包含【待填充】。

**跳过条件**：PLAN.md 不包含任何 UI/前端关键词（UI、界面、前端、页面、组件、样式、CSS、HTML、React、Vue、布局、交互）时，告知用户"当前迭代无 UI 任务，跳过设计阶段"，直接进入阶段 8。

**执行**：
1. 告知用户："项目涉及 UI 功能，现在调用 ui-ux-pro-max 进行设计"
2. 调用 `ui-ux-pro-max` skill
3. 基于 docs/01 产品定位和 docs/02 功能清单，进行：
   - 视觉风格选型（配色方案、字体体系）
   - 核心页面线框图（使用 Pencil MCP 创建 .pen 设计稿）
   - 组件库定义（按钮、表单、卡片等基础组件规范）
   - 交互流程图（关键用户操作路径）
4. 每项产出需用户确认（"这个设计方案可以吗？需要调整吗？"）
5. 确认后将设计规范写入 docs/07-UI设计交付.md，设计稿保存为 .pen 文件

**退出条件**：docs/07 无【待填充】占位符，用户已确认设计方案。

**退出后动作**：告知用户"设计方案已锁定，自动进入阶段 8：迭代开发。开发过程中将自动对照设计规范"。

---

#### 阶段 8：迭代开发（/gsd-execute-phase + front-end-design）

**触发**：PLAN.md 存在且有未完成的任务。

**执行**：
1. 告知用户："现在调用 /gsd-execute-phase 开始开发"
2. 调用 `/gsd-execute-phase` skill
3. 按 PLAN.md 逐任务执行
4. 开发涉及前端文件时，每完成一个 UI 组件/页面：
   - 调用 `front-end-design` skill 进行实时视觉校验
   - 对照 docs/07-UI设计交付.md 确认样式一致性
   - 如有偏差，立即修正后继续
5. 每完成一个功能后：
   - 运行单元测试
   - 更新 docs/04-变更日志.md
   - 更新 docs/05-项目进展.md

**退出条件**：PLAN.md 中所有任务标记为完成。

**退出后动作**：告知用户"开发完成，自动进入阶段 9：代码审查"。

---

#### 阶段 9：代码审查（requesting-code-review）

**触发**：阶段 8 完成后，代码未经审查。

**执行**：
1. 告知用户："现在调用 requesting-code-review 进行代码审查"
2. 调用 `requesting-code-review` skill
3. 审查所有代码变更
4. 如有问题，修复后重新审查

**退出条件**：审查通过，无阻塞性问题。

**退出后动作**：告知用户"代码审查通过，自动进入阶段 10：UI 视觉审查"。

---

#### 阶段 10：UI 视觉审查（front-end-design）

**触发**：阶段 9 代码审查通过，且本迭代涉及前端文件变更。

**跳过条件**：本迭代无前端文件变更时，告知用户"本迭代无前端变更，跳过 UI 视觉审查"，直接进入阶段 11。

**执行**：
1. 告知用户："代码审查通过，现在调用 front-end-design 进行 UI 视觉一致性审查"
2. 调用 `front-end-design` skill
3. 对照 docs/07-UI设计交付.md 中的设计规范，审查：
   - 颜色/字体是否符合设计规范
   - 组件样式是否与设计稿一致
   - 响应式布局是否正确
   - 交互效果是否符合设计预期
   - 无障碍性（A11y）基础检查
4. 如有偏差，生成修复建议并执行修复
5. 修复后重新审查，直到视觉一致

**退出条件**：前端代码与设计规范一致，无视觉偏差。

**退出后动作**：告知用户"UI 视觉审查通过，自动进入阶段 11：功能测试"。

---

#### 阶段 11：功能测试（Chrome DevTools MCP）

**触发**：UI 视觉审查通过（或跳过），未执行功能验收测试。

**执行**：
1. 读取 docs/03-功能验收标准.md
2. 使用 Chrome DevTools MCP 打开浏览器
3. 逐条验证验收标准
4. 生成测试报告，归档到 docs/测试报告归档/

**退出条件**：所有验收标准通过。

**退出后动作**：告知用户"所有功能测试通过，自动进入阶段 12：交付"。

---

#### 阶段 12：交付更新

**触发**：测试通过。

**执行**：
1. 更新 docs/04-变更日志.md：记录本次迭代的所有变更
2. 更新 docs/05-项目进展.md：更新完成度和已完成事项
3. 更新 docs/06-后续计划.md：规划下一迭代任务
4. 如本迭代涉及 UI，更新 docs/07-UI设计交付.md 中的实现状态
5. 执行 git commit 保存最终状态
6. 调用 `neat-freak` skill 执行知识清洁审计（记忆去重/纠错/清过期 + 文档引用校验 + Harness 专项健康检查）
7. 告知用户："本轮迭代完成，项目已交付"（附上 neat-freak 变更摘要）

---

### 阶段间过渡规则

1. **每个阶段结束后，AI 必须自动检测下一阶段的触发条件并继续推进**，无需用户手动指示
2. **用户随时可以说"暂停"**，AI 调用 `/gsd-pause-work` 保存上下文
3. **用户说"恢复"或新会话检测到 .planning/**，AI 调用 `/gsd-resume-work` 恢复上下文
4. **用户说"进度"**，AI 调用 `/gsd-progress` 展示当前状态
5. **出现 bug 时**，AI 调用 `/gsd-debug` 或 `systematic-debugging` 进行排查

---

## 产品核心信息
- 产品定位：让家长看见孩子真实成长 —— 蒙台梭利家庭观察体系 + PWA App
- 目标用户：新手父母 + 蒙台梭利教育者（0-6 岁儿童家长）
- 核心痛点：
  1. 观察无体系 —— 缺乏结构化观察框架，无法判断观察价值
  2. 活动库不适龄 —— 通用活动库与蒙台梭利发展阶段不匹配
  3. 成长不可见 —— 无法量化追踪孩子长期成长轨迹和发展阶段

## 开发范围锁定
- 仅开发 docs/02-MVP功能清单.md 中 Must have 清单内的功能
- 禁止自行新增功能、扩大范围、优化非核心体验
- 任何范围变更须用户明确批准

## 开发纪律
- 进入开发阶段前，先检查 docs/03-功能验收标准.md 是否已填充完成（不含【待填充】占位符），未完成则拒绝开发并提示用户先完成验收标准确认
- 每次修改代码前，先阅读 docs/03-功能验收标准.md 确认验收条件
- 每完成一个功能后，主动执行单元测试，确保通过
- 每完成一个功能后，更新 docs/04-变更日志.md、docs/05-项目进展.md
- 每个迭代开始前，执行 git commit 创建检查点
- 禁止修改 .claude/、CLAUDE.md、package.json 等核心配置文件，如需修改须先获得用户批准

## 文档引用
- 产品定位详情：docs/01-产品核心定位.md
- MVP 功能清单：docs/02-MVP功能清单.md
- 功能验收标准：docs/03-功能验收标准.md
- 变更日志：docs/04-变更日志.md
- 项目进展：docs/05-项目进展.md
- 后续计划：docs/06-后续计划.md
- UI 设计交付：docs/07-UI设计交付.md

## 初始化模式
- 当用户要求搭建或重建 Harness 体系时，先创建 .claude/.harness-init 标记文件
- 完成所有文件部署后，立即删除 .claude/.harness-init 标记文件
- 删除标记后，执行第五章验证步骤确认体系生效
- 如果检测到 .claude/.harness-init 文件残留但初始化已完成或中断，立即删除该文件并告知用户

---

## 项目定制信息

### 仓库性质

本仓库是「起起教育」项目的工作目录，包含两个并行内容：

1. **蒙台梭利家庭观察体系**（`docs/montessori-system/`）：面向家长的育儿观察工具体系，纯 Markdown 文档
2. **起起成长 App**（前端 PWA + NAS 后端）：AI 辅助育儿系统的实装代码

### 运行应用

```bash
# 实装应用（IndexedDB + PWA）
npx serve . --listen 3000
# 访问 http://localhost:3000/index.html
# 视觉参考原型（不可修改）
start prototype.html

# 后端服务（可选，数据同步）
cd server && docker-compose up -d
```

### 文档体系结构

#### 蒙台梭利观察体系（docs/montessori-system/）

```
docs/montessori-system/
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

#### 活动编号规则（02-H）

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

#### 需求说明书（起起成长 App 主文档）

当前文件：`docs/product/requirements-v2.1.md`（**v2.1**，2026-04-28 最终状态）

**v2.0 新增内容**（Tab 重构 + NAS 后端 + 时光增删改 + sync.js 集成，已验证完成，2026-04-24~28）：
- **Tab 结构重构**：活动库 Tab 移除，适龄活动库合并入今日 Tab 推荐下方；Tab 栏 5 个 → 4 个（今日 / 成长 / 时光 / 设置）
- **M_Moments（时光 Tab）**：新增，微信朋友圈式瀑布流，合并育儿日记 + 活动记录，支持完整增删改
  - 发：时光页右上角 + 按钮 → 日记 overlay
  - 改：点击卡片正文区 → 预填 overlay（日记 / 记录）
  - 删：× 按钮（原有）
- **成长 Tab 精简**：移除日记/活动记录时间线，仅保留里程碑分阶段导航
- **NAS 后端**（server/）：Bun + SQLite + Docker Compose，JWT PIN 认证，REST API（/api/health、/api/auth/pin、/api/profile、/api/records、/api/diary、/api/milestones/states）
- **前端同步层**（js/sync.js）：push-only fire-and-forget，未配置 API 时静默跳过，支持 pushRecord/pushDiary/pushProfile/pushMilestoneState/deleteRecord/deleteDiary/pullAll
- **sync.js 集成与验证**（2026-04-28 完成）：
  - ✅ `js/ui/record.js`：保存记录后调用 pushRecord()，观察记录实时同步到 NAS
  - ✅ `js/ui/diary.js`：保存日记后调用 pushDiary()，育儿日记实时同步到 NAS
  - ✅ `js/ui/milestones.js`：标记里程碑后调用 pushMilestoneState()，里程碑达成状态实时同步到 NAS
  - ✅ `js/ui/settings.js`：新增 NAS API 配置区块（地址 + PIN 码），编辑档案后调用 pushProfile()
  - ✅ 浏览器端 Service Worker 缓存版本更新至 v7（强制刷新确保加载最新代码）
  - ✅ 端到端验证：观察记录 11 条、育儿日记 2 条、里程碑达成状态 1 条，全部同步成功
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

该文档是双轨融合（蒙台梭利体系 + App 设计）的产物，涵盖：数据结构、MVP 功能模块（M1-M9 + M_GuideIntensity + M_ObsGuide + M_Onboarding + M_MilestoneConfirm + M_ReEntry + M_Diary + M_RecordEdit + M_CustomActivity + M_RecordManage + M_Moments）、页面结构、技术规范。**开发以此文档为准，docs/product/prd.md 仅作历史参考。**

#### PRD（起起成长 App）

当前版本：v0.4（草稿，已被需求说明书取代）

- **阶段零**：个人版，纯前端无服务端（MVP 已确认）
- **阶段一**：对外版，加入 API 服务 + 订阅鉴权
- **产品形态**：PWA/H5（手机端）+ API 服务（服务端）
- **开发方式**：Claude Code Vibe Coding

理论框架层次（从底到顶）：皮亚杰 → 蒙台梭利（主框架）→ RIE/瑞吉欧/正面管教/华德福（补充）→ 多元智能（评估层）

#### prototype.html

单文件 H5 原型，模拟 375×780 手机框架。技术栈：原生 HTML/CSS/JS，无框架。
CSS 变量集中在 `:root`（颜色、圆角、阴影）；页面切换使用 `.page.active` 显示/隐藏；弹层分两类：`.modal`（全屏）和 `.overlay`（底部弹出）。

### MVP 开发范围

#### 当前进度
- **状态**：v2.1 已实装，sync.js 集成完成，端到端验证通过（2026-04-28）
- **活动库**：**0-72月（0-6岁）143 条完整数据**，`js/data/activities-complete.js`（2026-04-16 完成，Golden Path 14/14 通过）
- **里程碑库**：**0-72月 216 条完整**（10维度，observeTip/linkedMilestones 100%，`js/data/milestones.js`，2026-04-17）
- **后端**：NAS Bun + SQLite + Docker Compose，JWT PIN 认证，REST API，2026-04-24 实装
- **数据文件**：`js/data/activities-complete.js`（活动主文件）+ `js/data/milestones.js`（里程碑主文件）

#### 包含的功能模块（MVP P0）
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
| **M_RecordManage** | **历史记录管理**（v1.7新，迁移至时光 Tab） |
| **M_Moments** | **时光 Tab**（v2.0新，瀑布流，日记+活动记录合并，支持完整增删改） |

#### 延后 P1 的功能
- Claude API 接入 + AI 周方案生成
- AI 里程碑分析、兴趣报告
- 月/季度复盘的 AI 辅助
- 多照料者支持

### 关键概念速查表

#### H 编号体系（活动分类）
- **格式**：`{领域前缀}-{月龄}-{序号}`，如 `S-6-04`
- **前缀**：P(日常生活) / S(感官) / M(运动) / L(语言) / E(社会情绪) / C(文化) / N(数学)
- **用途**：统一编码规则，便于跨文档引用和数据库查询

#### A-H 八模块（活动数据结构）
来自 `02_核心框架与模板.md`：
- **A1**：基础信息（id、年龄范围、维度、敏感期、WHO领域）
- **A2**：材料与环境（物料清单、场地要求、错误控制）
- **A3**：操作指引（3-5步详细说明）
- **A4**：可观测指标（v1.5+：observeAnchor/observeFocus[]/phases[]/linkedMilestones[]/theoryBite）
- **B**：记录表（4字段：initType/focusSec/emotion/note）
- **F**：快速判定（兴趣识别 5 项规则，锚点为专注时长）
- **G**：优势领域（G.3 映射表：兴趣信号 → 环境准备方向）
- **H**：编号体系

#### F规则锚点机制（兴趣识别）
- **必须满足**：第2项「专注超典型50%」（focusSec > typicalSec × 1.5）
- **加分项**：单日重复≥3次 / 连续3天主动 / 拓展/迁移行为
- **结果**：满足锚点 + 任意1加分项 → 标注「兴趣候选」并开启4周追踪

#### 数据存储（IndexedDB）
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

### 当前文件清单

#### 核心规范文档
| 文件 | 版本 | 用途 |
|------|------|------|
| `docs/product/requirements-v2.1.md` | **v2.1** | **开发主文档**，详细功能规范 + 数据结构 + 技术栈 |
| `docs/product/prd.md` | v0.4 | 历史归档（已被需求说明书取代） |
| `docs/archives/old-versions/起起成长-需求说明书-v1.5.md` | v1.5 | 历史归档 |
| `docs/montessori-system/02_核心框架与模板.md` | 参考 | A-H 八模块定义，所有活动共用模板 |
| `docs/montessori-system/04_示例活动集_0-1岁.md` | 参考 | 活动框架索引，维度覆盖矩阵 |
| `docs/montessori-system/04_示例活动_0-1岁.md` | 参考 | 25张活动卡详细内容 |
| `docs/montessori-system/07_新手SOP流程指引.md` | 参考 | 7步心跳 + 周复盘5问 |

#### 数据文件（活动与里程碑）
| 文件 | 内容 | 状态 |
|------|------|------|
| `js/data/activities-complete.js` | **0-72月 143条完整活动**（2026-04-16，Golden Path 14/14 通过） | ✅ **主文件** |
| `js/data/activities.js` | 旧版 0-6月 7条 | ⚠️ DEPRECATED — custom-activity.js/settings.js 仍错误引用，待修正 |
| `js/data/milestones.js` | **0-72月 216条完整里程碑**（10维度，observeTip/linkedMilestones 100%，2026-04-17） | ✅ **主文件** |

#### 前端实装代码
| 文件/目录 | 用途 |
|------|------|
| `prototype.html` | 视觉参考原型（不直接修改，仅作设计参考） |
| `index.html` | **实装主入口**（PWA，含全部 overlay 骨架） |
| `js/db.js` | IndexedDB 封装（DB_VERSION 2，8个store） |
| `js/app.js` | 应用入口（初始化 + 事件总线 + customActs 合并） |
| `js/sync.js` | NAS 同步层（push-only fire-and-forget，API 未配置时静默跳过） |
| `js/ui/moments.js` | 时光 Tab（M_Moments，瀑布流，日记+活动记录合并） |
| `js/ui/diary.js` | 育儿日记模块（M_Diary，图片压缩 + 同步 pushDiary） |
| `js/ui/today.js` | 今日 Tab（含记录编辑/删除，M_RecordEdit） |
| `js/ui/milestones.js` | 里程碑 Tab（含 pushMilestoneState 同步） |
| `js/ui/record.js` | 观察记录（含 pushRecord 同步） |
| `js/ui/settings.js` | 设置页（NAS API 配置区块 + pushProfile） |
| `css/app.css` | 样式（含时光瀑布流、日记缩略图、inline-confirm 样式） |

#### 后端服务（server/）
| 文件/目录 | 用途 |
|------|------|
| `server/src/index.ts` | Bun HTTP 服务主入口，REST API 路由 |
| `server/migrations/` | SQLite 建表脚本 |
| `docker-compose.yml` | Docker Compose（Nginx + API 服务一键启动） |
| `nginx.conf` | Nginx 反向代理配置 |
| `docs/deployment/QUICK-START.md` | 5 分钟部署指南 |
| `docs/deployment/DEPLOYMENT.md` | 完整部署参考 |
| `docs/deployment/API-CONFIG.md` | API 配置说明 |

### 开发前检查清单

启动开发时，确认以下内容：

- [x] 需求说明书 v2.1 已实装（sync.js 集成 + 端到端验证通过，2026-04-28）
- [x] 活动库完整（**143条 0-72月**，`js/data/activities-complete.js`，14/14 验收通过，2026-04-16）
- [x] 里程碑库完整（**216条 0-72月**，observeTip/linkedMilestones 100%，`js/data/milestones.js`，2026-04-17）
- [x] IndexedDB schema 包含全部 8 个 store（DB_VERSION 2）
- [x] 轻/中/重三模式切换逻辑已实现（guideIntensity 全局状态）
- [x] M_Moments 时光 Tab 已实装（瀑布流，日记+活动记录合并，增删改，`js/ui/moments.js`）
- [x] 育儿日记 overlay 已实装（Store 7 diaryEntries，pushDiary 同步）
- [x] 自定义活动 overlay 已实装（Store 8 customActivities）
- [x] 今日记录编辑/删除已实装（updateRecord / deleteRecord）
- [x] NAS 同步层已集成（sync.js，record/diary/milestones/settings 全部接入）
- [x] 设置页 NAS API 配置区块已实装（地址 + PIN 码 + 状态显示）
- [x] Service Worker 缓存版本 qiqi-v8（补入 moments.js + sync.js，2026-04-29）
- [ ] `js/data/activities.js` 遗留引用待修正（custom-activity.js / settings.js 应改为 activities-complete.js）

### 写作规范（Markdown 文档）

- 所有 `.md` 文件顶部有 YAML frontmatter，包含 `version`、`last_updated`、`changelog`
- 版本号：小修末位 +1（v1.0 → v1.1），结构性变更中位 +1（v1.1 → v2.0）
- 活动卡采用统一模板（`docs/montessori-system/02_核心框架与模板.md` A 部分），修改活动内容需保持模板字段完整
- 记录表字段固定 11 项（02-B），不得随意增删

### 特殊说明

- **多源融合**：本项目结合了 WHO、CDC、蒙台梭利、皮亚杰、多元智能等多个理论框架。需求说明书中每条规范都有理论依据。
- **小白父母导向**：系统设计最终目标是让新手父母也能"学会观察"，而不仅是记录。UI 复杂度通过「轻/中/重」模式在原型层面解决。
- **数据库已全量完成**：活动库 143条（0-72月）+ 里程碑库 216条（0-72月，10维度），P0 阶段数据基础完整，P1 专注 AI 功能引入。
- **无 AI 约束**：MVP 不包含任何 AI 调用，所有推荐和识别均为规则驱动（F规则、G规则）。P1 才引入 Claude API。

### Memory 更新规则

`memory/` 只记录「不在代码、不在 `.planning/` 里的东西」：

| 触发事件 | 更新哪个文件 |
|---------|------------|
| 做出影响后续开发的新决策 | `lin_decisions.md` |
| 发现未记录的 Bug 或已知坑 | `known_issues.md` |
| 部署方式或 API 配置发生变化 | `deployment.md` |
| 修改任何静态文件（JS/CSS/HTML）| `service-worker.js` 升级 CACHE_NAME，更新 `known_issues.md` 中的版本记录 |

**不要记录**：版本号、测试数量、文件路径、功能状态（看代码/git log/.planning/STATE.md）
