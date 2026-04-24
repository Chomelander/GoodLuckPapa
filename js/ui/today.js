/**
 * M3 Today Tab — 今日推荐
 * 依赖：state.db, state.activities, state.ageMonths, state.today
 */
import { state } from '../app.js';
import { getRecommendations } from '../rules.js';
import { buildSopHTML } from './sop.js';

const DOMAIN_CLASS = {
  sensorial: 'cog',
  practical_life: 'hab',
  movement: 'mot',
  language: 'lang',
  emotional_social: 'emo',
};

const DOMAIN_LABEL = {
  sensorial: '感官',
  practical_life: '日常生活',
  movement: '运动',
  language: '语言',
  emotional_social: '情绪社交',
};

function domainClass(domain) {
  return DOMAIN_CLASS[domain] ?? 'cog';
}

function domainLabel(domain) {
  return DOMAIN_LABEL[domain] ?? domain;
}

export function buildTodayHTML({ main, backups, daysSince }) {
  if (!main) {
    return `
      <div class="section" style="text-align:center;padding:48px 16px">
        <p class="text-sec">暂无推荐活动</p>
        <p class="text-xs text-mute" style="margin-top:8px">当前月龄暂无匹配活动，请在活动库中浏览全部活动</p>
      </div>`;
  }

  const daysSinceText = daysSince === null
    ? '首次'
    : daysSince === 0
    ? '今天做过'
    : `${daysSince}天前`;

  const backupsHTML = backups.length > 0
    ? `<div class="section">
        <div class="section-title">备选活动</div>
        ${backups.map(act => {
          const matHTML = act.materials?.length
            ? `<ul style="list-style:none;padding:0;margin:6px 0 8px">
                ${act.materials.map(m => `
                  <li style="display:flex;align-items:baseline;gap:6px;font-size:13px;color:var(--text-sec);padding:3px 0">
                    <span style="flex-shrink:0">☐</span><span>${m}</span>
                  </li>`).join('')}
               </ul>`
            : '';
          return `
          <div class="card" style="margin-bottom:12px">
            <div class="flex-center gap-8" style="margin-bottom:4px">
              <span class="card-title" style="flex:1">${act.title}</span>
              <span class="badge badge-${domainClass(act.domain)}">${domainLabel(act.domain)}</span>
            </div>
            <p class="card-sub">${act.ageRange[0]}-${act.ageRange[1]}个月</p>
            ${matHTML}
            <div class="flex gap-8" style="margin-top:8px">
              <button class="btn btn-secondary btn-sm" style="flex:1" data-action="start-timer" data-id="${act.id}">开始计时</button>
              <button class="btn btn-ghost btn-sm" data-action="fill-record" data-id="${act.id}">补填</button>
              <button class="btn btn-ghost btn-sm" data-action="view-detail" data-id="${act.id}">详情</button>
            </div>
          </div>`;
        }).join('')}
      </div>`
    : '';

  return `
    <div class="section">
      <div class="section-title">今日推荐</div>
      <div class="card">
        <div class="flex-center gap-8" style="margin-bottom:4px">
          <span class="card-title">${main.title}</span>
          <span class="badge badge-${domainClass(main.domain)}">${domainLabel(main.domain)}</span>
        </div>
        <p class="card-sub">${main.ageRange[0]}-${main.ageRange[1]}个月 · 上次：${daysSinceText}</p>
        ${main.observeAnchor
          ? `<p style="font-size:13px;color:var(--text-sec);margin-top:8px;line-height:1.5">${main.observeAnchor}</p>`
          : ''}
        ${main.materials?.length
          ? `<div style="margin-top:10px">
               <div style="font-size:11px;font-weight:600;color:var(--text-mute);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">需要准备</div>
               <ul style="list-style:none;padding:0">
                 ${main.materials.map(m => `
                   <li style="display:flex;align-items:baseline;gap:6px;font-size:13px;color:var(--text-sec);padding:3px 0;border-bottom:1px solid var(--border)">
                     <span style="flex-shrink:0">☐</span><span>${m}</span>
                   </li>`).join('')}
               </ul>
             </div>`
          : ''}
        <div class="flex gap-8" style="margin-top:12px">
          <button class="btn btn-primary" style="flex:1" data-action="start-timer" data-id="${main.id}">
            开始计时
          </button>
          <button class="btn btn-ghost btn-sm" data-action="fill-record" data-id="${main.id}">补填</button>
          <button class="btn btn-ghost btn-sm" data-action="view-detail" data-id="${main.id}">
            详情
          </button>
        </div>
      </div>
    </div>
    ${backupsHTML}`;
}

