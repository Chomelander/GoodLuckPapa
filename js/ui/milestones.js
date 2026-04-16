/**
 * M6 里程碑对照 + M_MilestoneConfirm + M2.5 反向联动
 */
import { state } from '../app.js';
import { getMilestoneStatus } from '../rules.js';
import { buildDiaryTimelineHTML } from './diary.js';
import { buildActivityRecordsHTML } from './growth-records.js';

const STATUS_LABEL = {
  pending:  '待观察',
  watching: '观察中',
  achieved: '已达成',
  delayed:  '需关注',
};

const DOMAIN_LABEL = {
  cognitive:        '认知',
  motor:            '运动',
  language:         '语言',
  emotional_social: '情绪社交',
  self_care:        '自理',
};

export function buildGrowthHTML({ milestones, ageMonths, milestoneStates }) {
  if (!milestones.length) {
    return `<div class="section" style="text-align:center;padding:48px 16px">
      <p class="text-sec">暂无里程碑数据</p>
    </div>`;
  }

  // Group by domain
  const groups = {};
  for (const m of milestones) {
    const saved = milestoneStates[m.id];
    const status = saved?.status
      ?? getMilestoneStatus({
           ageMonths,
           windowStart: m.windowStart,
           windowEnd: m.windowEnd,
           achieved: false,
         });
    const achievedDate = saved?.achievedDate ?? null;

    if (!groups[m.domain]) groups[m.domain] = [];
    groups[m.domain].push({ m, status, achievedDate });
  }

  return Object.entries(groups).map(([domain, items]) => `
    <div class="section">
      <div class="section-title">${DOMAIN_LABEL[domain] ?? domain}</div>
      ${items.map(({ m, status, achievedDate }) => `
        <div class="card" style="cursor:pointer" data-milestoneid="${m.id}">
          <div class="flex-center gap-8">
            <span class="card-title" style="flex:1">${m.title}</span>
            <span class="badge badge-${status}">${STATUS_LABEL[status]}</span>
          </div>
          <p class="card-sub" style="margin-top:4px">
            ${m.windowStart}-${m.windowEnd}个月
            ${achievedDate ? ` · 达成于 ${achievedDate}` : ''}
          </p>
        </div>
      `).join('')}
    </div>
  `).join('');
}

export function buildMilestoneConfirmHTML({ milestone, status }) {
  const confirmBtn = status !== 'achieved'
    ? `<button class="btn btn-primary btn-full" data-milestone-action="confirm">确认已达成</button>`
    : `<div style="font-size:13px;color:var(--success);text-align:center;padding:8px">已达成</div>`;

  const linkedActSection = milestone.linkedActivities?.length
    ? `<div style="margin-top:16px">
         <div class="section-title">相关活动</div>
         ${milestone.linkedActivities.map(id => `
           <div class="card" style="margin-bottom:8px;cursor:pointer" data-actid="${id}">
             <span class="card-sub">${id}</span>
           </div>`).join('')}
       </div>`
    : '';

  return `
    <div class="overlay-handle"></div>
    <div style="font-size:17px;font-weight:600;margin-bottom:16px">${milestone.title}</div>

    <div class="card" style="margin-bottom:16px">
      <div style="font-size:13px;font-weight:600;color:var(--text-sec);margin-bottom:6px">观察提示</div>
      <p style="font-size:14px;line-height:1.6">${milestone.observeTip ?? ''}</p>
    </div>

    ${confirmBtn}
    ${linkedActSection}`;
}

// ── 浏览器端渲染 ──────────────────────────────────────────

export async function renderGrowth() {
  const body = document.getElementById('growth-body');
  if (!body) return;

  // Load saved milestone states
  const milestoneStates = {};
  for (const m of state.milestones) {
    const saved = await state.db.getMilestoneState(m.id);
    if (saved) milestoneStates[m.id] = saved;
  }

  // 日记时间线 + 活动记录时间线插在里程碑前面
  const [diaries, records] = await Promise.all([
    state.db.getDiaries(),
    state.db.getRecords(),
  ]);
  body.innerHTML = buildDiaryTimelineHTML({ entries: diaries })
    + `<div id="activity-records-section">${buildActivityRecordsHTML({ records, activities: state.activities })}</div>`
    + buildGrowthHTML({
        milestones: state.milestones,
        ageMonths: state.ageMonths,
        milestoneStates,
      });

  body.addEventListener('click', e => {
    const card = e.target.closest('[data-milestoneid]');
    if (!card) return;
    _showMilestoneConfirm(card.dataset.milestoneid, milestoneStates);
  });
}

function _showMilestoneConfirm(milestoneId, milestoneStates) {
  const milestone = state.milestones.find(m => m.id === milestoneId);
  if (!milestone) return;

  const saved = milestoneStates[milestoneId];
  const status = saved?.status
    ?? getMilestoneStatus({
         ageMonths: state.ageMonths,
         windowStart: milestone.windowStart,
         windowEnd: milestone.windowEnd,
         achieved: false,
       });

  const body = document.getElementById('milestone-confirm-body');
  const backdrop = document.getElementById('milestone-confirm-backdrop');
  const overlay = document.getElementById('milestone-confirm-overlay');

  body.innerHTML = buildMilestoneConfirmHTML({ milestone, status });
  backdrop.classList.add('open');
  overlay.removeAttribute('hidden');

  const close = () => {
    backdrop.classList.remove('open');
    overlay.setAttribute('hidden', '');
  };

  overlay.querySelector('[data-milestone-action="confirm"]')
    ?.addEventListener('click', async () => {
      const achievedDate = state.today;
      await state.db.saveMilestoneState(milestoneId, { status: 'achieved', achievedDate });
      milestoneStates[milestoneId] = { status: 'achieved', achievedDate };
      close();
      renderGrowth(); // refresh
    });

  backdrop.addEventListener('click', close, { once: true });
}
