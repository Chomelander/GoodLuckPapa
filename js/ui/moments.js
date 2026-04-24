/**
 * 时光选项卡：微信朋友圈式瀑布流展示
 * 合并育儿日记 + 活动记录，按日期倒序排列
 * 支持：发（+ 按钮）、编辑（点卡片）、删除（× 按钮）
 */
import { state } from '../app.js';

export async function renderMoments() {
  const body = document.getElementById('moments-body');
  if (!body) return;

  // 加载数据
  const [diaries, records] = await Promise.all([
    state.db.getDiaries(),
    state.db.getRecords(),
  ]);
  const activities = state.activities;

  // 合并为统一的 moment 对象
  const moments = [];

  diaries.forEach(d => {
    moments.push({
      id: `diary-${d.id}`,
      type: 'diary',
      timestamp: d.createdAt,
      data: d,
    });
  });

  records.forEach(r => {
    moments.push({
      id: `record-${r.id}`,
      type: 'record',
      timestamp: r.createdAt,
      data: r,
    });
  });

  // 按时间倒序
  moments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // 按日期分组
  const groupedByDate = new Map();
  moments.forEach(m => {
    const date = m.timestamp.split('T')[0];
    if (!groupedByDate.has(date)) groupedByDate.set(date, []);
    groupedByDate.get(date).push(m);
  });

  // 渲染 HTML
  if (moments.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:64px 24px;color:var(--text-mute)">
        <div style="font-size:40px;margin-bottom:12px">📸</div>
        <p style="font-size:15px">还没有记录</p>
        <p style="font-size:13px;margin-top:6px">点击右上角 + 写下第一篇感想</p>
      </div>`;
    body.onclick = null;
    return;
  }

  let html = `<div class="moments-timeline">`;
  const sortedDates = Array.from(groupedByDate.keys()).sort().reverse();
  sortedDates.forEach(date => {
    html += `<div class="moment-date-separator">
      <span class="moment-date-text">${formatDateLabel(date)}</span>
    </div>`;
    groupedByDate.get(date).forEach(m => {
      html += m.type === 'diary'
        ? buildDiaryCard(m)
        : buildRecordCard(m, activities);
    });
  });
  html += `</div>`;
  body.innerHTML = html;

  // 事件委托（onclick 避免多次切 Tab 叠加监听）
  body.onclick = async e => {
    // ── 删除日记
    const delDiary = e.target.closest('[data-diary-del]');
    if (delDiary) {
      await handleDeleteDiary(parseInt(delDiary.dataset.diaryDel, 10));
      return;
    }

    // ── 删除活动记录
    const delRecord = e.target.closest('[data-record-del]');
    if (delRecord) {
      await handleDeleteRecord(parseInt(delRecord.dataset.recordDel, 10));
      return;
    }

    // ── 图片预览
    const imgEl = e.target.closest('[data-diary-image]');
    if (imgEl) {
      showImagePreview(imgEl.dataset.diaryImage);
      return;
    }

    // ── 编辑日记（点卡片正文区域）
    const diaryCard = e.target.closest('.diary-card');
    if (diaryCard) {
      const diaryId = parseInt(diaryCard.dataset.momentId.replace('diary-', ''), 10);
      await handleEditDiary(diaryId);
      return;
    }

    // ── 编辑活动记录（点卡片正文区域）
    const recordCard = e.target.closest('.record-card');
    if (recordCard) {
      const recordId = parseInt(recordCard.dataset.momentId.replace('record-', ''), 10);
      await handleEditRecord(recordId);
      return;
    }
  };
}

// ═══════════════════════════════════════════════
// 卡片构建
// ═══════════════════════════════════════════════

function buildDiaryCard(moment) {
  const d = moment.data;
  const time = new Date(d.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  // 日记内容：changes 和 feelings 拼合显示
  const contentParts = [d.changes, d.feelings].filter(Boolean);
  const contentHtml = contentParts.length
    ? contentParts.map(p => `<p style="margin:0 0 6px">${escapeHTML(p)}</p>`).join('')
    : '<p style="margin:0;color:var(--text-mute)">（无内容）</p>';

  // 图片：存为 [{name, dataUrl}] 对象数组
  const images = d.images ?? [];
  const imageHtml = images.length
    ? `<div class="moment-images">${images.map(img => `
        <img class="moment-image" src="${img.dataUrl}" alt="${escapeHTML(img.name)}"
          data-diary-image="${img.dataUrl}" loading="lazy" />`).join('')}</div>`
    : '';

  return `
    <div class="moment-card diary-card" data-moment-id="${moment.id}" style="cursor:pointer">
      <div class="moment-header">
        <div class="moment-title">📔 育儿日记</div>
        <div class="moment-time">${time}</div>
        <button class="moment-delete-btn" data-diary-del="${d.id}" aria-label="删除日记">×</button>
      </div>
      <div class="moment-content">
        ${contentHtml}
        ${imageHtml}
      </div>
      <div class="moment-edit-hint">点击编辑</div>
    </div>`;
}

function buildRecordCard(moment, activities) {
  const r = moment.data;
  const activity = activities.find(a => a.id === r.actId);
  const activityName = activity?.title ?? activity?.name ?? r.actId;
  const time = new Date(r.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const focusMin = Math.round((r.focusSec || 0) / 60);

  const EMOTION_MAP = {
    concentrated: { emoji: '😊', label: '专注' },
    engaged:      { emoji: '😊', label: '专注' },
    joyful:       { emoji: '😄', label: '愉快' },
    happy:        { emoji: '😄', label: '愉快' },
    distracted:   { emoji: '😐', label: '分散' },
    frustrated:   { emoji: '😞', label: '受挫' },
    calm:         { emoji: '😌', label: '平静' },
  };
  const emotion = EMOTION_MAP[r.emotion] ?? { emoji: '😊', label: r.emotion || '未记录' };

  const initLabel = r.initType === 'child-led' ? '👶 主动' : r.initType === 'parent-led' ? '👩 引导' : '';

  return `
    <div class="moment-card record-card" data-moment-id="${moment.id}" style="cursor:pointer">
      <div class="moment-header">
        <div class="moment-title">🎯 活动记录</div>
        <div class="moment-time">${time}</div>
        <button class="moment-delete-btn" data-record-del="${r.id}" aria-label="删除记录">×</button>
      </div>
      <div class="moment-content">
        <div class="record-activity"><strong>${escapeHTML(activityName)}</strong></div>
        <div class="record-stats">
          ${r.focusSec ? `<span class="record-stat">⏱ ${focusMin} 分钟</span>` : ''}
          <span class="record-stat">${emotion.emoji} ${emotion.label}</span>
          ${initLabel ? `<span class="record-stat">${initLabel}</span>` : ''}
        </div>
        ${r.note ? `<p class="record-note">${escapeHTML(r.note)}</p>` : ''}
      </div>
      <div class="moment-edit-hint">点击编辑</div>
    </div>`;
}

// ═══════════════════════════════════════════════
// 事件处理
// ═══════════════════════════════════════════════

async function handleDeleteDiary(diaryId) {
  if (!confirm('确定删除这条日记吗？')) return;
  try {
    await state.db.deleteDiary(diaryId);
    await renderMoments();
  } catch (err) {
    console.error('Failed to delete diary:', err);
    alert('删除失败，请重试');
  }
}

async function handleDeleteRecord(recordId) {
  if (!confirm('确定删除这条记录吗？')) return;
  try {
    await state.db.deleteRecord(recordId);
    await renderMoments();
  } catch (err) {
    console.error('Failed to delete record:', err);
    alert('删除失败，请重试');
  }
}

async function handleEditDiary(diaryId) {
  const diaries = await state.db.getDiaries();
  const entry = diaries.find(d => d.id === diaryId);
  if (entry) {
    document.dispatchEvent(new CustomEvent('diary:open', { detail: { entry } }));
  }
}

async function handleEditRecord(recordId) {
  const records = await state.db.getRecords();
  const record = records.find(r => r.id === recordId);
  if (record) {
    document.dispatchEvent(new CustomEvent('record:edit', { detail: { record } }));
  }
}

function showImagePreview(dataUrl) {
  const modal = document.createElement('div');
  modal.className = 'image-preview-modal';
  modal.innerHTML = `
    <div class="image-preview-backdrop" onclick="this.parentElement.remove()"></div>
    <div class="image-preview-container">
      <img src="${dataUrl}" alt="预览" />
      <button class="image-preview-close" onclick="this.closest('.image-preview-modal').remove()">×</button>
    </div>`;
  document.body.appendChild(modal);
}

// ═══════════════════════════════════════════════
// 工具
// ═══════════════════════════════════════════════

function formatDateLabel(dateStr) {
  // dateStr 是 YYYY-MM-DD（已从 createdAt UTC 字符串中裁切）
  const today    = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today)     return '今天';
  if (dateStr === yesterday) return '昨天';
  // 本地化日期格式
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function escapeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
