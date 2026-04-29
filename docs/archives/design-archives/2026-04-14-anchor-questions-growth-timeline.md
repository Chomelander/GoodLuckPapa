# 观察锚点填空 + 成长 Tab 活动记录时间线 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将观察锚点（observeAnchor）拆解为针对性填空题展示在记录表单中，并在成长 Tab 新增活动记录时间线（支持编辑和删除），同时移除设置页的历史记录区块。

**Architecture:** 在 `record.js` 中新增两个纯函数（`parseAnchorQuestions` / `mergeAnchorAnswers`）处理锚点解析与答案合并；新建 `growth-records.js` 负责活动记录时间线的 HTML 生成与浏览器端事件处理，复用已有 `record:edit` 事件和 `showRecord` overlay；移除 `settings.js` 中的历史记录相关代码。

**Tech Stack:** 原生 ES Modules，Vitest 测试，IndexedDB（DB_VERSION 2，无 schema 变更）

---

## Task 1：`parseAnchorQuestions` + `mergeAnchorAnswers` 纯函数 + 测试

**Files:**
- Modify: `js/ui/record.js`（在文件顶部导出两个新函数）
- Modify: `tests/record.test.js`（追加新 describe 块）

---

**Step 1：写失败测试**

在 `tests/record.test.js` 文件末尾追加：

```js
import { buildRecordHTML, buildSessionHTML, parseAnchorQuestions, mergeAnchorAnswers } from '../js/ui/record.js';

describe('parseAnchorQuestions', () => {
  it('splits multi-question anchor into array', () => {
    const qs = parseAnchorQuestions('他听到你的声音有什么反应？转头？安静下来？');
    expect(qs).toEqual(['他听到你的声音有什么反应？', '转头？', '安静下来？']);
  });

  it('handles single question anchor', () => {
    const qs = parseAnchorQuestions('他在你怀里是放松还是紧绷？');
    expect(qs).toEqual(['他在你怀里是放松还是紧绷？']);
  });

  it('returns empty array for empty string', () => {
    expect(parseAnchorQuestions('')).toEqual([]);
  });

  it('returns empty array for null/undefined', () => {
    expect(parseAnchorQuestions(null)).toEqual([]);
    expect(parseAnchorQuestions(undefined)).toEqual([]);
  });

  it('appends ？ to fragment that did not originally end with one', () => {
    const qs = parseAnchorQuestions('孩子手部接触板面时的专注程度');
    expect(qs).toEqual(['孩子手部接触板面时的专注程度？']);
  });
});

describe('mergeAnchorAnswers', () => {
  it('formats q→a pairs and appends note', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？', '安静吗？'],
      answers: ['转头了', '不安静'],
      note: '补充观察',
    });
    expect(result).toBe('转头？ → 转头了\n安静吗？ → 不安静\n---\n补充观察');
  });

  it('omits separator when note is empty', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？'],
      answers: ['转头了'],
      note: '',
    });
    expect(result).toBe('转头？ → 转头了');
  });

  it('omits empty answers from output', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？', '安静吗？'],
      answers: ['转头了', ''],
      note: '',
    });
    expect(result).toBe('转头？ → 转头了');
  });

  it('returns note unchanged when no questions answered', () => {
    const result = mergeAnchorAnswers({
      questions: ['转头？'],
      answers: [''],
      note: '只有备注',
    });
    expect(result).toBe('只有备注');
  });

  it('returns empty string when both empty', () => {
    const result = mergeAnchorAnswers({ questions: [], answers: [], note: '' });
    expect(result).toBe('');
  });
});
```

**Step 2：运行测试确认失败**

```bash
npx vitest run tests/record.test.js
```

预期：FAIL，`parseAnchorQuestions is not a function`

**Step 3：在 `record.js` 顶部（`EMOTIONS` 定义之前）实现两个函数**

```js
export function parseAnchorQuestions(str) {
  if (!str) return [];
  return str.split('？')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => s + '？');
}

export function mergeAnchorAnswers({ questions, answers, note }) {
  const pairs = questions
    .map((q, i) => (answers[i]?.trim() ? `${q} → ${answers[i].trim()}` : null))
    .filter(Boolean);
  if (pairs.length === 0) return note;
  const qaBlock = pairs.join('\n');
  if (!note.trim()) return qaBlock;
  return `${qaBlock}\n---\n${note}`;
}
```

**Step 4：运行测试确认通过**

```bash
npx vitest run tests/record.test.js
```

