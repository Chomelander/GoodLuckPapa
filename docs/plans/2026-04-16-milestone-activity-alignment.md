# 里程碑-活动双向对齐实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 新建 `js/data/milestones-complete.js`（~70 条，0-72月全覆盖），并将 `activities-complete.js` 中 187 个无规律里程碑引用统一替换为规范 ID，实现双向精确匹配。

**Architecture:** 两阶段——① 建立规范里程碑库（canonical milestones）；② 脚本批量修正活动中的 `linkedMilestones` 引用为规范 ID。使用 `milestones-complete.js` 替代现有 `milestones.js`，保持相同 ES module 导出接口 `export const MILESTONES`。

**Tech Stack:** 原生 JS（ES module），Node.js 脚本驱动批量替换，与现有 IndexedDB 数据结构兼容。

**关键约束：**
- `milestones-complete.js` 必须导出 `MILESTONES`（规范化后的数组），与 `app.js` 现有 `import { MILESTONES } from './data/milestones.js'` 接口对齐（修改 import 路径即可）
- 里程碑 `id` 命名规范：`m_{domain}_{descriptor}`，domain 取值：`cog / motor / lang / emo / life / social / math / senso`
- 每条里程碑必须有：`id / dim / name / windowStart / windowEnd / description / observeTip / status / achievedDate / achievedAgeMonths / note`

---

## 现状数据

| 项目 | 数量 |
|------|------|
| 现有里程碑 | 9 条（仅 0-12月） |
| 活动引用里程碑 ID | **187 个唯一 ID**（含大量语义重复与前缀混乱） |
| 引用前缀混乱示例 | `m_lang_词汇` / `m_language_词汇理解` / `m_language_词汇积累` 均指向同一概念 |
| 缺失月龄段 | 12-72月全无里程碑 |

## 规范 ID 体系（8 个 domain）

| domain | 含义 | 旧前缀（合并自） |
|--------|------|----------------|
| `m_cog_` | 认知/思维 | m_cog_ |
| `m_motor_` | 运动（粗大+精细） | m_motor_ |
| `m_lang_` | 语言 | m_lang_ / m_language_ |
| `m_emo_` | 情绪社会性 | m_emo_ / m_emotional_ |
| `m_life_` | 自理/日常生活 | m_self_ / m_practical_ / m_habit_ |
| `m_social_` | 社会交往 | m_social_ |
| `m_math_` | 数学心智 | m_math_ |
| `m_senso_` | 感官 | m_senso_ / m_sensory_ |

---

## 阶段一：规范里程碑库（milestones-complete.js）

### Task 1：生成 ID 映射表（审计脚本）

**目的：** 从 activities-complete.js 中提取所有 187 个原始 ID，自动归并为规范 ID，输出映射表供后续 Task 使用。

**Files:**
- Run script (inline, no file created)

**Step 1：执行审计**

```bash
cd "$(git rev-parse --show-toplevel)"
node --input-type=module <<'EOF'
import { ACTIVITIES } from './js/data/activities-complete.js';
const raw = new Set();
ACTIVITIES.forEach(a => (a.linkedMilestones ?? []).forEach(id => raw.add(id)));
const sorted = [...raw].sort();
console.log('// 原始 ID 共', sorted.length, '个');
sorted.forEach(id => console.log(id));
EOF
```

**Step 2：核对本计划 Task 2-6 的规范 ID 覆盖所有引用（目视检查即可，脚本在 Task 7 自动验证）**

---

### Task 2：创建 milestones-complete.js 骨架

**Files:**
- Create: `js/data/milestones-complete.js`

**Step 1：写入文件骨架**

```js
/**
 * 起起成长 · 里程碑库完整版（0-72月）
 * 替代 js/data/milestones.js
 * 生成日期：2026-04-16
 * 里程碑总量：~70 条，覆盖 8 个发展域
 */

const DIM_MAP = {
  cog:    'cognitive',
  motor:  'motor',
  lang:   'language',
  emo:    'emotional_social',
  life:   'self_care',
  social: 'social',
  math:   'math',
  senso:  'sensorial',
};

function normalizeMilestone(raw) {
  return {
    ...raw,
    title: raw.name,
    domain: DIM_MAP[raw.dim] ?? raw.dim,
    status: raw.status ?? 'pending',
    achievedDate: raw.achievedDate ?? null,
    achievedAgeMonths: raw.achievedAgeMonths ?? null,
    note: raw.note ?? '',
  };
}

const _RAW = [
  // ── 0-3 月 ──────────────────────────────────────────────────────
  // ── 3-6 月 ──────────────────────────────────────────────────────
  // ── 6-9 月 ──────────────────────────────────────────────────────
  // ── 9-12 月 ─────────────────────────────────────────────────────
  // ── 12-18 月 ────────────────────────────────────────────────────
  // ── 18-24 月 ────────────────────────────────────────────────────
  // ── 24-36 月 ────────────────────────────────────────────────────
  // ── 36-48 月 ────────────────────────────────────────────────────
  // ── 48-60 月 ────────────────────────────────────────────────────
  // ── 60-72 月 ────────────────────────────────────────────────────
];

export const MILESTONES = _RAW.map(normalizeMilestone);
```

