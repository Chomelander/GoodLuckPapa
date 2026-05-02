/**
 * M8 周复盘 + M8.5 月度复盘
 */
import { state } from '../app.js';

// ── 蒙氏10维度 ─────────────────────────────────────────────
const MONTHLY_DIMS = [
  { id: 'movement',       label: '动作发展' },
  { id: 'sensorial',      label: '感官探索' },
  { id: 'language',       label: '语言发展' },
  { id: 'math_logic',     label: '数理逻辑' },
  { id: 'practical_life', label: '日常生活' },
  { id: 'social_emotion', label: '社会情绪' },
  { id: 'concentration',  label: '专注与秩序' },
  { id: 'independence',   label: '独立意识' },
  { id: 'creativity',     label: '创造与想象' },
  { id: 'nature_culture', label: '自然与文化' },
];

// 维度 id → 里程碑 domain + 活动 domain 的映射
// 里程碑 domain 来自 milestones.js normalizeMilestone 的结果字段
// 活动 domain 来自 activities-complete.js DOMAIN_MAP 的结果字段
const DIM_DATA_MAP = {
  movement:       { mDomains: ['motor'],                        aDomains: ['movement'] },
  sensorial:      { mDomains: ['sensory'],                      aDomains: ['sensorial'] },
  language:       { mDomains: ['language'],                     aDomains: ['language'] },
  math_logic:     { mDomains: ['cognitive', 'math'],            aDomains: ['math'] },
  practical_life: { mDomains: ['self_care', 'practical'],       aDomains: ['practical_life'] },
  social_emotion: { mDomains: ['emotional_social', 'social'],   aDomains: ['emotional_social'] },
  concentration:  { mDomains: ['cognitive'],                    aDomains: [] },
  independence:   { mDomains: ['self_care'],                    aDomains: ['practical_life'] },
  creativity:     { mDomains: [],                               aDomains: [] },
  nature_culture: { mDomains: [],                               aDomains: ['culture'] },
};

/**
 * 计算各维度客观指标（纯函数，可单元测试）
 * @param {Object} p
 * @param {Array}  p.milestones      - 里程碑定义列表（来自 MILESTONES）
 * @param {Array}  p.activities      - 活动定义列表（来自 state.activities）
 * @param {number} p.ageMonths       - 孩子当前月龄
 * @param {string} p.month           - 统计月份 'YYYY-MM'
 * @param {Object} p.milestoneStates - { [milestoneId]: { status, ... } }
 * @param {Array}  p.records         - 所有观察记录
 * @returns {Array} stats per dim: { id, label, milestoneRate, milestoneAchieved, milestoneApplicable, frequency }
 */
export function computeDimensionStats({ milestones, activities, ageMonths, month, milestoneStates, records }) {
  const actDomain = {};
  for (const a of activities) actDomain[a.id] = a.domain;

  const monthRecords = records.filter(r => r.date?.startsWith(month));

  return MONTHLY_DIMS.map(dim => {
    const mapping = DIM_DATA_MAP[dim.id];

    // 里程碑完成率：只统计当前月龄应已达到的里程碑（windowEnd <= ageMonths + 1）
    const applicable = milestones.filter(m =>
      mapping.mDomains.includes(m.domain) &&
      m.windowEnd != null &&
      m.windowEnd <= ageMonths + 1
    );
    const achieved = applicable.filter(m =>
      (milestoneStates[m.id]?.status ?? 'pending') === 'achieved'
    );
    const milestoneRate = applicable.length > 0
      ? achieved.length / applicable.length
      : null; // null = 当前月龄暂无适用里程碑

    // 观察频次：本月内该维度的活动记录数
    const frequency = monthRecords.filter(r =>
      mapping.aDomains.includes(actDomain[r.actId])
    ).length;

    return {
      id: dim.id,
      label: dim.label,
      milestoneRate,
      milestoneAchieved: achieved.length,
      milestoneApplicable: applicable.length,
      frequency,
    };
  });
}

// 周复盘5问
const WEEKLY_QUESTIONS = [
  '本周孩子在哪个活动中表现出最强的专注？',
  '本周有没有观察到新的行为或技能？',
  '哪些材料或环境引发了孩子的自发探索？',
  '本周我作为观察者做得最好的一点是什么？',
  '下周想重点观察哪个维度的发展？',
];

// ── calcWeeklyStats ────────────────────────────────────────

