/**
 * M4 计时器
 * 职责：显示活动信息、运行计时、完成后触发记录表单
 */

function fmtElapsed(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function buildTimerHTML({ activity, elapsed, running, guideIntensity = 'normal' }) {
  const typicalMin = Math.round(activity.typicalSec / 60);
  const showGuide = guideIntensity !== 'light';

  const observeFocusHTML = showGuide && activity.observeFocus?.length
    ? `<ul style="margin:8px 0 0 16px;font-size:13px;color:var(--text-sec);line-height:1.8">
        ${activity.observeFocus.map(f => `<li>${f}</li>`).join('')}
      </ul>`
    : '';

  const anchorCard = showGuide
    ? `<div class="card" style="margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;color:var(--text-sec);margin-bottom:4px">观察锚点</div>
        <div style="font-size:14px;line-height:1.6">${activity.observeAnchor ?? ''}</div>
        ${observeFocusHTML}
      </div>`
    : '';

  const primaryBtn = running
    ? `<button class="btn btn-secondary btn-full" data-timer-action="pause">暂停</button>`
    : elapsed === 0
    ? `<button class="btn btn-primary btn-full" data-timer-action="start">开始</button>`
    : `<button class="btn btn-primary btn-full" data-timer-action="start">继续</button>`;

  const finishBtn = !running && elapsed > 0
    ? `<button class="btn btn-accent btn-full" style="margin-top:8px" data-timer-action="finish">完成观察</button>`
    : '';

  return `
    <div style="padding:20px 16px calc(20px + env(safe-area-inset-bottom))">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <button class="btn btn-ghost btn-sm" data-timer-action="close">← 返回</button>
        <span style="font-size:16px;font-weight:600;flex:1">${activity.title}</span>
      </div>

      <div style="text-align:center;padding:32px 0">
        <div style="font-size:56px;font-weight:700;font-variant-numeric:tabular-nums;color:var(--primary);letter-spacing:2px">
          ${fmtElapsed(elapsed)}
        </div>
        <div style="font-size:13px;color:var(--text-mute);margin-top:8px">
          参考时长 ${typicalMin} 分钟
        </div>
      </div>

      ${anchorCard}

      ${primaryBtn}
      ${finishBtn}
    </div>`;
}

// ── 浏览器端计时器状态 ──────────────────────────────────────
let _actId = null;
let _elapsed = 0;
let _running = false;
let _intervalId = null;
let _guideIntensity = 'normal';

function _render() {
  const body = document.getElementById('timer-body');
  if (!body || !_activity) return;
  body.innerHTML = buildTimerHTML({
    activity: _activity,
    elapsed: _elapsed,
    running: _running,
    guideIntensity: _guideIntensity,
  });
}

let _activity = null;

export async function showTimer(actId, activities) {
  _actId = actId;
  _activity = activities.find(a => a.id === actId) ?? null;
  _elapsed = 0;
  _running = false;
  clearInterval(_intervalId);

  // 读取 guideIntensity（浏览器环境）
  if (typeof document !== 'undefined') {
    try {
      const { state } = await import('../app.js');
      const settings = await state.db.getSettings();
      _guideIntensity = settings.guideIntensity ?? 'normal';
    } catch {
      _guideIntensity = 'normal';
    }
  }

  const modal = document.getElementById('timer-modal');
  if (!modal) return;
  modal.classList.add('open');
  _render();

  modal.addEventListener('click', _handleClick);
}

export function hideTimer() {
  clearInterval(_intervalId);
  _running = false;
  const modal = document.getElementById('timer-modal');
  modal?.classList.remove('open');
  modal?.removeEventListener('click', _handleClick);
}

function _handleClick(e) {
  const btn = e.target.closest('[data-timer-action]');
  if (!btn) return;
  const action = btn.dataset.timerAction;

  if (action === 'start') {
    _running = true;
    _intervalId = setInterval(() => {
      _elapsed++;
      _render();
    }, 1000);
    _render();
  } else if (action === 'pause') {
    _running = false;
    clearInterval(_intervalId);
    _render();
  } else if (action === 'finish') {
    clearInterval(_intervalId);
    _running = false;
    hideTimer();
    document.dispatchEvent(new CustomEvent('timer:finish', {
      detail: { actId: _actId, focusSec: _elapsed },
    }));
  } else if (action === 'close') {
    clearInterval(_intervalId);
    _running = false;
    hideTimer();
  }
}