**Step 2：语法验证**

```bash
node --input-type=module < js/data/milestones-complete.js
```

Expected: 无输出，无报错。

**Step 3：commit**

```bash
git add js/data/milestones-complete.js
git commit -m "feat: scaffold milestones-complete.js"
```

---

### Task 3：填充 0-12 月里程碑（20 条）

**Files:**
- Modify: `js/data/milestones-complete.js`（在 `_RAW = [` 内追加）

**目标里程碑清单（严格按此 ID 填充，后续 Task 6 的 ID 映射以此为准）：**

| ID | 名称 | windowStart | windowEnd | dim |
|----|------|------------|----------|-----|
| m_motor_反射性抓握 | 反射性抓握 | 0 | 3 | motor |
| m_cog_视觉追踪 | 视觉追踪 | 0 | 3 | cog |
| m_lang_声音反应 | 声音定向反应 | 0 | 4 | lang |
| m_senso_触觉探索 | 触觉探索 | 0 | 6 | senso |
| m_emo_依恋建立 | 依恋关系建立 | 0 | 6 | emo |
| m_emo_社会性微笑 | 社会性微笑 | 2 | 6 | emo |
| m_motor_俯趴抬头 | 俯趴时抬头 | 1 | 5 | motor |
| m_motor_主动抓握 | 主动有意识抓握 | 3 | 6 | motor |
| m_cog_因果认知 | 因果认知萌芽 | 4 | 8 | cog |
| m_lang_咿呀学语 | 咿呀发声 | 3 | 9 | lang |
| m_motor_对指抓握 | 对指精确捏取 | 6 | 10 | motor |
| m_motor_独坐 | 无支撑独坐 | 6 | 9 | motor |
| m_cog_客体永久性 | 客体永久性 | 6 | 12 | cog |
| m_emo_陌生人焦虑 | 陌生人焦虑 | 6 | 9 | emo |
| m_emo_主动依恋 | 主动依恋行为 | 6 | 12 | emo |
| m_lang_声音模仿 | 声音模仿 | 6 | 12 | lang |
| m_lang_词汇理解 | 词汇理解萌芽 | 8 | 14 | lang |
| m_motor_爬行 | 四肢协调爬行 | 7 | 11 | motor |
| m_life_秩序感萌芽 | 日常秩序感 | 6 | 12 | life |
| m_life_自主进食 | 自主进食初步 | 8 | 15 | life |

**每条里程碑对象格式（以 m_cog_视觉追踪 为模板）：**

```js
{
  id: 'm_cog_视觉追踪',
  dim: 'cog',
  name: '视觉追踪',
  windowStart: 0,
  windowEnd: 3,
  description: '婴儿能平滑地追踪缓慢移动的物体，视线跨越中线不中断',
  observeTip: '在婴儿眼前 20-30cm 处缓慢移动高对比物体（黑白或红色）。速度：1秒移动约 15cm。观察眼睛是否平滑跟随，能否跨越中线追踪 180°。断续追视（跳跃式）说明还在萌芽期。',
},
```

**Step 1：将 20 条里程碑写入 _RAW 数组（0-12月区段注释下方）**

**Step 2：语法验证**

```bash
node --input-type=module <<'EOF'
import { MILESTONES } from './js/data/milestones-complete.js';
console.log('0-12月里程碑数:', MILESTONES.filter(m => m.windowEnd <= 12).length);
EOF
```

Expected: `0-12月里程碑数: 20`

**Step 3：commit**

```bash
git add js/data/milestones-complete.js
git commit -m "feat: fill 0-12mo milestones (20 entries)"
```

---

### Task 4：填充 12-36 月里程碑（22 条）

**Files:**
- Modify: `js/data/milestones-complete.js`