预期：新增的 tests/record.test.js 中的 parseAnchorQuestions 和 mergeAnchorAnswers describe 块全部 PASS

**Step 5：提交**

```bash
git add js/ui/record.js tests/record.test.js
git commit -m "feat: add parseAnchorQuestions and mergeAnchorAnswers helpers"
```

---

## Task 2：更新 `buildRecordHTML`——移除观察引导卡片，新增填空区 + 更新测试

**Files:**
- Modify: `js/ui/record.js`（`buildRecordHTML` 函数）
- Modify: `tests/record.test.js`（更新旧测试 + 新增 describe 块）

---

**Step 1：更新旧测试（反映新行为）**

在 `tests/record.test.js` 中，找到 `describe('buildRecordHTML — observeAnchor 引导', ...)` 块，**替换为：**

```js
describe('buildRecordHTML — observeAnchor 填空', () => {
  it('renders anchor question as label when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('renders fill-in input with data-anchor-index when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('data-anchor-index="0"');
  });

  it('does NOT render obs-guide-card wrapper anymore', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).not.toContain('obs-guide-card');
  });

  it('does not render fill-in inputs when activity has no observeAnchor', () => {
    const actNoAnchor = { ...sampleActivity, observeAnchor: undefined };
    const html = buildRecordHTML({ activity: actNoAnchor, focusSec: 0 });
    expect(html).not.toContain('data-anchor-index');
  });

  it('hides fill-in section in edit mode (isEdit=true)', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0, isEdit: true });
    expect(html).not.toContain('data-anchor-index');
  });

  it('note placeholder changes when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('可在此补充其他观察');
  });

  it('note placeholder is default when no observeAnchor', () => {
    const actNoAnchor = { ...sampleActivity, observeAnchor: undefined };
    const html = buildRecordHTML({ activity: actNoAnchor, focusSec: 0 });
    expect(html).toContain('记录你观察到的细节');
  });
});
```

**Step 2：运行测试，确认失败项**

```bash
npx vitest run tests/record.test.js
```

预期：`does NOT render obs-guide-card` PASS（已移除），其余新测试 FAIL

**Step 3：更新 `buildRecordHTML` 函数签名和 anchor 区域**

在 `record.js` 中，修改 `buildRecordHTML`：

3a. **函数签名**加 `isEdit = false`：
```js
export function buildRecordHTML({ activity, focusSec, manualEntry = false, isEdit = false }) {
```

3b. **替换** `anchorHTML` 的整段代码（原来 `const anchorHTML = activity.observeAnchor ? ...` 到结尾 `''`）为：

```js
const anchorQuestionsHTML = (activity.observeAnchor && !isEdit)
  ? `<div class="form-group">
       <label class="form-label">观察锚点</label>
       ${parseAnchorQuestions(activity.observeAnchor).map((q, i) => `
         <div style="margin-bottom:10px">
           <div style="font-size:13px;color:var(--text-sec);margin-bottom:6px">${q}</div>
           <input type="text" class="form-input" data-anchor-index="${i}"
             placeholder="记录你的观察…"
             style="font-size:14px">
         </div>`).join('')}
     </div>`
  : '';
```

3c. **修改** `notePlaceholder`：
```js
const notePlaceholder = activity.observeAnchor ? '可在此补充其他观察…' : '记录你观察到的细节…';
```

3d. **在模板中**，将 `${anchorHTML}` 替换为（放在 initType 区块之后，note 区块之前）：

原来模板中 `${anchorHTML}` 在 form 外面（form 开始前）。现在：
- 移除原来 `${anchorHTML}` 的位置（form 开始前的那行）
- 在 inittype-control form-group 之后、note form-group 之前插入 `${anchorQuestionsHTML}`

模板结构变为：
```js
return `
  <div class="overlay-handle"></div>
  <div style="font-size:17px;font-weight:600;margin-bottom:16px">记录观察</div>
  <div style="font-size:14px;color:var(--text-sec);margin-bottom:16px">${activity.title}</div>

  <form id="record-form" data-actid="${activity.id}" data-focussec="${focusSec}" data-manual="${manualEntry ? '1' : ''}">

    ${timeSectionHTML}

    <div class="form-group">
      <label class="form-label">孩子的状态</label>
      <div class="seg-control" id="emotion-control">
        ${emotionBtns}
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">活动发起方式</label>
      <div class="seg-control" id="inittype-control">
        ${initBtns}
      </div>
    </div>

    ${anchorQuestionsHTML}

    <div class="form-group">
      <label class="form-label">观察备注（选填）</label>
      <textarea class="form-input form-textarea" id="record-note"
        placeholder="${notePlaceholder}"></textarea>
    </div>

    <button type="submit" class="btn btn-primary btn-full">保存记录</button>
  </form>`;
```