const EMOTION_LABEL = {
  engaged: '专注', happy: '愉悦', calm: '平静', distracted: '分心', frustrated: '挫败',
};

function fmtSec(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function buildTodayCompletedHTML({ records, activities, today }) {
  const todayRecords = records.filter(r => r.date === today);
  if (todayRecords.length === 0) return '';

  const items = todayRecords.map(r => {
    const act = activities.find(a => a.id === r.actId);
    const title = act?.title ?? r.actId;
    const emotion = EMOTION_LABEL[r.emotion] ?? r.emotion ?? '';
    return `
      <div class="card" id="record-card-${r.id}" style="padding:12px 16px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="flex:1">
            <div class="card-title">${title}</div>
            ${emotion ? `<div class="card-sub" style="margin-top:2px">${emotion}</div>` : ''}
          </div>
          <div style="font-size:14px;font-weight:600;color:var(--primary)">${fmtSec(r.focusSec)}</div>
        </div>
        <div class="flex gap-8" style="margin-top:8px" id="record-actions-${r.id}">
          <button class="btn btn-ghost btn-sm" data-action="edit-record" data-id="${r.id}">编辑</button>
          <button class="btn btn-ghost btn-sm" data-action="delete-record" data-id="${r.id}"
            style="color:var(--danger)">删除</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="section">
      <div class="section-title">今日记录</div>
      ${items}
    </div>`;
}

export async function renderToday() {
  const body = document.getElementById('today-body');
  if (!body) return;

  const records = await state.db.getRecords();
  const { main, backups } = getRecommendations({
    activities: state.activities,
    records,
    ageMonths: state.ageMonths,
    today: state.today,
  });

  let daysSince = null;
  if (main) {
    const actRecords = records.filter(r => r.actId === main.id);
    if (actRecords.length > 0) {
      const lastDate = [...actRecords].sort((a, b) => b.date.localeCompare(a.date))[0].date;
      daysSince = Math.floor((new Date(state.today) - new Date(lastDate)) / 86400000);
    }
  }

  const settings = await state.db.getSettings();
  const guideIntensity = settings.guideIntensity ?? 'normal';

  body.innerHTML = buildTodayHTML({ main, backups, daysSince })
    + buildTodayCompletedHTML({ records, activities: state.activities, today: state.today })
    + buildSopHTML({ guideIntensity });

  body.onclick = async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === 'start-timer') {
      document.dispatchEvent(new CustomEvent('today:startTimer', { detail: { actId: id } }));
    } else if (action === 'fill-record') {
      document.dispatchEvent(new CustomEvent('today:fillRecord', { detail: { actId: id } }));
    } else if (action === 'view-detail') {
      document.dispatchEvent(new CustomEvent('today:viewDetail', { detail: { actId: id } }));
    } else if (action === 'edit-record') {
      const allRecords = await state.db.getRecords();
      const record = allRecords.find(r => r.id === parseInt(id, 10));
      if (record) {
        document.dispatchEvent(new CustomEvent('record:edit', { detail: { record } }));
      }
    } else if (action === 'delete-record') {
      // inline confirm
      const actionsEl = document.getElementById(`record-actions-${id}`);
      if (!actionsEl) return;
      actionsEl.innerHTML = `
        <span style="font-size:13px;color:var(--text-sec)">确认删除？</span>
        <button class="btn btn-ghost btn-sm" data-action="confirm-delete" data-id="${id}"
          style="color:var(--danger)">确认</button>
        <button class="btn btn-ghost btn-sm" data-action="cancel-delete" data-id="${id}">取消</button>`;
    } else if (action === 'confirm-delete') {
      await state.db.deleteRecord(parseInt(id, 10));
      renderToday();
    } else if (action === 'cancel-delete') {
      renderToday();
    }
  };
}