| ID | 名称 | windowStart | windowEnd | dim |
|----|------|------------|----------|-----|
| m_motor_独立行走 | 独立行走 | 9 | 15 | motor |
| m_motor_手眼协调 | 手眼协调操作 | 9 | 18 | motor |
| m_lang_词汇爆发 | 词汇爆发 | 12 | 18 | lang |
| m_emo_情绪表达 | 情绪表达 | 12 | 24 | emo |
| m_emo_自我认知 | 自我认知萌芽 | 12 | 24 | emo |
| m_cog_形状认知 | 形状配对认知 | 9 | 18 | cog |
| m_life_秩序感 | 日常秩序感（惯例） | 12 | 24 | life |
| m_lang_双词句 | 双词句表达 | 18 | 24 | lang |
| m_motor_精细动作 | 精细手指操作 | 12 | 36 | motor |
| m_motor_平衡感 | 行走平衡 | 12 | 24 | motor |
| m_social_同伴意识 | 同伴意识萌芽 | 18 | 30 | social |
| m_emo_情绪识别 | 情绪识别 | 18 | 30 | emo |
| m_lang_简单句子 | 简单句子表达 | 24 | 36 | lang |
| m_cog_颜色认知 | 基本颜色命名 | 18 | 30 | cog |
| m_cog_分类能力 | 单维度分类 | 18 | 36 | cog |
| m_cog_尺寸概念 | 大小尺寸概念 | 18 | 30 | cog |
| m_emo_共情 | 共情萌芽 | 18 | 36 | emo |
| m_social_轮流 | 轮流等待 | 24 | 36 | social |
| m_life_自理能力 | 基本生活自理 | 18 | 36 | life |
| m_math_数量感 | 数量感（1-3） | 24 | 36 | math |
| m_cog_专注力 | 持续专注 | 18 | 36 | cog |
| m_lang_命名 | 实物命名 | 18 | 30 | lang |

**Step 1：追加 22 条数据至 _RAW 数组（12-36月区段）**

**Step 2：验证**

```bash
node --input-type=module <<'EOF'
import { MILESTONES } from './js/data/milestones-complete.js';
const band = MILESTONES.filter(m => m.windowStart >= 12 && m.windowStart < 36);
console.log('12-36月里程碑数:', band.length);
console.log('总数:', MILESTONES.length);
EOF
```

Expected: `12-36月里程碑数: 22`，`总数: 42`

**Step 3：commit**

```bash
git add js/data/milestones-complete.js
git commit -m "feat: fill 12-36mo milestones (22 entries)"
```

---

### Task 5：填充 36-72 月里程碑（28 条）

**Files:**
- Modify: `js/data/milestones-complete.js`

| ID | 名称 | windowStart | windowEnd | dim |
|----|------|------------|----------|-----|
| m_motor_大运动 | 大运动综合（跑跳攀爬） | 24 | 48 | motor |
| m_motor_跳跃 | 双脚跳跃 | 24 | 48 | motor |
| m_motor_书写前准备 | 书写前肌肉准备 | 36 | 60 | motor |
| m_cog_逻辑思维 | 因果逻辑思维 | 24 | 48 | cog |
| m_cog_序列 | 大小序列排序 | 24 | 48 | cog |
| m_cog_分类 | 双维度分类 | 30 | 48 | cog |
| m_cog_叙事能力 | 叙事能力 | 30 | 48 | cog |
| m_cog_空间感知 | 空间方向感知 | 36 | 60 | cog |
| m_cog_时间概念 | 时间顺序概念 | 36 | 60 | cog |
| m_cog_观察力 | 细节观察力 | 36 | 60 | cog |
| m_cog_好奇心 | 主动探索好奇心 | 36 | 72 | cog |
| m_cog_科学思维 | 假设验证思维 | 48 | 72 | cog |
| m_cog_地理概念 | 地理空间概念 | 48 | 72 | cog |
| m_cog_生命概念 | 生命周期概念 | 48 | 72 | cog |
| m_lang_词汇积累 | 词汇量快速积累 | 30 | 60 | lang |
| m_lang_叙事表达 | 叙事性语言表达 | 36 | 60 | lang |
| m_lang_语音意识 | 语音意识（音节感知） | 36 | 60 | lang |
| m_lang_拼读 | 字母拼读初步 | 48 | 72 | lang |
| m_lang_阅读萌芽 | 自主阅读萌芽 | 48 | 72 | lang |
| m_emo_情绪调节 | 情绪自我调节 | 24 | 48 | emo |
| m_emo_延迟满足 | 延迟满足能力 | 36 | 60 | emo |
| m_emo_冲动控制 | 冲动控制 | 30 | 48 | emo |
| m_social_社会礼仪 | 社会礼仪 | 24 | 48 | social |
| m_social_合作 | 合作游戏 | 30 | 60 | social |
| m_social_规则意识 | 规则意识 | 36 | 60 | social |
| m_life_独立 | 生活独立能力 | 36 | 72 | life |
| m_life_家务参与 | 真实家务参与 | 24 | 60 | life |
| m_math_数概念 | 数量对应概念 | 24 | 48 | math |
| m_math_计数 | 1-10 精确计数 | 30 | 48 | math |
| m_math_数符号 | 数字符号认知 | 48 | 72 | math |
| m_math_加法 | 加法具象理解 | 48 | 72 | math |
| m_math_十进制 | 十进制概念 | 48 | 72 | math |
| m_senso_颜色辨别 | 颜色精确辨别 | 30 | 48 | senso |
| m_senso_形状辨别 | 形状精确辨别 | 30 | 48 | senso |
| m_senso_感官配对 | 感官精确配对 | 36 | 60 | senso |