**Step 4：运行测试确认全通过**

```bash
npx vitest run tests/record.test.js
```

预期：record.test.js 所有 tests PASS

**Step 5：全量测试**

```bash
npx vitest run
```

预期：全部 PASS（数量 ≥ 220）

**Step 6：提交**

```bash
git add js/ui/record.js tests/record.test.js
git commit -m "feat: replace observeAnchor card with fill-in questions in record form"
```

---

## Task 3：更新 `showRecord` + 表单提交逻辑

**Files:**
- Modify: `js/ui/record.js`（`showRecord` 函数 + submit handler）

> 注意：submit handler 是浏览器端 `document.addEventListener('submit', ...)` 中的逻辑，不在 Vitest 测试范围内。Task 1 已测试 `mergeAnchorAnswers` 纯函数，本 Task 仅接线。

---

**Step 1：更新 `showRecord` 调用，传入 `isEdit`**

在 `showRecord` 函数中，找到：
```js
body.innerHTML = buildRecordHTML({ activity, focusSec, manualEntry });
```
改为：
```js
body.innerHTML = buildRecordHTML({ activity, focusSec, manualEntry, isEdit: !!existingRecord });
```

**Step 2：更新 submit handler，收集锚点答案并合并**

在 `document.addEventListener('submit', async e => {...})` 中，找到：
```js
const note = document.getElementById('record-note')?.value.trim() ?? '';
```
在这行**之后**（`const existingId` 之前）插入：

```js
// 收集锚点填空答案（编辑模式下无此 input，安全返回空数组）
const anchorInputs = [...document.querySelectorAll('[data-anchor-index]')];
const anchorAnswers = anchorInputs.map(el => el.value);
const anchorQuestions = anchorInputs.map(el => {
  // label text is in the previous sibling div
  return el.previousElementSibling?.textContent?.trim() ?? '';
});
const mergedNote = mergeAnchorAnswers({ questions: anchorQuestions, answers: anchorAnswers, note });
```

然后将 `record` 对象中的 `note` 改为 `mergedNote`：
```js
const record = {
  actId,
  date: state.today,
  focusSec,
  emotion,
  initType,
  note: mergedNote,   // ← 原来是 note
};
```

**Step 3：手动验证（无对应自动化测试）**

用浏览器打开 `index.html`，选一个有 observeAnchor 的活动（如 L-0-01），完成计时，在填空区填写答案，提交后检查今日记录的 note 字段是否包含 `问题 → 答案` 格式。

**Step 4：提交**

```bash
git add js/ui/record.js
git commit -m "feat: wire anchor fill-in answers into record.note on submit"
```

---

## Task 4：新建 `growth-records.js` — `buildActivityRecordsHTML` 纯函数 + 测试

**Files:**
- Create: `js/ui/growth-records.js`
- Create: `tests/growth-records.test.js`

---

**Step 1：写失败测试**

创建 `tests/growth-records.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { buildActivityRecordsHTML } from '../js/ui/growth-records.js';

const sampleActivities = [
  { id: 'S-0-01', title: '触觉感官板', domain: 'sensorial' },
];

const sampleRecords = [
  {
    id: 1,
    actId: 'S-0-01',
    date: '2026-04-14',
    focusSec: 90,
    emotion: 'engaged',
    initType: 'child_led',
    note: '很专注，一直在摸',
  },
  {
    id: 2,
    actId: 'S-0-01',
    date: '2026-04-07',
    focusSec: 60,
    emotion: 'calm',
    initType: 'adult_led',
    note: '',
  },
];

describe('buildActivityRecordsHTML', () => {
  it('renders section title', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('活动记录');
  });

  it('renders activity title for each record', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('触觉感官板');
  });

  it('renders record date', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('2026-04-14');
  });

  it('renders focusSec as mm:ss', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('01:30');
  });

  it('renders edit button with data-ar-action', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('data-ar-action="edit"');
  });

  it('renders delete button with data-ar-action', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('data-ar-action="delete"');
  });

  it('renders record id in data-id attribute', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('data-id="1"');
  });

  it('renders truncated note preview (max 40 chars)', () => {
    const longNote = 'a'.repeat(50);
    const records = [{ ...sampleRecords[0], note: longNote }];
    const html = buildActivityRecordsHTML({ records, activities: sampleActivities });
    expect(html).toContain('a'.repeat(40) + '…');
    expect(html).not.toContain('a'.repeat(41));
  });

  it('renders empty state when no records', () => {
    const html = buildActivityRecordsHTML({ records: [], activities: sampleActivities });
    expect(html).toContain('还没有活动记录');
  });

  it('renders ar-actions wrapper with record id', () => {
    const html = buildActivityRecordsHTML({ records: sampleRecords, activities: sampleActivities });
    expect(html).toContain('id="ar-actions-1"');
  });

  it('falls back to actId when activity not found', () => {
    const records = [{ ...sampleRecords[0], actId: 'X-99-99' }];
    const html = buildActivityRecordsHTML({ records, activities: sampleActivities });
    expect(html).toContain('X-99-99');
  });
});
```