export function calcWeeklyStats({ records, today }) {
  const todayMs = new Date(today).getTime();
  const weekAgoMs = todayMs - 6 * 86400000;

  const weekRecords = records.filter(r => {
    const d = new Date(r.date).getTime();
    return d >= weekAgoMs && d <= todayMs;
  });

  if (weekRecords.length === 0) {
    return { totalRecords: 0, activeDays: 0, continuityWarning: false, domainsCovered: [] };
  }

  const uniqueDates = [...new Set(weekRecords.map(r => r.date))].sort();
  const activeDays = uniqueDates.length;

  // Check max gap between consecutive active days
  let maxGap = 0;
  for (let i = 1; i < uniqueDates.length; i++) {
    const gap = Math.floor(
      (new Date(uniqueDates[i]) - new Date(uniqueDates[i - 1])) / 86400000
    );
    if (gap > maxGap) maxGap = gap;
  }

  // Also check gap from last active day to today
  const lastDate = uniqueDates[uniqueDates.length - 1];
  const gapFromLast = Math.floor((todayMs - new Date(lastDate).getTime()) / 86400000);
  if (gapFromLast > maxGap) maxGap = gapFromLast;

  const continuityWarning = maxGap > 2;
  const domainsCovered = [...new Set(weekRecords.map(r => r.domain).filter(Boolean))];

  return { totalRecords: weekRecords.length, activeDays, continuityWarning, domainsCovered };
}

// ── buildWeekRecordsHTML ────────────────────────────────────

const EMOTION_LABEL = {
  engaged: '专注', happy: '愉悦', calm: '平静', distracted: '分心', frustrated: '挫败',
};

