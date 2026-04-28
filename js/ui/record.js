/**
 * M4 记录表单 + M4.5 会话结束卡
 * 职责：接收 actId + focusSec → 填写情绪/initType/备注 → 保存 → 展示正向反馈
 */
import { state } from '../app.js';
import { evaluateInterest, calcTypicalSec } from '../rules.js';
import { pushRecord } from '../sync.js';

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

const EMOTIONS = [
  { value: 'engaged',    label: '专注' },
  { value: 'happy',      label: '愉悦' },
  { value: 'calm',       label: '平静' },
  { value: 'distracted', label: '分心' },
  { value: 'frustrated', label: '挫败' },
];

const INIT_TYPES = [
  { value: 'child_led',  label: '孩子主导' },
  { value: 'adult_led',  label: '成人引导' },
  { value: 'joint',      label: '共同探索' },
];

function fmtSec(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function buildRecordHTML({ activity, focusSec, manualEntry = false, isEdit = false }) {
  const emotionBtns = EMOTIONS.map((e, i) => `
    <button type="button" class="seg-btn${i === 0 ? ' active' : ''}" data-emotion="${e.value}">
      ${e.label}
    </button>`).join('');

  const initBtns = INIT_TYPES.map((t, i) => `
    <button type="button" class="seg-btn${i === 0 ? ' active' : ''}" data-inittype="${t.value}">
      ${t.label}
    </button>`).join('');

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

  const timeSectionHTML = manualEntry
    ? `<div class="form-group">
         <label class="form-label">本次专注时长（分 : 秒）</label>
         <div style="display:flex;align-items:center;gap:8px">
           <input type="number" id="focus-min" min="0" max="999" value="0"
             style="width:70px;padding:8px;text-align:center;border:1px solid var(--border);border-radius:var(--r-sm);font-size:16px">
           <span style="font-size:18px;color:var(--text-sec)">:</span>
           <input type="number" id="focus-sec" min="0" max="59" value="0"
             style="width:70px;padding:8px;text-align:center;border:1px solid var(--border);border-radius:var(--r-sm);font-size:16px">
         </div>
         <input type="hidden" id="focussec-hidden" value="0">
         <p style="font-size:12px;color:var(--text-mute);margin-top:4px">补填记录时请估算大致时长</p>
       </div>`
    : `<div class="form-group">
         <label class="form-label">本次专注时长</label>
         <div style="display:flex;align-items:center;gap:12px">
           <div id="focussec-display" style="font-size:20px;font-weight:600;color:var(--primary)">${fmtSec(focusSec)}</div>
           <button type="button" class="btn btn-ghost btn-sm" data-action="edit-focussec"
             style="font-size:12px;color:var(--text-mute)">修改</button>
         </div>
         <div id="focussec-edit" style="display:none;margin-top:8px">
           <div style="display:flex;align-items:center;gap:8px">
             <input type="number" id="focus-min" min="0" max="999" value="${Math.floor(focusSec / 60)}"
               style="width:70px;padding:8px;text-align:center;border:1px solid var(--border);border-radius:var(--r-sm);font-size:16px">
             <span style="font-size:18px;color:var(--text-sec)">:</span>
             <input type="number" id="focus-sec" min="0" max="59" value="${focusSec % 60}"
               style="width:70px;padding:8px;text-align:center;border:1px solid var(--border);border-radius:var(--r-sm);font-size:16px">
             <button type="button" class="btn btn-ghost btn-sm" data-action="confirm-focussec">确认</button>
           </div>
         </div>
       </div>`;

  const notePlaceholder = activity.observeAnchor ? '可在此补充其他观察…' : '记录你观察到的细节…';

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
}

export function buildSessionHTML({ activity, focusSec, anchorMet }) {
  const anchorMsg = anchorMet
    ? `<div style="background:color-mix(in srgb,var(--primary) 10%,white);border-radius:var(--r-md);padding:12px;margin-bottom:16px;font-size:13px;color:var(--primary)">
        专注超过典型时长的 1.5 倍！这是一个兴趣信号，起起已记录。
      </div>`
    : '';

  return `
    <div class="overlay-handle"></div>
    <div style="text-align:center;padding:16px 0 24px">
      <div style="font-size:48px;margin-bottom:12px">🌱</div>
      <div style="font-size:20px;font-weight:700;margin-bottom:8px">记录完成</div>
      <div style="font-size:14px;color:var(--text-sec);margin-bottom:4px">${activity.title}</div>
      <div style="font-size:32px;font-weight:600;color:var(--primary);margin:16px 0">${fmtSec(focusSec)}</div>
    </div>
    ${anchorMsg}
    <p style="font-size:14px;color:var(--text-sec);line-height:1.7;margin-bottom:24px">
      每一次观察都在帮助你更了解孩子。你已经在做最重要的事。
    </p>
    <button class="btn btn-primary btn-full" data-session-action="done">查看今日</button>`;
}

// ── 浏览器端记录 overlay 逻辑 ──────────────────────────────

export function showRecord({ actId, focusSec, existingRecord, manualEntry = false } = {}) {
  const activity = state.activities.find(a => a.id === actId);
  if (!activity) return;

  const body = document.getElementById('record-body');
  const backdrop = document.getElementById('record-backdrop');
  const overlay = document.getElementById('record-overlay');

  body.innerHTML = buildRecordHTML({ activity, focusSec, manualEntry, isEdit: !!existingRecord });

  // 编辑模式：预填已有值
  if (existingRecord) {
    overlay.querySelector('#record-form')?.setAttribute('data-record-id', existingRecord.id);
    // 预填情绪
    if (existingRecord.emotion) {
      overlay.querySelectorAll('#emotion-control .seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.emotion === existingRecord.emotion);
      });
    }
    // 预填发起方式
    if (existingRecord.initType) {
      overlay.querySelectorAll('#inittype-control .seg-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.inittype === existingRecord.initType);
      });
    }
    // 预填备注
    const noteEl = overlay.querySelector('#record-note');
    if (noteEl && existingRecord.note) noteEl.value = existingRecord.note;
  }

  backdrop.classList.add('open');
  overlay.removeAttribute('hidden');

  overlay.addEventListener('click', _handleOverlayClick);
  backdrop.addEventListener('click', hideRecord, { once: true });
}