**Step 2：运行测试确认失败**

```bash
npx vitest run tests/growth-records.test.js
```

预期：FAIL，`Cannot find module '../js/ui/growth-records.js'`

**Step 3：创建 `js/ui/growth-records.js`，实现 `buildActivityRecordsHTML`**

```js
/**
 * 成长 Tab 活动记录时间线
 * 功能：纯 HTML 生成（buildActivityRecordsHTML）+ 浏览器端事件处理
 */
import { state } from '../app.js';

const EMOTION_MAP = {
  engaged: '专注', happy: '愉悦', calm: '平静',
  distracted: '分心', frustrated: '挫败',
};
const INIT_MAP = {
  child_led: '孩子主导', adult_led: '成人引导', joint: '共同探索',
};

function fmtSec(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

function getWeekKey(dateStr) {
  const [, m, d] = dateStr.split('-');
  const week = Math.ceil(parseInt(d, 10) / 7);
  return `${dateStr.slice(0, 4)}-${m}-W${week}`;
}

function getWeekLabel(weekKey) {
  const [y, m, wPart] = weekKey.split('-');
  const w = wPart.slice(1);
  return `${y}年${parseInt(m, 10)}月 第${w}周`;
}

function isCurrentWeek(weekKey, today) {
  return getWeekKey(today) === weekKey;
}

function groupByYearWeek(records, today) {
  const byYear = {};
  for (const r of records) {
    const year = r.date?.slice(0, 4) ?? '未知';
    const weekKey = r.date ? getWeekKey(r.date) : 'unknown';
    const weekLabel = r.date ? getWeekLabel(weekKey) : '未知';
    if (!byYear[year]) byYear[year] = {};
    if (!byYear[year][weekKey]) byYear[year][weekKey] = { label: weekLabel, records: [] };
    byYear[year][weekKey].records.push(r);
  }
  return byYear;
}

export function buildActivityRecordsHTML({ records, activities }) {
  if (!records || records.length === 0) {
    return `
      <div class="section">
        <div class="section-title">活动记录</div>
        <div class="card" style="text-align:center;padding:32px 16px">
          <p class="text-sec">还没有活动记录</p>
          <p class="text-xs text-mute" style="margin-top:6px">完成一次活动后将在此显示</p>
        </div>
      </div>`;
  }

  const today = (typeof state !== 'undefined' && state.today)
    ? state.today
    : new Date().toISOString().slice(0, 10);

  const sorted = [...records].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const byYear = groupByYearWeek(sorted, today);

  const yearsHTML = Object.entries(byYear)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, weeks]) => {
      const weeksHTML = Object.entries(weeks)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([weekKey, { label, records: wRecords }]) => {
          const isOpen = isCurrentWeek(weekKey, today);
          const cardsHTML = wRecords.map(r => {
            const act = activities?.find(a => a.id === r.actId);
            const title = act?.title ?? r.actId;
            const notePreview = truncate(r.note, 40);
            return `
              <div class="card" style="margin-bottom:8px;padding:10px 14px" id="ar-card-${r.id}">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
                  <span style="flex:1;font-size:14px;font-weight:500">${title}</span>
                  <span style="font-size:13px;color:var(--primary);font-weight:600">${fmtSec(r.focusSec ?? 0)}</span>
                </div>
                <div style="font-size:12px;color:var(--text-mute);margin-bottom:4px">
                  ${r.date ?? ''} · ${EMOTION_MAP[r.emotion] ?? ''} · ${INIT_MAP[r.initType] ?? ''}
                </div>
                ${notePreview ? `<p style="font-size:13px;color:var(--text-sec);margin-bottom:6px;line-height:1.5">${notePreview}</p>` : ''}
                <div id="ar-actions-${r.id}" style="display:flex;gap:8px">
                  <button class="btn btn-ghost btn-sm" data-ar-action="edit" data-id="${r.id}">编辑</button>
                  <button class="btn btn-ghost btn-sm" data-ar-action="delete" data-id="${r.id}"
                    style="color:var(--danger)">删除</button>
                </div>
              </div>`;
          }).join('');

          return `
            <details class="diary-week-details"${isOpen ? ' open' : ''}>
              <summary class="diary-week-summary">${label}</summary>
              <div style="padding:4px 0 8px">${cardsHTML}</div>
            </details>`;
        }).join('');

      return `
        <details class="diary-year-details" open>
          <summary class="diary-year-summary">${year}年</summary>
          <div style="padding:4px 0">${weeksHTML}</div>
        </details>`;
    }).join('');

  return `
    <div class="section">
      <div class="section-title">活动记录</div>
      ${yearsHTML}
    </div>`;
}
```

