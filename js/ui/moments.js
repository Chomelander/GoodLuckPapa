/**
 * 时光选项卡：微信朋友圈式瀑布流展示
 * 合并育儿日记 + 活动记录，按日期倒序排列
 */
import { state } from '../app.js';

export async function renderMoments() {
  const body = document.getElementById('moments-body');
  if (!body) return;

  // 加载数据
  const [diaries, records, activities] = await Promise.all([
    state.db.getDiaries(),
    state.db.getRecords(),
    (async () => state.activities)()
  ]);

  // 合并为统一的 moment 对象
  const moments = [];

  // 添加日记
  diaries.forEach(d => {
    moments.push({
      id: `diary-${d.id}`,
      type: 'diary',
      timestamp: d.createdAt,
      data: d
    });
  });

  // 添加活动记录
  records.forEach(r => {
    moments.push({
      id: `record-${r.id}`,
      type: 'record',
      timestamp: r.createdAt,
      data: r
    });
  });

  // 按时间倒序排列（最新在上）
  moments.sort((a, b) => {
    const dateA = new Date(b.timestamp).getTime();
    const dateB = new Date(a.timestamp).getTime();
    return dateA - dateB;
  });

  // 按日期分组
  const groupedByDate = new Map();
  moments.forEach(m => {
    const date = m.timestamp.split('T')[0]; // YYYY-MM-DD
    if (!groupedByDate.has(date)) {
      groupedByDate.set(date, []);
    }
    groupedByDate.get(date).push(m);
  });

  // 渲染 HTML
  let html = `<div class="moments-timeline">`;

  const sortedDates = Array.from(groupedByDate.keys()).sort().reverse();
  sortedDates.forEach(date => {
    const dateObj = new Date(date);
    const dateLabel = formatDateLabel(dateObj);

    html += `<div class="moment-date-separator">
      <span class="moment-date-text">${dateLabel}</span>
    </div>`;

    const dayMoments = groupedByDate.get(date);
    dayMoments.forEach(m => {
      if (m.type === 'diary') {
        html += buildDiaryCard(m);
      } else if (m.type === 'record') {
        html += buildRecordCard(m, activities);
      }
    });
  });

  html += `</div>`;
  body.innerHTML = html;

  // 事件委托（替换 onclick 避免多次调用时监听器叠加）
  body.onclick = e => {
    // 日记卡片点击删除按钮
    const delBtn = e.target.closest('[data-diary-del]');
    if (delBtn) {
      const diaryId = parseInt(delBtn.dataset.diaryDel, 10);
      handleDeleteDiary(diaryId, body);
      return;
    }

    // 活动记录卡片点击删除按钮
    const recDelBtn = e.target.closest('[data-record-del]');
    if (recDelBtn) {
      const recordId = parseInt(recDelBtn.dataset.recordDel, 10);
      handleDeleteRecord(recordId, body);
      return;
    }

    // 日记图片点击预览
    const imgPreview = e.target.closest('[data-diary-image]');
    if (imgPreview) {
      const url = imgPreview.dataset.diaryImage;
      showImagePreview(url);
      return;
    }
  };
}

// ═══════════════════════════════════════════════
// 卡片构建函数
// ═══════════════════════════════════════════════

function buildDiaryCard(moment) {
  const d = moment.data;
  const time = new Date(d.createdAt).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  let imageHtml = '';
  if (d.imageUrls && d.imageUrls.length > 0) {
    imageHtml = `<div class="moment-images">`;
    d.imageUrls.forEach(url => {
      imageHtml += `
        <img
          class="moment-image"
          src="${url}"
          alt="日记图片"
          data-diary-image="${url}"
          loading="lazy"
        />
      `;
    });
    imageHtml += `</div>`;
  }

  return `
    <div class="moment-card diary-card" data-moment-id="${moment.id}">
      <div class="moment-header">
        <div class="moment-title">📔 育儿日记</div>
        <div class="moment-time">${time}</div>
        <button class="moment-delete-btn" data-diary-del="${d.id}" aria-label="删除日记">×</button>
      </div>
      <div class="moment-content">
        <p>${escapeHTML(d.content)}</p>
        ${imageHtml}
      </div>
    </div>
  `;
}

function buildRecordCard(moment, activities) {
  const r = moment.data;
  const activity = activities.find(a => a.id === r.actId);
  const activityName = activity?.name || r.actId;
  const time = new Date(r.createdAt).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const focusMin = Math.round((r.focusSec || 0) / 60);
  const EMOTION_MAP = {
    'concentrated': { emoji: '😊', label: '专注' },
    'joyful':       { emoji: '😄', label: '愉快' },
    'distracted':   { emoji: '😐', label: '分散' },
    'frustrated':   { emoji: '😞', label: '受挫' },
  };
  const emotion = EMOTION_MAP[r.emotion] ?? { emoji: '😊', label: r.emotion || '未记录' };

  return `
    <div class="moment-card record-card" data-moment-id="${moment.id}">
      <div class="moment-header">
        <div class="moment-title">🎯 活动记录</div>
        <div class="moment-time">${time}</div>
        <button class="moment-delete-btn" data-record-del="${r.id}" aria-label="删除记录">×</button>
      </div>
      <div class="moment-content">
        <div class="record-activity">
          <strong>${escapeHTML(activityName)}</strong>
        </div>
        <div class="record-stats">
          ${r.focusSec ? `<span class="record-stat">⏱ ${focusMin} 分钟</span>` : ''}
          <span class="record-stat">${emotion.emoji} ${emotion.label}</span>
        </div>
        ${r.initType ? `<div class="record-type">${r.initType === 'child-led' ? '👶 主动' : '👩 引导'}</div>` : ''}
        ${r.note ? `<p class="record-note">${escapeHTML(r.note)}</p>` : ''}
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════
// 事件处理
// ═══════════════════════════════════════════════

async function handleDeleteDiary(diaryId, container) {
  if (!confirm('确定删除这条日记吗？')) return;

  try {
    await state.db.deleteDiary(diaryId);
    // 重新渲染
    await renderMoments();
  } catch (err) {
    console.error('Failed to delete diary:', err);
    alert('删除失败，请重试');
  }
}

async function handleDeleteRecord(recordId, container) {
  if (!confirm('确定删除这条记录吗？')) return;

  try {
    await state.db.deleteRecord(recordId);
    // 重新渲染
    await renderMoments();
  } catch (err) {
    console.error('Failed to delete record:', err);
    alert('删除失败，请重试');
  }
}

function showImagePreview(url) {
  const modal = document.createElement('div');
  modal.className = 'image-preview-modal';
  modal.innerHTML = `
    <div class="image-preview-backdrop" onclick="this.parentElement.remove()"></div>
    <div class="image-preview-container">
      <img src="${url}" alt="预览" />
      <button class="image-preview-close" onclick="this.closest('.image-preview-modal').remove()">×</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ═══════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════

function formatDateLabel(dateObj) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const date = dateObj.toLocaleDateString('zh-CN');
  const dateOnly = dateObj.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateOnly === todayStr) return '今天';
  if (dateOnly === yesterdayStr) return '昨天';

  return date;
}

function escapeHTML(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
