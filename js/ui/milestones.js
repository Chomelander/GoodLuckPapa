/**
 * M6 里程碑对照 + M_MilestoneConfirm + M2.5 反向联动
 */
import { state } from '../app.js';
import { getMilestoneStatus } from '../rules.js';
import { pushMilestoneState } from '../sync.js';
// 注：日记和活动记录已移至 moments.js（时光选项卡）

// ── 分页状态（模块级）────────────────────────────────────────
let _groupIdx = 0;
let _groups = [];           // 排序后的唯一 windowStart 值
let _cachedMilestoneStates = {};

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
  math:             '数学',
  social:           '社会交往',
  practical:        '日常生活',
  sensory:          '感官',
  habit:            '习惯',
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

// ── 分页辅助函数 ──────────────────────────────────────────

function _initGroups(ageMonths) {
  const starts = [...new Set(state.milestones.map(m => m.windowStart))].sort((a, b) => a - b);
  _groups = starts;
  _groupIdx = 0;
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] <= ageMonths) _groupIdx = i;
  }
}

function _buildNavHTML() {
  const start = _groups[_groupIdx];
  const groupMs = state.milestones.filter(m => m.windowStart === start);
  const end = groupMs.length ? Math.max(...groupMs.map(m => m.windowEnd)) : start;
  const label = start === end ? `${start}个月` : `${start}–${end}个月`;
  const hasPrev = _groupIdx > 0;
  const hasNext = _groupIdx < _groups.length - 1;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px 4px">
      <button class="btn btn-ghost btn-sm" data-milestone-nav="prev"
        style="${hasPrev ? '' : 'opacity:.35;pointer-events:none'}">← 上一阶段</button>
      <span style="font-size:14px;font-weight:600;color:var(--text)">${label}</span>
      <button class="btn btn-ghost btn-sm" data-milestone-nav="next"
        style="${hasNext ? '' : 'opacity:.35;pointer-events:none'}">下一阶段 →</button>
    </div>`;
}

function _renderMilestoneSection() {
  const section = document.getElementById('milestone-section');
  if (!section) return;
  const start = _groups[_groupIdx];
  const filtered = state.milestones.filter(m => m.windowStart === start);
  section.innerHTML = _buildNavHTML() + buildGrowthHTML({
    milestones: filtered,
    ageMonths: state.ageMonths,
    milestoneStates: _cachedMilestoneStates,
  });
}

// ── 浏览器端渲染 ──────────────────────────────────────────

export async function renderGrowth() {
  const body = document.getElementById('growth-body');
  if (!body) return;

  // 加载里程碑达成状态
  _cachedMilestoneStates = {};
  for (const m of state.milestones) {
    const saved = await state.db.getMilestoneState(m.id);
    if (saved) _cachedMilestoneStates[m.id] = saved;
  }

  // 初始化分页，默认定位到当前月龄
  _initGroups(state.ageMonths);

  // 仅保留里程碑分阶段展示（日记和活动记录已移至时光选项卡）
  body.innerHTML = `<div id="milestone-section"></div>`;

  _renderMilestoneSection();

  body.addEventListener('click', e => {
    // 翻页导航
    const navBtn = e.target.closest('[data-milestone-nav]');
    if (navBtn) {
      const dir = navBtn.dataset.milestoneNav;
      if (dir === 'prev' && _groupIdx > 0) { _groupIdx--; _renderMilestoneSection(); }
      if (dir === 'next' && _groupIdx < _groups.length - 1) { _groupIdx++; _renderMilestoneSection(); }
      return;
    }
    // 里程碑卡片点击
    const card = e.target.closest('[data-milestoneid]');
    if (!card) return;
    _showMilestoneConfirm(card.dataset.milestoneid);
  });
}

function _showMilestoneConfirm(milestoneId) {
  const milestone = state.milestones.find(m => m.id === milestoneId);
  if (!milestone) return;

  const saved = _cachedMilestoneStates[milestoneId];
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
      pushMilestoneState(milestoneId, { status: 'achieved', achievedDate });  // ← sync 同步
      _cachedMilestoneStates[milestoneId] = { status: 'achieved', achievedDate };
      close();
      _renderMilestoneSection(); // 仅刷新里程碑区域，保留当前翻页位置
    });

  backdrop.addEventListener('click', close, { once: true });
}