**Step 1：追加数据至 _RAW 数组（36-72月区段）**

**Step 2：验证**

```bash
node --input-type=module <<'EOF'
import { MILESTONES } from './js/data/milestones-complete.js';
console.log('总里程碑数:', MILESTONES.length);
// 检查每条必填字段
const required = ['id','title','domain','windowStart','windowEnd','description','observeTip'];
const bad = MILESTONES.filter(m => required.some(f => !m[f]));
console.log('字段缺失:', bad.length === 0 ? '无' : bad.map(m=>m.id).join(', '));
// 重复 ID 检查
const ids = MILESTONES.map(m=>m.id);
const dupes = ids.filter((id,i)=>ids.indexOf(id)!==i);
console.log('重复 ID:', dupes.length === 0 ? '无' : dupes.join(', '));
EOF
```

Expected: 总数 70 左右，字段缺失：无，重复 ID：无。

**Step 3：commit**

```bash
git add js/data/milestones-complete.js
git commit -m "feat: fill 36-72mo milestones (28 entries), complete milestone library"
```

---

## 阶段二：修正活动库引用（linkedMilestones 规范化）

### Task 6：生成并执行 ID 映射脚本

**目的：** 将 activities-complete.js 中 187 个原始里程碑引用批量替换为 Task 3-5 确立的规范 ID。

**Files:**
- Modify: `js/data/activities-complete.js`（脚本原地修改）

**Step 1：创建映射脚本 `scripts/normalize-milestone-ids.mjs`**

```bash
mkdir -p scripts
```

