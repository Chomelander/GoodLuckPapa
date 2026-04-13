/**
 * app.js — 应用入口
 * 职责：DB初始化 → Onboarding检测 → Tab切换 → 页面调度 → M_ReEntry检测
 */
import { openDB } from './db.js';
import { calcAgeMonths, shouldShowReEntry } from './rules.js';
import { ACTIVITIES } from './data/activities.js';
import { MILESTONES } from './data/milestones.js';
import { renderOnboarding, bindOnboardingComplete } from './ui/onboarding.js';
import { renderToday } from './ui/today.js';
import { renderActivities, showActivityDetail } from './ui/activities.js';
import { renderGrowth } from './ui/milestones.js';
import { renderSettings } from './ui/settings.js';
import { showReEntry } from './ui/reentry.js';
import { showTimer } from './ui/timer.js';
import { showRecord } from './ui/record.js';
import { renderReview } from './ui/review.js';
import { showDiaryOverlay } from './ui/diary.js';

// ── 全局状态 ─────────────────────────────────────────────
export const state = {
  db: null,
  profile: null,
  ageMonths: 0,
  today: new Date().toISOString().slice(0, 10),
  activities: ACTIVITIES,
  milestones: MILESTONES,
};

// ── 工具：格式化月龄显示 ──────────────────────────────────
export function fmtAge(months) {
  if (months < 1) return '不足1个月';
  if (months < 12) return `${months}个月`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}岁${m}个月` : `${y}岁`;
}

// ── Tab 切换 ──────────────────────────────────────────────
const TABS = ['today', 'activities', 'growth', 'settings'];

function switchTab(tab) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${tab}`)?.classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');

  // 懒加载渲染
  if (tab === 'today') renderToday();
  if (tab === 'activities') renderActivities();
  if (tab === 'growth') { renderGrowth(); renderReview(); }
  if (tab === 'settings') renderSettings();
}

// ── 主初始化 ──────────────────────────────────────────────
async function init() {
  state.db = await openDB();
  state.profile = await state.db.getProfile();
  const settings = await state.db.getSettings();

  if (!settings.onboardingComplete || !state.profile) {
    // 首次使用 → Onboarding
    renderOnboarding();
    bindOnboardingComplete(() => {
      document.getElementById('onboarding').classList.remove('open');
      startApp();
    });
    document.getElementById('onboarding').classList.add('open');
    return;
  }

  startApp();
}

async function startApp() {
  state.profile = await state.db.getProfile();
  state.ageMonths = calcAgeMonths(state.profile.birthDate, state.today);

  // 合并自定义活动到 state.activities
  const customActs = await state.db.getCustomActivities();
  state.activities = [...ACTIVITIES, ...customActs];

  // 月龄显示
  document.getElementById('age-display').textContent = fmtAge(state.ageMonths);

  // Tab 监听
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // M_ReEntry 检测
  const records = await state.db.getRecords();
  if (shouldShowReEntry({ records, today: state.today })) {
    showReEntry(records.length);
  }

  // 事件总线：计时器 ↔ 记录
  document.addEventListener('today:startTimer', e => {
    showTimer(e.detail.actId, state.activities);
  });
  document.addEventListener('timer:finish', e => {
    showRecord({ actId: e.detail.actId, focusSec: e.detail.focusSec });
  });
  document.addEventListener('today:viewDetail', e => {
    showActivityDetail(e.detail.actId);
  });
  document.addEventListener('diary:open', e => {
    showDiaryOverlay({ entry: e.detail?.entry });
  });
  document.addEventListener('record:edit', e => {
    showRecord({ actId: e.detail.record.actId, focusSec: e.detail.record.focusSec, existingRecord: e.detail.record });
  });
  document.addEventListener('record:updated', () => renderToday());

  // 渲染今日Tab
  renderToday();
}

if (typeof document !== 'undefined') {
  init().catch(err => {
    console.error('初始化失败:', err);
    document.getElementById('app').innerHTML =
      '<div style="padding:32px;text-align:center;color:#E76F51">加载失败，请刷新页面</div>';
  });
}
