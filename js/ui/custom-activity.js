/**
 * 自定义活动表单 Overlay
 * 功能：新增/编辑自定义活动（保存到 customActivities store，合并到 state.activities）
 */
import { state } from '../app.js';
import { ACTIVITIES } from '../data/activities.js';

const DOMAIN_OPTIONS = [
  { value: 'sensorial',       label: '感官' },
  { value: 'practical_life',  label: '日常生活' },
  { value: 'movement',        label: '运动' },
  { value: 'language',        label: '语言' },
  { value: 'emotional_social', label: '情绪社交' },
];

export function buildCustomActFormHTML({ act } = {}) {
  const title      = act?.title ?? '';
  const domain     = act?.domain ?? 'sensorial';
  const ageStart   = act?.ageRange?.[0] ?? 0;
  const ageEnd     = act?.ageRange?.[1] ?? 12;
  const materials  = act?.materials ?? [];
  const anchor     = act?.observeAnchor ?? '';

  const domainOpts = DOMAIN_OPTIONS.map(o =>
    `<option value="${o.value}"${domain === o.value ? ' selected' : ''}>${o.label}</option>`
  ).join('');

  const matRows = materials.length > 0
    ? materials.map(m => _matRowHTML(m)).join('')
    : _matRowHTML('');

  return `
    <div style="font-size:17px;font-weight:600;margin-bottom:16px">
      ${act ? '编辑活动' : '新增自定义活动'}
    </div>

    <form id="custom-act-form" data-act-id="${act?.id ?? ''}">
      <div class="form-group">
        <label class="form-label">活动名称 <span style="color:var(--danger)">*</span></label>
        <input type="text" class="form-input" id="ca-title" value="${title}"
          placeholder="例：陪宝宝拍气泡纸" maxlength="30">
      </div>

      <div class="form-group">
        <label class="form-label">领域</label>
        <select class="form-input" id="ca-domain">${domainOpts}</select>
      </div>

      <div class="form-group">
        <label class="form-label">适合月龄</label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="number" class="form-input" id="ca-age-start" value="${ageStart}"
            min="0" max="72" style="width:70px;text-align:center"> 月
          <span style="color:var(--text-mute)">—</span>
          <input type="number" class="form-input" id="ca-age-end" value="${ageEnd}"
            min="1" max="72" style="width:70px;text-align:center"> 月
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">物料清单（选填）</label>
        <div id="ca-materials-list">${matRows}</div>
        <button type="button" class="btn btn-ghost btn-sm" id="ca-add-mat"
          style="margin-top:6px">+ 添加物品</button>
      </div>

      <div class="form-group">
        <label class="form-label">观察锚点（选填，≤25字）</label>
        <textarea class="form-input" id="ca-anchor" rows="2"
          placeholder="观察时注意什么？" maxlength="25">${anchor}</textarea>
      </div>

      <div id="ca-error" style="font-size:13px;color:var(--danger);margin-bottom:8px;display:none"></div>
      <button type="submit" class="btn btn-primary btn-full">
        ${act ? '保存修改' : '添加活动'}
      </button>
    </form>`;
}

function _matRowHTML(value) {
  return `
    <div class="ca-mat-row flex gap-8" style="margin-bottom:6px;align-items:center">
      <input type="text" class="form-input ca-mat-input" value="${value}"
        placeholder="物品名称" style="flex:1">
      <button type="button" class="btn btn-ghost btn-sm ca-mat-remove"
        style="color:var(--danger);flex-shrink:0">×</button>
    </div>`;
}

// ── Overlay 控制 ──────────────────────────────────────────

export function showCustomActOverlay({ act } = {}) {
  const body     = document.getElementById('custom-act-body');
  const backdrop = document.getElementById('custom-act-backdrop');
  const overlay  = document.getElementById('custom-act-overlay');
  if (!body || !backdrop || !overlay) return;

  body.innerHTML = buildCustomActFormHTML({ act });
  backdrop.classList.add('open');
  overlay.removeAttribute('hidden');

  // 动态添加物料行
  overlay.querySelector('#ca-add-mat')?.addEventListener('click', () => {
    document.getElementById('ca-materials-list')
      ?.insertAdjacentHTML('beforeend', _matRowHTML(''));
  });

  // 删除物料行（事件委托）
  overlay.querySelector('#ca-materials-list')?.addEventListener('click', e => {
    if (e.target.classList.contains('ca-mat-remove')) {
      e.target.closest('.ca-mat-row')?.remove();
    }
  });

  // 表单提交
  overlay.querySelector('#custom-act-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = overlay.querySelector('#ca-error');

    const title = overlay.querySelector('#ca-title')?.value.trim() ?? '';
    if (!title) {
      errEl.textContent = '活动名称不能为空';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const domain   = overlay.querySelector('#ca-domain')?.value ?? 'sensorial';
    const ageStart = parseInt(overlay.querySelector('#ca-age-start')?.value ?? '0', 10);
    const ageEnd   = parseInt(overlay.querySelector('#ca-age-end')?.value ?? '12', 10);
    if (ageEnd <= ageStart) {
      errEl.textContent = '结束月龄需大于起始月龄';
      errEl.style.display = 'block';
      return;
    }

    const materials = Array.from(overlay.querySelectorAll('.ca-mat-input'))
      .map(i => i.value.trim()).filter(Boolean);
    const observeAnchor = overlay.querySelector('#ca-anchor')?.value.trim() ?? '';

    const actId = e.target.dataset.actId;
    const actData = {
      title, domain,
      ageRange: [ageStart, ageEnd],
      materials,
      observeAnchor: observeAnchor || undefined,
      isCustom: true,
    };

    if (actId) {
      await state.db.updateCustomActivity(actId, actData);
    } else {
      actData.id = 'custom-' + Date.now();
      await state.db.addCustomActivity(actData);
    }

    // 同步 state.activities
    const customActs = await state.db.getCustomActivities();
    state.activities = [...ACTIVITIES, ...customActs];

    hideCustomActOverlay();
    document.dispatchEvent(new CustomEvent('customAct:saved'));
  });

  backdrop.addEventListener('click', hideCustomActOverlay, { once: true });
}

export function hideCustomActOverlay() {
  const backdrop = document.getElementById('custom-act-backdrop');
  const overlay  = document.getElementById('custom-act-overlay');
  backdrop?.classList.remove('open');
  overlay?.setAttribute('hidden', '');
}