```js
// scripts/normalize-milestone-ids.mjs
// 将 activities-complete.js 中的旧里程碑 ID 替换为规范 ID
import { readFileSync, writeFileSync } from 'fs';

// ── 映射表：旧 ID → 规范 ID ──────────────────────────────────────
// 规则：优先保留语义最准确的，合并同义词
const ID_MAP = {
  // ── cognitive ──
  'm_cog_视觉追踪':       'm_cog_视觉追踪',
  'm_cog_社会性微笑':     'm_emo_社会性微笑',
  'm_cog_因果认知':       'm_cog_因果认知',
  'm_cog_因果理解':       'm_cog_因果认知',
  'm_cog_因果关系':       'm_cog_逻辑思维',
  'm_cog_客体永久性':     'm_cog_客体永久性',
  'm_cog_秩序感':         'm_life_秩序感',
  'm_cog_形状认知':       'm_cog_形状认知',
  'm_cog_颜色认知':       'm_cog_颜色认知',
  'm_cog_分类':           'm_cog_分类',
  'm_cog_分类能力':       'm_cog_分类能力',
  'm_cog_逻辑思维':       'm_cog_逻辑思维',
  'm_cog_专注力':         'm_cog_专注力',
  'm_cog_自我认知':       'm_emo_自我认知',
  'm_cog_尺寸概念':       'm_cog_尺寸概念',
  'm_cog_序列':           'm_cog_序列',
  'm_cog_空间知觉':       'm_cog_空间感知',
  'm_cog_空间感知':       'm_cog_空间感知',
  'm_cog_空间想象':       'm_cog_空间感知',
  'm_cog_空间概念':       'm_cog_空间感知',
  'm_cog_空间管理':       'm_cog_空间感知',
  'm_cog_叙事能力':       'm_cog_叙事能力',
  'm_cog_时间概念':       'm_cog_时间概念',
  'm_cog_时间线':         'm_cog_时间概念',
  'm_cog_数学心智':       'm_math_数概念',
  'm_cog_对称':           'm_cog_序列',
  'm_cog_感官配对':       'm_senso_感官配对',
  'm_cog_几何心智':       'm_cog_逻辑思维',
  'm_cog_生命概念':       'm_cog_生命概念',
  'm_cog_宇宙概念':       'm_cog_好奇心',
  'm_cog_世界概念':       'm_cog_好奇心',
  'm_cog_创造力':         'm_cog_好奇心',
  'm_cog_科学思维':       'm_cog_科学思维',
  'm_cog_科学探索':       'm_cog_科学思维',
  'm_cog_地理概念':       'm_cog_地理概念',
  'm_cog_多维度认知':     'm_cog_分类',
  'm_cog_多样性':         'm_cog_生命概念',
  'm_cog_一一对应':       'm_math_数量感',
  'm_cog_数量精确':       'm_math_计数',
  'm_cog_好奇心':         'm_cog_好奇心',
  'm_cog_观察':           'm_cog_观察力',
  'm_cog_问题解决':       'm_cog_科学思维',
  'm_cog_比较':           'm_cog_序列',
  'm_cog_相对概念':       'm_cog_尺寸概念',
  'm_cog_自控':           'm_emo_冲动控制',

  // ── motor ──
  'm_motor_反射性抓握':   'm_motor_反射性抓握',
  'm_motor_有意识抓握':   'm_motor_主动抓握',
  'm_motor_主动伸手':     'm_motor_主动抓握',
  'm_motor_俯趴':         'm_motor_俯趴抬头',
  'm_motor_抬头':         'm_motor_俯趴抬头',
  'm_motor_对指捏':       'm_motor_对指抓握',
  'm_motor_对指抓握':     'm_motor_对指抓握', // 保留
  'm_motor_独坐不需支撑': 'm_motor_独坐',
  'm_motor_爬行':         'm_motor_爬行',
  'm_motor_独立行走':     'm_motor_独立行走',
  'm_motor_平衡感':       'm_motor_平衡感',
  'm_motor_手眼协调':     'm_motor_手眼协调',
  'm_motor_双手传递':     'm_motor_手眼协调',
  'm_motor_双手配合':     'm_motor_手眼协调',
  'm_motor_精细动作':     'm_motor_精细动作',
  'm_motor_大运动':       'm_motor_大运动',
  'm_motor_跳跃':         'm_motor_跳跃',
  'm_motor_协调性':       'm_motor_大运动',
  'm_motor_节奏感':       'm_motor_大运动',
  'm_motor_粗大动作':     'm_motor_大运动',
  'm_motor_书写前准备':   'm_motor_书写前准备',

  // ── language ──
  'm_language_定向反应':  'm_lang_声音反应',
  'm_lang_语言兴趣':      'm_lang_声音反应',
  'm_language_咿呀学语':  'm_lang_咿呀学语',
  'm_language_声音模仿':  'm_lang_声音模仿',
  'm_language_词汇理解':  'm_lang_词汇理解',
  'm_language_语言理解':  'm_lang_词汇理解',
  'm_language_语言表达':  'm_lang_词汇爆发',
  'm_language_双词句':    'm_lang_双词句',
  'm_lang_词汇爆发':      'm_lang_词汇爆发',
  'm_lang_词汇':          'm_lang_词汇积累',
  'm_lang_词汇积累':      'm_lang_词汇积累',
  'm_lang_理解':          'm_lang_词汇理解',
  'm_lang_理解简单句子':  'm_lang_简单句子',
  'm_lang_理解复杂句':    'm_lang_叙事表达',
  'm_lang_句子长度':      'm_lang_叙事表达',
  'm_lang_叙事':          'm_lang_叙事表达',
  'm_lang_口语表达':      'm_lang_叙事表达',
  'm_lang_表达':          'm_lang_叙事表达',
  'm_lang_命名':          'm_lang_命名',
  'm_lang_语言理解':      'm_lang_词汇理解',
  'm_lang_语音意识':      'm_lang_语音意识',
  'm_lang_拼读':          'm_lang_拼读',
  'm_lang_拼写':          'm_lang_拼读',
  'm_lang_字母认知':      'm_lang_拼读',
  'm_lang_识字':          'm_lang_阅读萌芽',
  'm_lang_阅读':          'm_lang_阅读萌芽',
  'm_lang_阅读准备':      'm_lang_阅读萌芽',
  'm_lang_阅读理解':      'm_lang_阅读萌芽',
  'm_lang_书面准备':      'm_motor_书写前准备',
  'm_lang_书面表达':      'm_lang_叙事表达',
  'm_lang_书写':          'm_motor_书写前准备',
  'm_lang_书写准备':      'm_motor_书写前准备',
  'm_lang_握笔':          'm_motor_书写前准备',
  'm_lang_分类':          'm_cog_分类能力',
  'm_lang_批判思维':      'm_cog_科学思维',
  'm_lang_想象力':        'm_cog_好奇心',
  'm_lang_数字认知':      'm_math_数符号',

  // ── emotional / social ──
  'm_emotional_依恋建立':     'm_emo_依恋建立',
  'm_emotional_情绪认知':     'm_emo_情绪识别',
  'm_emotional_情绪调节':     'm_emo_情绪调节',
  'm_emotional_社会性微笑':   'm_emo_社会性微笑',
  'm_emotional_自我认知萌芽': 'm_emo_自我认知',
  'm_emo_共情':               'm_emo_共情',
  'm_emo_情绪表达':           'm_emo_情绪表达',
  'm_emo_情绪识别':           'm_emo_情绪识别',
  'm_emo_情绪调节':           'm_emo_情绪调节',
  'm_emo_冲动控制':           'm_emo_冲动控制',
  'm_emo_自我控制':           'm_emo_冲动控制',
  'm_emo_延迟满足':           'm_emo_延迟满足',
  'm_emo_自律':               'm_emo_延迟满足',
  'm_emo_自我认知':           'm_emo_自我认知',
  'm_emo_自我负责':           'm_life_独立',
  'm_emo_自信':               'm_emo_自我认知',
  'm_emo_元认知':             'm_cog_科学思维',
  'm_emo_专注力':             'm_cog_专注力',
  'm_social_同伴意识':        'm_social_同伴意识',
  'm_social_同伴关系':        'm_social_合作',
  'm_social_社会礼仪':        'm_social_社会礼仪',
  'm_social_合作':            'm_social_合作',
  'm_social_团队':            'm_social_合作',
  'm_social_轮流':            'm_social_轮流',
  'm_social_规则意识':        'm_social_规则意识',
  'm_social_沟通':            'm_lang_叙事表达',
  'm_social_责任':            'm_life_家务参与',
  'm_social_社会责任':        'm_life_家务参与',
  'm_social_亲社会行为':      'm_social_合作',
  'm_social_冲突解决':        'm_emo_冲动控制',
  'm_social_文化认同':        'm_cog_生命概念',
  'm_social_跨文化':          'm_cog_生命概念',
  'm_social_领导力':          'm_social_合作',

  // ── self_care / practical ──
  'm_self_独立进食':    'm_life_自主进食',
  'm_self_自理能力':    'm_life_自理能力',
  'm_self_自我管理':    'm_life_独立',
  'm_self_自我服务':    'm_life_自理能力',
  'm_self_生活规划':    'm_life_独立',
  'm_self_独立':        'm_life_独立',
  'm_self_独立探索':    'm_life_独立',
  'm_self_责任':        'm_life_家务参与',
  'm_self_责任感':      'm_life_家务参与',
  'm_self_卫生':        'm_life_自理能力',
  'm_self_金钱观念':    'm_math_数概念',
  'm_practical_自我服务':  'm_life_自理能力',
  'm_practical_家务参与':  'm_life_家务参与',
  'm_practical_优雅动作':  'm_life_家务参与',
  'm_practical_美感':      'm_cog_好奇心',
  'm_practical_穿衣':      'm_life_自理能力',
  'm_practical_独立':      'm_life_独立',
  'm_practical_时间管理':  'm_cog_时间概念',
  'm_practical_准备上学':  'm_life_独立',
  'm_practical_生活技能':  'm_life_自理能力',

  // ── math ──
  'm_math_数概念':        'm_math_数概念',
  'm_math_数量感':        'm_math_数量感',
  'm_math_计数':          'm_math_计数',
  'm_math_数量对应':      'm_math_数量感',
  'm_math_一一对应':      'm_math_数量感',
  'm_math_数符号':        'm_math_数符号',
  'm_math_十进制':        'm_math_十进制',
  'm_math_加法':          'm_math_加法',
  'm_math_减法':          'm_math_加法',
  'm_math_乘法':          'm_math_加法',
  'm_math_运算':          'm_math_加法',
  'm_math_分组':          'm_math_十进制',
  'm_math_位值':          'm_math_十进制',
  'm_math_零的概念':      'm_math_数概念',
  'm_math_整体与部分':    'm_math_数概念',
  'm_math_分数':          'm_math_加法',
  'm_math_逻辑推理':      'm_cog_逻辑思维',
  'm_math_时间概念':      'm_cog_时间概念',
  'm_math_时钟':          'm_cog_时间概念',
  'm_math_测量':          'm_cog_科学思维',
  'm_math_货币':          'm_math_数概念',
  'm_math_应用题':        'm_cog_逻辑思维',
  'm_math_心算':          'm_math_加法',
  'm_math_数概念应用':    'm_math_数概念',

  // ── sensorial ──
  'm_senso_颜色辨别':   'm_senso_颜色辨别',
  'm_senso_形状辨别':   'm_senso_形状辨别',
  'm_senso_感官精致':   'm_senso_感官配对',
  'm_senso_色彩':       'm_senso_颜色辨别',
  'm_senso_视觉辨别':   'm_senso_形状辨别',
  'm_senso_触觉':       'm_senso_触觉探索',
  'm_sensory_触觉辨别': 'm_senso_触觉探索',
  'm_sensory_音乐感知':'m_motor_节奏感',
};

let src = readFileSync('./js/data/activities-complete.js', 'utf-8');
let totalReplaced = 0;

// 对每个旧 ID 执行全局替换（只替换引号内的 ID 字符串）
for (const [oldId, newId] of Object.entries(ID_MAP)) {
  if (oldId === newId) continue; // 已经规范的跳过
  const regex = new RegExp(`'${oldId.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}'`, 'g');
  const before = src;
  src = src.replace(regex, `'${newId}'`);
  const count = (before.match(regex) ?? []).length;
  if (count > 0) console.log(`  ${oldId} → ${newId} (${count}处)`);
  totalReplaced += count;
}

writeFileSync('./js/data/activities-complete.js', src, 'utf-8');
console.log(`\n完成：共替换 ${totalReplaced} 处`);
```

