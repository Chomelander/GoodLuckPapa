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
