/**
 * M2 活动库 + M2.5 活动↔里程碑双向联动
 */
import { state } from '../app.js';

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

function domainClass(domain) { return DOMAIN_CLASS[domain] ?? 'cog'; }
function domainLabel(domain) { return DOMAIN_LABEL[domain] ?? domain; }

export function filterByAge(activities, ageMonths) {
  return activities.filter(a => ageMonths >= a.ageRange[0] && ageMonths < a.ageRange[1]);
}

export function buildActivitiesHTML({ activities, ageMonths }) {
  const filtered = filterByAge(activities, ageMonths);

  if (filtered.length === 0) {
    return `<div class="section" style="text-align:center;padding:48px 16px">
      <p class="text-sec">暂无活动</p>
      <p class="text-xs text-mute" style="margin-top:8px">当前月龄（${ageMonths}个月）暂无匹配活动</p>
    </div>`;
  }

  return `
    <div class="section">
      <div class="section-title">适合当前月龄（${ageMonths}个月）</div>
      ${filtered.map(act => `
        <div class="card" style="cursor:pointer" data-actid="${act.id}">
          <div class="flex-center gap-8" style="margin-bottom:4px">
            <span class="card-title" style="flex:1">${act.title}</span>
            <span class="badge badge-${domainClass(act.domain)}">${domainLabel(act.domain)}</span>
          </div>
          <p class="card-sub">${act.ageRange[0]}-${act.ageRange[1]}个月</p>
          ${act.observeAnchor
            ? `<p style="font-size:13px;color:var(--text-sec);margin-top:6px;line-height:1.5">${act.observeAnchor}</p>`
            : ''}
        </div>
      `).join('')}
    </div>`;
}

export function buildActivityDetailHTML({ activity, milestones, guideIntensity = 'normal' }) {
  const linkedMs = milestones.filter(m => activity.linkedMilestones?.includes(m.id));
  const showGuide = guideIntensity !== 'light';

  // ── A2 准备环境 ────────────────────────────────────────────
  const hasMaterials = activity.materials?.length > 0;
  const hasEnv = !!activity.environment;
  const hasErrorControl = !!activity.errorControl;

  const envHTML = (hasMaterials || hasEnv || hasErrorControl)
    ? `<div class="section">
         <div class="section-title">准备环境</div>
         ${hasMaterials
           ? `<div style="margin-bottom:12px">
                <div style="font-size:12px;font-weight:600;color:var(--text-mute);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">物品清单</div>
                <ul style="list-style:none;padding:0">
                  ${activity.materials.map(m => `
                    <li style="display:flex;align-items:baseline;gap:8px;font-size:14px;padding:6px 0;border-bottom:1px solid var(--border)">
                      <span style="color:var(--text-mute);flex-shrink:0;font-size:16px">☐</span>
                      <span>${m}</span>
                    </li>`).join('')}
                </ul>
              </div>`
           : ''}
         ${hasEnv
           ? `<div style="margin-bottom:8px">
                <div style="font-size:12px;font-weight:600;color:var(--text-mute);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">场地</div>
                <p style="font-size:13px;color:var(--text-sec);line-height:1.6">${activity.environment}</p>
              </div>`
           : ''}
         ${hasErrorControl
           ? `<div>
                <div style="font-size:12px;font-weight:600;color:var(--text-mute);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">错误控制</div>
                <p style="font-size:13px;color:var(--text-sec);line-height:1.6">${activity.errorControl}</p>
              </div>`
           : ''}
       </div>`
    : '';

  const phasesHTML = showGuide && activity.phases?.length
    ? `<div class="section-title" style="margin-top:16px">观察阶段</div>
       ${activity.phases.map(p => `
         <div style="margin-bottom:8px">
           <div style="font-size:13px;font-weight:600">${p.label}</div>
           <div style="font-size:13px;color:var(--text-sec)">${p.desc}</div>
         </div>`).join('')}`
    : '';

  const focusHTML = showGuide && activity.observeFocus?.length
    ? `<ul style="margin:8px 0 0 16px;font-size:13px;color:var(--text-sec);line-height:1.8">
         ${activity.observeFocus.map(f => `<li>${f}</li>`).join('')}
       </ul>`
    : '';

  const milestonesHTML = linkedMs.length
    ? `<div class="section-title" style="margin-top:16px">促进里程碑</div>
       ${linkedMs.map(m => `
         <div class="card" style="margin-bottom:8px">
           <span class="card-title">${m.title}</span>
         </div>`).join('')}`
    : '';

  const theoryHTML = activity.theoryBite
    ? `<div style="background:#F8F8F8;border-radius:var(--r-md);padding:12px;margin-top:16px;font-size:13px;color:var(--text-sec);line-height:1.6">
         ${activity.theoryBite}
       </div>`
    : '';

  return `
    <div class="card">
      <div class="flex-center gap-8" style="margin-bottom:8px">
        <span class="card-title">${activity.title}</span>
        <span class="badge badge-${domainClass(activity.domain)}">${domainLabel(activity.domain)}</span>
      </div>
      <p class="card-sub">${activity.ageRange[0]}-${activity.ageRange[1]}个月</p>
    </div>

    ${envHTML}

    <div class="section">
      <div class="section-title">观察锚点</div>
      <p style="font-size:14px;line-height:1.6">${activity.observeAnchor ?? ''}</p>
      ${focusHTML}
      ${phasesHTML}
    </div>

    ${milestonesHTML}
    ${theoryHTML}

    <div style="padding:0 16px 16px;display:flex;gap:8px">
      <button class="btn btn-primary btn-full" style="flex:1" data-action="start-timer" data-id="${activity.id}">
        开始计时观察
      </button>
      <button class="btn btn-ghost btn-sm" data-action="fill-record" data-id="${activity.id}">补填记录</button>
    </div>`;
}

// ── 浏览器端渲染 ──────────────────────────────────────────

let _rendered = false;

export function renderActivities() {
  const body = document.getElementById('activities-body');
  if (!body) return;

  body.innerHTML = buildActivitiesHTML({
    activities: state.activities,
    ageMonths: state.ageMonths,
  });

  if (!_rendered) {
    _rendered = true;
    body.addEventListener('click', e => {
      const card = e.target.closest('[data-actid]');
      if (!card) return;
      showActivityDetail(card.dataset.actid);
    });
  }
}

export async function showActivityDetail(actId) {
  const activity = state.activities.find(a => a.id === actId);
  if (!activity) return;

  const modal = document.getElementById('activity-modal');
  const titleEl = document.getElementById('activity-modal-title');
  const bodyEl = document.getElementById('activity-modal-body');

  const settings = await state.db.getSettings();
  const guideIntensity = settings.guideIntensity ?? 'normal';

  if (titleEl) titleEl.textContent = activity.title;
  if (bodyEl) bodyEl.innerHTML = buildActivityDetailHTML({
    activity,
    milestones: state.milestones,
    guideIntensity,
  });
  modal?.classList.add('open');

  // 活动详情页：开始计时 / 补填记录
  bodyEl?.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'start-timer') {
      modal.classList.remove('open');
      document.dispatchEvent(new CustomEvent('today:startTimer', { detail: { actId: id } }));
    } else if (action === 'fill-record') {
      modal.classList.remove('open');
      document.dispatchEvent(new CustomEvent('today:fillRecord', { detail: { actId: id } }));
    }
  }, { once: true });
}

if (typeof document !== 'undefined') {
  document.getElementById('activity-modal-close')
    ?.addEventListener('click', () => {
      document.getElementById('activity-modal')?.classList.remove('open');
    });
}