**Step 2：执行映射脚本**

```bash
node scripts/normalize-milestone-ids.mjs
```

Expected: 输出若干行替换记录，`完成：共替换 N 处`（N 应 > 100）。

**Step 3：验证替换后无残留旧 ID**

```bash
node --input-type=module <<'EOF'
import { ACTIVITIES } from './js/data/activities-complete.js';
import { MILESTONES } from './js/data/milestones-complete.js';
const validIds = new Set(MILESTONES.map(m => m.id));
const invalid = [];
ACTIVITIES.forEach(a => {
  (a.linkedMilestones ?? []).forEach(id => {
    if (!validIds.has(id)) invalid.push(`${a.id} → ${id}`);
  });
});
console.log(`无效里程碑引用: ${invalid.length} 个`);
if (invalid.length) invalid.slice(0, 20).forEach(x => console.log('  ', x));
EOF
```

Expected: `无效里程碑引用: 0 个`

如有残留，在 ID_MAP 中补充对应映射后重新执行。

**Step 4：commit**

```bash
git add js/data/activities-complete.js scripts/normalize-milestone-ids.mjs
git commit -m "feat: normalize linkedMilestones to canonical IDs"
```

---

### Task 7：更新 app.js 引用

**Files:**
- Modify: `js/app.js`（第 8 行）