**Step 4：运行测试确认通过**

```bash
npx vitest run tests/growth-records.test.js
```

预期：所有 growth-records 测试 PASS

**Step 5：全量测试**

```bash
npx vitest run
```

预期：全部 PASS（数量 ≥ 231）

**Step 6：提交**

```bash
git add js/ui/growth-records.js tests/growth-records.test.js
git commit -m "feat: add buildActivityRecordsHTML for growth tab timeline"
```

---

## Task 5：浏览器端事件处理 + 连接 `renderGrowth`

**Files:**
- Modify: `js/ui/growth-records.js`（追加浏览器端逻辑）
- Modify: `js/ui/milestones.js`（`renderGrowth` 引入并渲染活动记录）
- Modify: `js/app.js`（`record:updated` 时同步刷新成长 Tab 活动记录区块）

> 此 Task 为浏览器端接线，无自动化测试，需手动验证。

---

**Step 1：在 `growth-records.js` 底部追加浏览器端逻辑**

```js
// ── 浏览器端渲染与事件处理 ────────────────────────────────

async function _renderActivityRecords() {
  const section = document.getElementById('activity-records-section');
  if (!section) return;
  const records = await state.db.getRecords();
  section.innerHTML = buildActivityRecordsHTML({ records, activities: state.activities });
}

if (typeof document !== 'undefined') {
  // 编辑保存后刷新
  document.addEventListener('record:updated', _renderActivityRecords);

  // 编辑 / 删除 操作（事件委托，绑在 document 上）
  document.addEventListener('click', async e => {
    const btn = e.target.closest('[data-ar-action]');
    if (!btn) return;

    const action = btn.dataset.arAction;
    const id = btn.dataset.id;
    const numId = parseInt(id, 10);

    if (action === 'edit') {
      const allRecords = await state.db.getRecords();
      const record = allRecords.find(r => r.id === numId);
      if (record) {
        document.dispatchEvent(new CustomEvent('record:edit', { detail: { record } }));
      }
    } else if (action === 'delete') {
      const actionsEl = document.getElementById(`ar-actions-${id}`);
      if (!actionsEl) return;
      actionsEl.innerHTML = `
        <span style="font-size:13px;color:var(--text-sec)">确认删除？</span>
        <button class="btn btn-ghost btn-sm" data-ar-action="delete-confirm" data-id="${id}"
          style="color:var(--danger)">确认</button>
        <button class="btn btn-ghost btn-sm" data-ar-action="delete-cancel" data-id="${id}">取消</button>`;
    } else if (action === 'delete-confirm') {
      await state.db.deleteRecord(numId);
      await _renderActivityRecords();
    } else if (action === 'delete-cancel') {
      const actionsEl = document.getElementById(`ar-actions-${id}`);
      if (actionsEl) actionsEl.innerHTML = `
        <button class="btn btn-ghost btn-sm" data-ar-action="edit" data-id="${id}">编辑</button>
        <button class="btn btn-ghost btn-sm" data-ar-action="delete" data-id="${id}"
          style="color:var(--danger)">删除</button>`;
    }
  });
}
```

**Step 2：在 `milestones.js` 中引入并渲染活动记录**

2a. 在文件顶部 import 区追加：
```js
import { buildActivityRecordsHTML } from './growth-records.js';
```