function fmtSec(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function buildWeekRecordsHTML({ records, activities, today }) {
  const todayMs = new Date(today).getTime();
  const weekAgoMs = todayMs - 6 * 86400000;
  const weekRecords = records
    .filter(r => {
      const d = new Date(r.date).getTime();
      return d >= weekAgoMs && d <= todayMs;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  if (weekRecords.length === 0) {
    return `<div style="text-align:center;padding:32px 16px;color:var(--text-sec);font-size:14px">本周暂无记录</div>`;
  }

  const items = weekRecords.map(r => {
    const act = activities.find(a => a.id === r.actId);
    const title = act?.title ?? r.actId;
    const mmdd = r.date.slice(5); // "04-11"
    const emotion = EMOTION_LABEL[r.emotion] ?? '';
    return `
      <div class="card" style="display:flex;align-items:center;gap:12px;padding:12px 16px;margin-bottom:8px">
        <div style="flex:1">
          <div class="card-title">${title}</div>
          <div class="card-sub" style="margin-top:2px">${mmdd}${emotion ? ' · ' + emotion : ''}</div>
        </div>
        <div style="font-size:14px;font-weight:600;color:var(--primary)">${fmtSec(r.focusSec)}</div>
      </div>`;
  }).join('');

  return items;
}

// ── buildWeeklyHTML ────────────────────────────────────────

export function buildWeeklyHTML({ records, today, ageMonths }) {
  const stats = calcWeeklyStats({ records, today });

  if (stats.totalRecords === 0) {
    return `
      <div class="section" style="text-align:center;padding:32px 16px">
        <p class="text-sec">本周还没有记录</p>
        <p class="text-xs text-mute" style="margin-top:8px">完成几次活动观察后，这里会显示本周小结</p>
      </div>`;
  }

  const warningHTML = stats.continuityWarning
    ? `<div style="background:color-mix(in srgb,var(--warning) 12%,white);border-radius:var(--r-md);padding:12px;margin-bottom:16px;font-size:13px;color:var(--warning)">
        连续性提醒：本周有超过2天的观察空白，保持每2天一次的节奏效果更好。
       </div>`
    : '';

  const questionsHTML = WEEKLY_QUESTIONS.map((q, i) => `
    <div class="week-question" style="margin-bottom:12px">
      <div style="font-size:13px;font-weight:600;color:var(--text-sec);margin-bottom:4px">Q${i + 1}</div>
      <div style="font-size:14px;line-height:1.6">${q}</div>
    </div>`).join('');

  return `
    <div class="section">
      <div class="section-title">本周数据</div>
      <div class="card" data-action="view-records"
        style="display:flex;gap:16px;justify-content:space-around;text-align:center;cursor:pointer">
        <div>
          <div style="font-size:28px;font-weight:700;color:var(--primary)">${stats.totalRecords}</div>
          <div class="text-xs text-mute">次观察</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:700;color:var(--primary)">${stats.activeDays}</div>
          <div class="text-xs text-mute">天活跃</div>
        </div>
        <div>
          <div style="font-size:28px;font-weight:700;color:var(--primary)">${stats.domainsCovered.length}</div>
          <div class="text-xs text-mute">个维度</div>
        </div>
      </div>
    </div>

    ${warningHTML}

    <div class="section">
      <div class="section-title">周复盘5问</div>
      <div class="card">
        ${questionsHTML}
      </div>
    </div>`;
}

// ── buildMonthlyStatsHTML ──────────────────────────────────

export function buildMonthlyStatsHTML({ stats, note, ageMonths }) {
  const dimCardsHTML = stats.map(dim => {
    const pct = dim.milestoneRate !== null ? Math.round(dim.milestoneRate * 100) : null;
    const barColor = pct === null ? 'var(--border)'
      : pct >= 70 ? '#4caf50'
      : pct >= 40 ? '#ff9800'
      : '#f44336';

    const milestoneSection = pct !== null
      ? `<div style="display:flex;align-items:center;gap:8px">
           <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden">
             <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px"></div>
           </div>
           <span style="font-size:11px;color:${barColor};font-weight:500;white-space:nowrap">
             ${pct}% (${dim.milestoneAchieved}/${dim.milestoneApplicable})
           </span>
         </div>`
      : `<div style="font-size:11px;color:var(--text-mute)">暂无适用里程碑</div>`;

    return `
      <div class="dim-stat-item" style="padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:14px;font-weight:500;color:var(--text)">${dim.label}</span>
          <span style="font-size:12px;color:var(--text-sec)">📝 × ${dim.frequency}</span>
        </div>
        ${milestoneSection}
      </div>`;
  }).join('');

  const noteSection = note
    ? `<div style="font-size:13px;font-weight:500;color:var(--text-sec);margin-bottom:8px">本月最大发现</div>
       <div style="font-size:14px;line-height:1.7;color:var(--text)">${note}</div>`
    : `<div class="form-label" style="font-size:13px;font-weight:500;margin-bottom:8px">本月最大发现（选填）</div>
       <textarea class="form-input form-textarea" id="monthly-note"
         placeholder="这个月你最惊喜的观察是…" style="margin-bottom:8px"></textarea>
       <button id="save-monthly-note" class="btn btn-primary btn-full">保存备注</button>`;

  return `
    <div class="section">
      <div class="card" style="margin-bottom:12px">
        <div style="font-size:13px;color:var(--text-sec);margin-bottom:12px;line-height:1.6">
          ${ageMonths} 个月 · 本月各维度客观数据
        </div>
        ${dimCardsHTML}
      </div>
      <div class="card">${noteSection}</div>
    </div>`;
}

// ── 浏览器端渲染（Growth tab 下方） ────────────────────────

export async function renderReview() {
  const weeklyEl = document.getElementById('weekly-body');
  const monthlyEl = document.getElementById('monthly-body');
  if (!weeklyEl && !monthlyEl) return;

  const records = await state.db.getRecords();

  if (weeklyEl) {
    weeklyEl.innerHTML = buildWeeklyHTML({
      records,
      today: state.today,
      ageMonths: state.ageMonths,
    });

    weeklyEl.addEventListener('click', e => {
      if (!e.target.closest('[data-action="view-records"]')) return;
      const modal = document.getElementById('activity-modal');
      const titleEl = document.getElementById('activity-modal-title');
      const bodyEl = document.getElementById('activity-modal-body');
      if (!modal || !bodyEl) return;
      if (titleEl) titleEl.textContent = '本周观察记录';
      bodyEl.innerHTML = buildWeekRecordsHTML({
        records,
        activities: state.activities,
        today: state.today,
      });
      modal.classList.add('open');
    }, { once: false });
  }

  if (monthlyEl) {
    const month = state.today.slice(0, 7);

    // 加载里程碑状态
    const milestoneStates = {};
    for (const m of state.milestones) {
      const saved = await state.db.getMilestoneState(m.id);
      if (saved) milestoneStates[m.id] = saved;
    }

    const stats = computeDimensionStats({
      milestones: state.milestones,
      activities: state.activities,
      ageMonths: state.ageMonths,
      month,
      milestoneStates,
      records,
    });

    const saved = await state.db.getMonthlyReview(month);
    monthlyEl.innerHTML = buildMonthlyStatsHTML({
      stats,
      note: saved?.note ?? null,
      ageMonths: state.ageMonths,
    });

    if (!saved?.note) _bindNoteSubmit(month);
  }
}

function _bindNoteSubmit(month) {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('save-monthly-note');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const note = document.getElementById('monthly-note')?.value.trim() ?? '';
    if (!note) return;
    const existing = await state.db.getMonthlyReview(month);
    await state.db.saveMonthlyReview({
      ...(existing ?? {}),
      month,
      note,
      ageMonths: state.ageMonths,
    });
    renderReview();
  });
}