**Step 1：修改 import 路径**

将：
```js
import { MILESTONES } from './data/milestones.js';
```
改为：
```js
import { MILESTONES } from './data/milestones-complete.js';
```

**Step 2：为 milestones.js 加废弃注释**

在 `js/data/milestones.js` 第一行加：
```js
// DEPRECATED: 2026-04-16，已由 milestones-complete.js 替代，请勿引用本文件
```

**Step 3：commit**

```bash
git add js/app.js js/data/milestones.js
git commit -m "feat: wire milestones-complete.js, deprecate milestones.js"
```

---

### Task 8：全量双向验证

**Files:**
- Run script (inline)

**Step 1：执行完整验收**

```bash
node --input-type=module <<'EOF'
import { ACTIVITIES } from './js/data/activities-complete.js';
import { MILESTONES } from './js/data/milestones-complete.js';

const CHECKS = [];
function check(label, pass, detail='') { CHECKS.push({label, pass, detail}); }

// 里程碑基础检查
const req = ['id','title','domain','windowStart','windowEnd','description','observeTip'];
const badM = MILESTONES.filter(m => req.some(f => !m[f]));
check('里程碑字段完整', badM.length===0, badM.map(m=>m.id).join(',') || '无');

const mIds = MILESTONES.map(m=>m.id);
const dupeM = mIds.filter((id,i)=>mIds.indexOf(id)!==i);
check('里程碑无重复ID', dupeM.length===0, dupeM.join(',') || '无');

// 月龄段覆盖（每个 12 月段都有里程碑）
[0,12,24,36,48,60].forEach(start => {
  const end = start + 12;
  const matched = MILESTONES.filter(m => m.windowStart < end && m.windowEnd > start);
  check(`${start}-${end}月有里程碑`, matched.length > 0, `${matched.length}条`);
});

// 双向链接：所有 linkedMilestones 引用均有效
const validIds = new Set(mIds);
const invalid = [];
ACTIVITIES.forEach(a => (a.linkedMilestones??[]).forEach(id => {
  if (!validIds.has(id)) invalid.push(`${a.id}→${id}`);
}));
check('活动→里程碑引用100%有效', invalid.length===0,
  invalid.length ? `${invalid.length}个无效：${invalid.slice(0,3).join(',')}` : '全部有效');

// 反向：有多少里程碑被活动引用
const usedIds = new Set(ACTIVITIES.flatMap(a => a.linkedMilestones ?? []));
const unused = MILESTONES.filter(m => !usedIds.has(m.id));
check('里程碑被活动覆盖率', unused.length < 5,
  `${MILESTONES.length - unused.length}/${MILESTONES.length} 被引用`);

console.log('\n════════════════════════════════════════');
console.log(' 双向对齐验收报告');
console.log('════════════════════════════════════════');
CHECKS.forEach(c => console.log(`${c.pass?'✓':'✗'} ${c.label}  →  ${c.detail}`));
const failed = CHECKS.filter(c=>!c.pass);
console.log('────────────────────────────────────────');
console.log(`结果：${CHECKS.length-failed.length}/${CHECKS.length} 通过`);
EOF
```