2b. 在 `renderGrowth()` 函数中，找到：
```js
const diaries = await state.db.getDiaries();
body.innerHTML = buildDiaryTimelineHTML({ entries: diaries })
  + buildGrowthHTML({
      milestones: state.milestones,
```
改为：
```js
const [diaries, records] = await Promise.all([
  state.db.getDiaries(),
  state.db.getRecords(),
]);
body.innerHTML = buildDiaryTimelineHTML({ entries: diaries })
  + `<div id="activity-records-section">${buildActivityRecordsHTML({ records, activities: state.activities })}</div>`
  + buildGrowthHTML({
      milestones: state.milestones,
```

**Step 3：手动验证**

1. 打开 `index.html`
2. 进行一次活动记录（今日 Tab）
3. 切换到成长 Tab → 应看到"活动记录"区块，含刚才的记录
4. 点击编辑 → 记录 overlay 打开，修改备注，保存 → 成长 Tab 活动记录自动刷新
5. 点击删除 → inline confirm 出现 → 确认删除 → 记录消失

**Step 4：全量测试**

```bash
npx vitest run
```

预期：全部 PASS

**Step 5：提交**

```bash
git add js/ui/growth-records.js js/ui/milestones.js
git commit -m "feat: wire activity records timeline into growth tab with edit/delete"
```

---

## Task 6：移除设置页历史记录区块

**Files:**
- Modify: `js/ui/settings.js`

---

**Step 1：从 `buildSettingsHTML` 移除 `settings-records-section` HTML 块**

在 `buildSettingsHTML` 函数中，删除以下完整段落（约第 152-157 行）：

```html
<div class="section" id="settings-records-section">
  <div class="section-title">历史记录</div>
  <div class="card" id="settings-records-list">
    <p class="text-sec" style="text-align:center;padding:16px 0">加载中…</p>
  </div>
</div>
```

**Step 2：从 `renderSettings` 移除历史记录管理逻辑**

删除以下所有代码段（约第 320-408 行，从 `// ── 历史记录管理` 注释到第二个 `#settings-records-list` 监听器结束）：

- 注释 `// ── 历史记录管理 ──`
- `const RECORDS_PAGE_SIZE = 20;`
- `let recordsOffset = 0;`
- `async function renderRecordsList(append = false) { ... }` 整个函数
- `await renderRecordsList();`
- `body.querySelector('#settings-records-list')?.addEventListener(...)` 第一个监听器（sr-delete / sr-confirm / sr-cancel / sr-load-more）
- `body.querySelector('#settings-records-list')?.addEventListener(...)` 第二个监听器（sr-load-more id 匹配）

**Step 3：运行测试确认无回归**

```bash
npx vitest run tests/settings.test.js
```

预期：settings.test.js 所有 tests PASS（settings.test.js 原有测试均不涉及历史记录区块）

**Step 4：全量测试**

```bash
npx vitest run
```

预期：全部 PASS

**Step 5：手动验证**

打开设置页，确认"历史记录"区块已消失，其他设置功能（档案编辑、引导强度、导出/导入、自定义活动）正常。

**Step 6：提交**

```bash
git add js/ui/settings.js
git commit -m "feat: remove historical records section from settings page"
```

---

## Task 7：最终验收

**Step 1：全量测试（最终）**

```bash
npx vitest run
```

预期：全部 PASS，总测试数 ≥ 231（原 220 + 本次新增 ≥ 11）

**Step 2：Golden Path 手动验证清单**

| 场景 | 预期 |
|------|------|
| 开展有锚点活动后点"记录观察" | 顶部无"观察引导"卡片；"活动发起方式"下方显示填空题 |
| 填写部分锚点问题 + 备注后保存 | note 内容为 `问题 → 回答\n---\n备注` |
| 只填备注（不填锚点）保存 | note 仅含备注，无 `---` 分隔 |
| 所有填空留空，仅备注 | note 仅含备注 |
| 编辑今日记录 | 填空区不显示，直接看 note |
| 切换到成长 Tab | 显示"活动记录"区块，按年/周折叠 |
| 成长 Tab 点编辑 | overlay 打开，修改保存后时间线刷新 |
| 成长 Tab 点删除 → 确认 | 记录消失 |
| 成长 Tab 点删除 → 取消 | 恢复编辑/删除按钮 |
| 开展无锚点活动后点"记录观察" | 无填空区，备注 placeholder 为"记录你观察到的细节…" |
| 设置页 | 无"历史记录"区块 |

**Step 3：提交最终 tag（可选）**

```bash
git tag v1.8-anchor-questions
```
