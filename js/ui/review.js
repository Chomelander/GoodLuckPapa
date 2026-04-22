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

// ── buildMonthlyFormHTML ───────────────────────────────────

export function buildMonthlyFormHTML({ ageMonths }) {
  const dimsHTML = MONTHLY_DIMS.map(dim => `
    <div class="dim-item" style="margin-bottom:16px">
      <div style="font-size:14px;font-weight:500;margin-bottom:8px">${dim.label}</div>
      <div style="display:flex;gap:8px">
        ${[1, 2, 3, 4, 5].map(v => `
          <label style="flex:1;text-align:center;cursor:pointer">
            <input type="radio" name="dim-${dim.id}" value="${v}" style="display:none">
            <div class="dim-radio" data-dimid="${dim.id}" data-value="${v}"
              style="padding:8px 0;border-radius:var(--r-sm);border:1px solid var(--border);font-size:13px;color:var(--text-sec)">
              ${v}
            </div>
          </label>`).join('')}
      </div>
    </div>`).join('');

  return `
    <div class="section">
      <form id="monthly-form">
        <div class="card" style="margin-bottom:12px">
          <div style="font-size:13px;color:var(--text-sec);margin-bottom:16px;line-height:1.6">
            为孩子本月（${ageMonths}个月）在各维度的表现评分，1分=几乎没有观察，5分=非常突出。
          </div>
          ${dimsHTML}
        </div>
        <div class="card" style="margin-bottom:12px">
          <div class="form-label" style="font-size:13px;font-weight:500;margin-bottom:8px">本月最大发现（选填）</div>
          <textarea class="form-input form-textarea" id="monthly-note"
            placeholder="这个月你最惊喜的观察是…" style="margin-bottom:0"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-full">保存复盘</button>
      </form>
    </div>`;
}

// ── buildMonthlySavedHTML ──────────────────────────────────

function buildMonthlySavedHTML({ saved }) {
  const dotsHTML = (score) => [1, 2, 3, 4, 5].map(v =>
    `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;margin-left:4px;
      background:${v <= score ? 'var(--primary)' : 'var(--border)'}"></span>`
  ).join('');

  const scoresHTML = MONTHLY_DIMS.map(dim => {
    const score = saved.scores?.[dim.id] ?? 0;
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;
        border-bottom:1px solid var(--border)">
        <div style="font-size:14px;color:var(--text)">${dim.label}</div>
        <div style="display:flex;align-items:center">
          ${score > 0 ? dotsHTML(score) : `<span style="font-size:12px;color:var(--text-mute)">未评</span>`}
        </div>
      </div>`;
  }).join('');

  const noteHTML = saved.note
    ? `<div class="card" style="margin-bottom:0">
        <div style="font-size:13px;font-weight:500;color:var(--text-sec);margin-bottom:8px">本月最大发现</div>
        <div style="font-size:14px;line-height:1.7;color:var(--text)">${saved.note}</div>
       </div>`
    : '';

  return `
    <div class="section">
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:14px;font-weight:600;color:var(--text)">各维度评分</div>
          <div style="font-size:12px;color:var(--primary);font-weight:500">已完成</div>
        </div>
        ${scoresHTML}
      </div>
      ${noteHTML}
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
    const saved = await state.db.getMonthlyReview(month);
    monthlyEl.innerHTML = saved
      ? buildMonthlySavedHTML({ saved })
      : buildMonthlyFormHTML({ ageMonths: state.ageMonths });

    if (!saved) _bindMonthlySubmit(month);
  }
}

function _bindMonthlySubmit(month) {
  if (typeof document === 'undefined') return;
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'monthly-form') return;
    e.preventDefault();

    const scores = {};
    MONTHLY_DIMS.forEach(dim => {
      const checked = document.querySelector(`input[name="dim-${dim.id}"]:checked`);
      scores[dim.id] = checked ? parseInt(checked.value, 10) : 0;
    });

    const note = document.getElementById('monthly-note')?.value.trim() ?? '';
    await state.db.saveMonthlyReview({ month, scores, note, ageMonths: state.ageMonths });
    renderReview();
  }, { once: true });
}
