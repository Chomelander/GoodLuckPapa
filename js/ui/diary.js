/**
 * 育儿日记模块
 * 功能：写日记 overlay（结构化表单 + 图片上传压缩）+ 成长 Tab 时间线
 */
import { state } from '../app.js';

const MAX_IMAGES = 4;
const IMG_MAX_PX = 1200;
const IMG_QUALITY = 0.7;

// ── 图片压缩 ──────────────────────────────────────────────

export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, IMG_MAX_PX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve({ name: file.name, dataUrl: canvas.toDataURL('image/jpeg', IMG_QUALITY) });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── 日记表单 HTML ─────────────────────────────────────────

export function buildDiaryFormHTML({ entry } = {}) {
  const changes = entry?.changes ?? '';
  const feelings = entry?.feelings ?? '';
  const images = entry?.images ?? [];

  const thumbsHTML = images.map((img, i) => `
    <div class="diary-thumb-wrap" data-img-index="${i}">
      <img class="diary-thumb" src="${img.dataUrl}" alt="${img.name}">
      <button type="button" class="diary-thumb-remove" data-remove-index="${i}" aria-label="删除图片">×</button>
    </div>`).join('');

  return `
    <div style="font-size:17px;font-weight:600;margin-bottom:16px">今日感想</div>

    <form id="diary-form" data-entry-id="${entry?.id ?? ''}">
      <div class="form-group">
        <label class="form-label">宝宝今日重要变化</label>
        <textarea class="form-input form-textarea" id="diary-changes"
          placeholder="今天宝宝有什么让你惊喜或注意到的变化？"
          rows="3">${changes}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">今日看护感受</label>
        <textarea class="form-input form-textarea" id="diary-feelings"
          placeholder="今天陪伴时你有什么感受或想记住的瞬间？"
          rows="3">${feelings}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">添加图片（最多 ${MAX_IMAGES} 张）</label>
        <div class="diary-thumb-row" id="diary-thumb-row">${thumbsHTML}</div>
        <label class="btn btn-ghost btn-sm" id="diary-img-label"
          style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;cursor:pointer">
          📷 选择图片
          <input type="file" id="diary-img-input" accept="image/*" multiple style="display:none">
        </label>
        <div id="diary-img-limit" style="font-size:12px;color:var(--text-mute);margin-top:4px;display:none">
          最多上传 ${MAX_IMAGES} 张图片
        </div>
      </div>

      <div id="diary-error" style="font-size:13px;color:var(--danger);margin-bottom:8px;display:none">
        请至少填写一项内容
      </div>
      <button type="submit" class="btn btn-primary btn-full">保存感想</button>
    </form>`;
}

// ── 时间线分组工具 ────────────────────────────────────────

function groupEntries(entries) {
  const byYear = {};
  for (const e of entries) {
    const year = e.date.slice(0, 4);
    const month = e.date.slice(5, 7);
    const day = parseInt(e.date.slice(8, 10), 10);
    const week = Math.ceil(day / 7);
    const weekKey = `${year}-${month}-W${week}`;
    const weekLabel = `${parseInt(month, 10)}月 第${week}周`;

    if (!byYear[year]) byYear[year] = {};
    if (!byYear[year][weekKey]) byYear[year][weekKey] = { label: weekLabel, entries: [] };
    byYear[year][weekKey].entries.push(e);
  }
  return byYear;
}