Expected: 所有项通过。如有失败，按报告提示在 ID_MAP 或里程碑数据中补充修正。

**Step 2：commit（若有修正）**

```bash
git add js/data/milestones-complete.js js/data/activities-complete.js
git commit -m "fix: resolve remaining milestone alignment issues"
```

---

### Task 9：更新 CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Step 1：更新「数据文件」表**

将里程碑行改为：

```markdown
| `js/data/milestones-complete.js` | **0-72月 ~70条完整里程碑**（双向对齐，observeTip完整） | ✅ **主文件** |
| `js/data/milestones.js` | 旧版 9条示范里程碑 | ⚠️ DEPRECATED，勿引用 |
```

**Step 2：更新「当前进度」**

```markdown
- **里程碑库**：**0-72月 ~70条完整数据**，`js/data/milestones-complete.js`，双向对齐验收通过
```

**Step 3：更新「开发前检查清单」**

```markdown
- [x] 里程碑库完整（~70条 0-72月，milestones-complete.js，双向对齐 100%）
```

**Step 4：commit**

```bash
git add -f CLAUDE.md
git commit -m "docs: update CLAUDE.md milestone library status"
```

---

## 验收标准

| 项目 | 合格标准 |
|------|---------|
| 里程碑总数 | ≥ 65 条 |
| 月龄覆盖 | 0/12/24/36/48/60 月段均有里程碑 |
| 字段完整 | id/title/domain/windowStart/windowEnd/description/observeTip 全部非空 |
| 活动→里程碑引用 | **100% 有效**（无悬空引用） |
| 里程碑被引用率 | ≥ 90%（最多 5 条未被活动引用） |
| JS 语法 | `node --input-type=module` 无报错 |

## 执行注意事项

1. **Task 3-5 中每条里程碑的 observeTip 必须写**：2-4句话，包含具体操作步骤 + 判断标准，口语化，避免学术术语
2. **ID 命名不可更改**：一旦在 Task 3-5 确定，Task 6 的映射表以此为准，后续不可再改
3. **windowStart/windowEnd 为月龄整数**，不是年龄
4. **Task 6 的 ID_MAP** 需要在执行前对照 Task 1 的审计结果补充遗漏项