export function hideRecord() {
  const backdrop = document.getElementById('record-backdrop');
  const overlay = document.getElementById('record-overlay');
  backdrop?.classList.remove('open');
  overlay?.setAttribute('hidden', '');
  overlay?.removeEventListener('click', _handleOverlayClick);
}

function _handleOverlayClick(e) {
  // seg-control: emotion
  const emotionBtn = e.target.closest('[data-emotion]');
  if (emotionBtn) {
    document.getElementById('emotion-control')
      ?.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    emotionBtn.classList.add('active');
    return;
  }
  // seg-control: initType
  const initBtn = e.target.closest('[data-inittype]');
  if (initBtn) {
    document.getElementById('inittype-control')
      ?.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    initBtn.classList.add('active');
    return;
  }
  // 时长编辑
  const actionBtn = e.target.closest('[data-action]');
  if (!actionBtn) return;
  const action = actionBtn.dataset.action;
  if (action === 'edit-focussec') {
    const editDiv = document.getElementById('focussec-edit');
    if (editDiv) editDiv.style.display = 'block';
  } else if (action === 'confirm-focussec') {
    const mins = parseInt(document.getElementById('focus-min')?.value ?? '0', 10) || 0;
    const secs = Math.min(parseInt(document.getElementById('focus-sec')?.value ?? '0', 10) || 0, 59);
    const newSec = mins * 60 + secs;
    const form = document.getElementById('record-form');
    if (form) form.dataset.focussec = String(newSec);
    const display = document.getElementById('focussec-display');
    if (display) display.textContent = fmtSec(newSec);
    const editDiv = document.getElementById('focussec-edit');
    if (editDiv) editDiv.style.display = 'none';
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('submit', async e => {
    if (e.target.id !== 'record-form') return;
    e.preventDefault();

    const form = e.target;
    const actId = form.dataset.actid;
    // manualEntry 模式：从输入框读取时长
    const isManual = form.dataset.manual === '1';
    const focusSec = isManual
      ? (parseInt(document.getElementById('focus-min')?.value ?? '0', 10) || 0) * 60
        + Math.min(parseInt(document.getElementById('focus-sec')?.value ?? '0', 10) || 0, 59)
      : parseInt(form.dataset.focussec, 10);
    const emotion = document.querySelector('#emotion-control .seg-btn.active')?.dataset.emotion ?? 'calm';
    const initType = document.querySelector('#inittype-control .seg-btn.active')?.dataset.inittype ?? 'adult_led';
    const note = document.getElementById('record-note')?.value.trim() ?? '';

    // 收集锚点填空答案（编辑模式下无此 input，安全返回空数组）
    const anchorInputs = [...document.querySelectorAll('[data-anchor-index]')];
    const anchorAnswers = anchorInputs.map(el => el.value);
    const anchorQuestions = anchorInputs.map(el =>
      el.previousElementSibling?.textContent?.trim() ?? ''
    );
    const mergedNote = mergeAnchorAnswers({ questions: anchorQuestions, answers: anchorAnswers, note });

    const existingId = form.dataset.recordId ? parseInt(form.dataset.recordId, 10) : null;

    const record = {
      actId,
      date: state.today,
      focusSec,
      emotion,
      initType,
      note: mergedNote,
    };

    if (existingId) {
      await state.db.updateRecord(existingId, record);
    } else {
      record.createdAt = Date.now();
      await state.db.addRecord(record);
      pushRecord(record);  // ← sync 同步
    }

    // F规则判断
    const activity = state.activities.find(a => a.id === actId);
    const typicalSec = activity
      ? calcTypicalSec({ domain: activity.domain, ageMonths: state.ageMonths })
      : 120;
    const allRecords = await state.db.getRecords();
    const actRecords = allRecords.filter(r => r.actId === actId);

    // 计算连续天数和单日重复次数
    const todayCount = actRecords.filter(r => r.date === state.today).length;
    const dates = [...new Set(actRecords.map(r => r.date))].sort();
    let consecutiveDays = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const diff = Math.floor((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
      if (diff === 1) consecutiveDays++;
      else break;
    }

    const { anchorMet } = evaluateInterest({
      focusSec,
      typicalSec,
      dailyCount: todayCount,
      consecutiveDays,
      hasExtension: false,
    });

    hideRecord();

    // 编辑模式：直接重渲今日页，不显示 session 卡
    if (existingId) {
      document.dispatchEvent(new CustomEvent('record:updated'));
      return;
    }

    _showSession({ actId, focusSec, anchorMet });
  });
}

function _showSession({ actId, focusSec, anchorMet }) {
  const activity = state.activities.find(a => a.id === actId);
  if (!activity) return;

  const body = document.getElementById('session-body');
  const backdrop = document.getElementById('session-backdrop');
  const overlay = document.getElementById('session-overlay');

  body.innerHTML = buildSessionHTML({ activity, focusSec, anchorMet });
  backdrop.classList.add('open');
  overlay.removeAttribute('hidden');

  const close = () => {
    backdrop.classList.remove('open');
    overlay.setAttribute('hidden', '');
    document.querySelector('[data-tab="today"]')?.click();
  };

  overlay.querySelector('[data-session-action="done"]')
    ?.addEventListener('click', close);
  backdrop.addEventListener('click', close, { once: true });
}