function isRecentWeek(weekKey, today) {
  const [y, m, wPart] = weekKey.split('-');
  const w = parseInt(wPart.slice(1), 10);
  const todayYear = today.slice(0, 4);
  const todayMonth = today.slice(5, 7);
  const todayDay = parseInt(today.slice(8, 10), 10);
  const todayWeek = Math.ceil(todayDay / 7);
  return y === todayYear && m === todayMonth && w === todayWeek;
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// ── 时间线 HTML ───────────────────────────────────────────

export function buildDiaryTimelineHTML({ entries }) {
  if (!entries || entries.length === 0) {
    return `
      <div class="section">
        <div class="section-title">育儿日记</div>
        <div class="card" style="text-align:center;padding:32px 16px">
          <p class="text-sec">还没有日记</p>
          <p class="text-xs text-mute" style="margin-top:6px">在今日页点击 + 开始记录</p>
        </div>
      </div>`;
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const byYear = groupEntries(sorted);
  const today = state.today ?? new Date().toISOString().slice(0, 10);

  const yearsHTML = Object.entries(byYear)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, weeks]) => {
      const weeksHTML = Object.entries(weeks)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([weekKey, { label, entries: wEntries }]) => {
          const isOpen = isRecentWeek(weekKey, today);
          const cardsHTML = wEntries.map(e => {
            const thumbs = e.images?.slice(0, 3).map(img =>
              `<img class="diary-thumb" src="${img.dataUrl}" alt="${img.name}">`
            ).join('') ?? '';
            const thumbRow = thumbs
              ? `<div class="diary-thumb-row" style="margin-top:8px">${thumbs}</div>`
              : '';
            const summary = truncate(e.changes || e.feelings, 40);
            return `
              <div class="card diary-entry-card" style="margin-bottom:8px;cursor:pointer"
                data-diary-id="${e.id}">
                <div style="display:flex;align-items:center;margin-bottom:4px">
                  <span style="font-size:12px;color:var(--text-mute);flex:1">${e.date}</span>
                  <span style="font-size:12px;color:var(--primary)">编辑</span>
                </div>
                ${summary ? `<p style="font-size:14px;color:var(--text-sec);line-height:1.5">${summary}</p>` : ''}
                ${thumbRow}
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
    <div class="section diary-timeline">
      <div class="section-title">育儿日记</div>
      ${yearsHTML}
    </div>`;
}

// ── 当前待处理图片（内存暂存）─────────────────────────────

let _pendingImages = [];

// ── Overlay 控制 ──────────────────────────────────────────

export function showDiaryOverlay({ entry } = {}) {
  const body = document.getElementById('diary-body');
  const backdrop = document.getElementById('diary-backdrop');
  const overlay = document.getElementById('diary-overlay');
  if (!body || !backdrop || !overlay) return;

  _pendingImages = entry?.images ? [...entry.images] : [];

  body.innerHTML = buildDiaryFormHTML({ entry });
  backdrop.classList.add('open');
  overlay.removeAttribute('hidden');

  // textarea 自动撑开已有内容高度
  overlay.querySelectorAll('textarea').forEach(ta => {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 240) + 'px';
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 240) + 'px';
    });
  });

  // 图片选择
  const imgInput = overlay.querySelector('#diary-img-input');
  imgInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - _pendingImages.length;
    const toProcess = files.slice(0, remaining);

    for (const file of toProcess) {
      const compressed = await compressImage(file);
      _pendingImages.push(compressed);
    }

    _renderThumbs(overlay);
    e.target.value = '';
  });

  // 删除缩略图（事件委托）
  overlay.querySelector('#diary-thumb-row')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-remove-index]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.removeIndex, 10);
    _pendingImages.splice(idx, 1);
    _renderThumbs(overlay);
  });

  // 表单提交
  overlay.querySelector('#diary-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const changes = overlay.querySelector('#diary-changes')?.value.trim() ?? '';
    const feelings = overlay.querySelector('#diary-feelings')?.value.trim() ?? '';

    if (!changes && !feelings && _pendingImages.length === 0) {
      overlay.querySelector('#diary-error').style.display = 'block';
      return;
    }
    overlay.querySelector('#diary-error').style.display = 'none';

    const entryId = e.target.dataset.entryId;
    const entryData = {
      date: state.today,
      changes,
      feelings,
      images: [..._pendingImages],
    };

    if (entryId) {
      await state.db.updateDiary(parseInt(entryId, 10), entryData);
    } else {
      await state.db.addDiary(entryData);
    }

    hideDiaryOverlay();
    // 刷新成长 Tab 日记区块（若当前在成长 Tab）
    document.dispatchEvent(new CustomEvent('diary:saved'));
  });

  backdrop.addEventListener('click', hideDiaryOverlay, { once: true });
}

export function hideDiaryOverlay() {
  const backdrop = document.getElementById('diary-backdrop');
  const overlay = document.getElementById('diary-overlay');
  backdrop?.classList.remove('open');
  overlay?.setAttribute('hidden', '');
  _pendingImages = [];
}

function _renderThumbs(overlay) {
  const row = overlay.querySelector('#diary-thumb-row');
  const limitMsg = overlay.querySelector('#diary-img-limit');
  const labelBtn = overlay.querySelector('#diary-img-label');
  if (!row) return;

  row.innerHTML = _pendingImages.map((img, i) => `
    <div class="diary-thumb-wrap" data-img-index="${i}">
      <img class="diary-thumb" src="${img.dataUrl}" alt="${img.name}">
      <button type="button" class="diary-thumb-remove" data-remove-index="${i}" aria-label="删除图片">×</button>
    </div>`).join('');

  const atLimit = _pendingImages.length >= MAX_IMAGES;
  if (limitMsg) limitMsg.style.display = atLimit ? 'block' : 'none';
  if (labelBtn) labelBtn.style.display = atLimit ? 'none' : '';
}

// ── 今日 Tab + 按钮绑定 ───────────────────────────────────

if (typeof document !== 'undefined') {
  document.addEventListener('click', e => {
    if (e.target.closest('#btn-diary-add')) {
      document.dispatchEvent(new CustomEvent('diary:open'));
    }
  });

  // 日记保存后刷新成长 Tab 日记区块
  document.addEventListener('diary:saved', async () => {
    const diarySection = document.querySelector('.diary-timeline');
    if (!diarySection) return;
    const entries = await state.db.getDiaries();
    const tmp = document.createElement('div');
    tmp.innerHTML = buildDiaryTimelineHTML({ entries });
    const newSection = tmp.firstElementChild;
    diarySection.closest('.section')?.replaceWith(newSection);
  });

  // 日记时间线卡片点击 → 编辑
  document.addEventListener('click', async e => {
    const card = e.target.closest('.diary-entry-card');
    if (!card) return;
    const diaryId = parseInt(card.dataset.diaryId, 10);
    if (!diaryId) return;
    const entries = await state.db.getDiaries();
    const entry = entries.find(en => en.id === diaryId);
    if (entry) showDiaryOverlay({ entry });
  });
}
