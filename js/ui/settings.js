/**
 * 设置页 + M6.5 情境化正向提示
 * M9: 数据导出/导入
 */
import { state } from '../app.js';
import { showCustomActOverlay } from './custom-activity.js';

// ── M6.5 情境化正向提示（不禁令，只支持）─────────────────
const POSITIVE_TIPS = {
  sensorial: [
    '孩子的手在探索——这是感官学习最好的样子。',
    '让材料说话，孩子已经在认真倾听了。',
    '感官探索不需要目的，过程本身就是学习。',
  ],
  movement: [
    '身体的每一次尝试都在建立大脑的新连接。',
    '跌倒和爬起来，这是孩子在教自己。',
    '给空间，给时间，运动发展自有节奏。',
  ],
  language: [
    '孩子在听，即使还没在说。',
    '你的语言是孩子最初的词典。',
    '每次回应都在告诉孩子：你的声音重要。',
  ],
  practical_life: [
    '让孩子"帮忙"，那是真正的参与，不是表演。',
    '慢一点，等一等——独立正在发生。',
    '孩子重复做同一件事，是因为他在精通它。',
  ],
  emotional_social: [
    '情绪没有对错，帮助孩子说出来比评判更重要。',
    '孩子观察你，就是在学习怎么和世界相处。',
    '安全感是所有探索的地基。',
  ],
};

const FALLBACK_TIPS = [
  '观察本身就是最好的陪伴方式。',
  '你在记录，孩子在成长，两者同步发生。',
  '每一次观察都让你更了解你的孩子。',
];

export function getPositiveTip(domain) {
  const pool = POSITIVE_TIPS[domain] ?? FALLBACK_TIPS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── buildSettingsHTML ──────────────────────────────────────

export function buildSettingsHTML({ profile, settings }) {
  const intensityOptions = [
    { value: 'light',  label: '轻', desc: '最少引导提示' },
    { value: 'normal', label: '中', desc: '推荐，均衡引导' },
    { value: 'heavy',  label: '重', desc: '详细步骤说明' },
  ];

  const profileSection = profile
    ? `<div class="card" style="margin-bottom:12px">
         <div class="card-title" style="margin-bottom:8px">孩子档案</div>
         <div class="flex-center gap-8" style="margin-bottom:4px">
           <span class="text-sm text-sec" style="width:60px">姓名</span>
           <span>${profile.name}</span>
         </div>
         <div class="flex-center gap-8" style="margin-bottom:4px">
           <span class="text-sm text-sec" style="width:60px">出生日期</span>
           <span>${profile.birthDate}</span>
         </div>
         <div class="flex-center gap-8">
           <span class="text-sm text-sec" style="width:60px">性别</span>
           <span>${profile.gender === 'male' ? '男孩' : profile.gender === 'female' ? '女孩' : '未填写'}</span>
         </div>
       </div>`
    : `<div class="card" style="margin-bottom:12px">
         <p class="text-sec">尚未建立孩子档案</p>
       </div>`;

  const intensityBtns = intensityOptions.map(opt => `
    <button type="button" class="seg-btn${settings.guideIntensity === opt.value ? ' active' : ''}"
      data-intensity="${opt.value}">
      ${opt.label}
    </button>`).join('');

  return `
    <div class="section">
      <div class="section-title">孩子信息</div>
      ${profileSection}
    </div>

    <div class="section">
      <div class="section-title">引导强度</div>
      <div class="card">
        <div style="font-size:13px;color:var(--text-sec);margin-bottom:12px;line-height:1.5">
          调整观察活动中的提示详细程度
        </div>
        <div class="seg-control" id="intensity-control">
          ${intensityBtns}
        </div>
        <div style="margin-top:8px">
          ${intensityOptions.map(opt => `
            <div id="intensity-desc-${opt.value}"
              style="font-size:12px;color:var(--text-mute);${settings.guideIntensity === opt.value ? '' : 'display:none'}">
              ${opt.desc}
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">数据管理（M9）</div>
      <div class="card">
        <button class="btn btn-secondary btn-full" id="btn-export" style="margin-bottom:8px">
          导出数据
        </button>
        <label class="btn btn-ghost btn-full" style="cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;padding:12px 20px;border-radius:var(--r-md);border:1px solid var(--border)">
          导入数据
          <input type="file" id="import-file" accept=".json" style="display:none">
        </label>
      </div>
    </div>

    <div class="section" id="settings-records-section">
      <div class="section-title">历史记录</div>
      <div class="card" id="settings-records-list">
        <p class="text-sec" style="text-align:center;padding:16px 0">加载中…</p>
      </div>
    </div>

    <div class="section" id="settings-custom-acts-section">
      <div class="flex-center gap-8" style="margin-bottom:8px">
        <span class="section-title" style="margin:0;flex:1">自定义活动</span>
        <button class="btn btn-ghost btn-sm" id="btn-custom-act-add">+ 新增</button>
      </div>
      <div id="settings-custom-acts-list">
        <p class="text-sec" style="text-align:center;padding:16px 0">加载中…</p>
      </div>
    </div>

    <div class="section">
      <div style="text-align:center;font-size:12px;color:var(--text-mute)">
        起起成长设置 · 数据存储在本设备，不上传任何服务器
      </div>
    </div>`;
}

// ── 浏览器端渲染 ──────────────────────────────────────────

export async function renderSettings() {
  const body = document.getElementById('settings-body');
  if (!body) return;

  const settings = await state.db.getSettings();
  body.innerHTML = buildSettingsHTML({ profile: state.profile, settings });

  // 引导强度切换
  body.querySelector('#intensity-control')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-intensity]');
    if (!btn) return;
    const intensity = btn.dataset.intensity;

    body.querySelectorAll('#intensity-control .seg-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    body.querySelectorAll('[id^="intensity-desc-"]')
      .forEach(el => { el.style.display = 'none'; });
    body.querySelector(`#intensity-desc-${intensity}`)?.removeAttribute('style');

    await state.db.saveSettings({ ...settings, guideIntensity: intensity });
    state.settings = { ...settings, guideIntensity: intensity };
  });

  // M9 导出
  body.querySelector('#btn-export')?.addEventListener('click', async () => {
    const [profile, records, milestones, monthlyReviews] = await Promise.all([
      state.db.getProfile(),
      state.db.getRecords(),
      Promise.all(state.milestones.map(m => state.db.getMilestoneState(m.id)
        .then(s => s ? { id: m.id, ...s } : null))).then(arr => arr.filter(Boolean)),
      Promise.all(
        [...new Set(records?.map(r => r.date.slice(0, 7)) ?? [])].map(
          mo => state.db.getMonthlyReview(mo).then(r => r ? { month: mo, ...r } : null)
        )
      ).then(arr => arr.filter(Boolean)),
    ]);

    const data = { exportedAt: new Date().toISOString(), profile, records, milestones, monthlyReviews };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qiqi-export-${state.today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // M9 导入
  body.querySelector('#import-file')?.addEventListener('change', async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.profile) await state.db.saveProfile(data.profile);
      if (data.records) {
        for (const r of data.records) await state.db.addRecord(r);
      }
      if (data.milestones) {
        for (const m of data.milestones) {
          const { id, ...mstate } = m;
          await state.db.saveMilestoneState(id, mstate);
        }
      }
      alert('数据导入成功，请刷新页面');
    } catch {
      alert('导入失败：文件格式不正确');
    }
  });

  // ── 历史记录管理 ──────────────────────────────────────────
  const RECORDS_PAGE_SIZE = 20;
  let recordsOffset = 0;

  async function renderRecordsList(append = false) {
    const list = body.querySelector('#settings-records-list');
    if (!list) return;

    const allRecords = (await state.db.getRecords())
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    const page = allRecords.slice(recordsOffset, recordsOffset + RECORDS_PAGE_SIZE);

    const EMOTION_MAP = { engaged: '专注', happy: '愉悦', calm: '平静', distracted: '分心', frustrated: '挫败' };
    const INIT_MAP = { child_led: '孩子主导', adult_led: '成人引导', joint: '共同探索' };

    const itemsHTML = page.map(r => {
      const act = state.activities.find(a => a.id === r.actId);
      const title = act?.title ?? r.actId;
      const fmtSec = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
      return `
        <div class="card" style="margin-bottom:8px;padding:10px 14px" id="sr-card-${r.id}">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="flex:1;font-size:14px;font-weight:500">${title}</span>
            <span style="font-size:13px;color:var(--primary);font-weight:600">${fmtSec(r.focusSec ?? 0)}</span>
          </div>
          <div style="font-size:12px;color:var(--text-mute);margin-top:2px">
            ${r.date ?? ''} · ${EMOTION_MAP[r.emotion] ?? ''} · ${INIT_MAP[r.initType] ?? ''}
          </div>
          <div id="sr-actions-${r.id}" style="margin-top:6px">
            <button class="btn btn-ghost btn-sm" data-action="sr-delete" data-id="${r.id}"
              style="color:var(--danger)">删除</button>
          </div>
        </div>`;
    }).join('');

    const hasMore = allRecords.length > recordsOffset + RECORDS_PAGE_SIZE;
    const moreBtn = hasMore
      ? `<button class="btn btn-ghost btn-sm btn-full" id="sr-load-more"
           style="margin-top:4px">加载更多</button>`
      : '';

    if (!append) {
      list.innerHTML = page.length === 0
        ? `<p class="text-sec" style="text-align:center;padding:16px 0">暂无历史记录</p>`
        : itemsHTML + moreBtn;
    } else {
      const existingMore = list.querySelector('#sr-load-more');
      existingMore?.remove();
      list.insertAdjacentHTML('beforeend', itemsHTML + moreBtn);
    }
  }

  await renderRecordsList();

  body.querySelector('#settings-records-list')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    const numId = parseInt(id, 10);

    if (action === 'sr-delete') {
      const actionsEl = document.getElementById(`sr-actions-${id}`);
      if (!actionsEl) return;
      actionsEl.innerHTML = `
        <span style="font-size:13px;color:var(--text-sec)">确认删除？</span>
        <button class="btn btn-ghost btn-sm" data-action="sr-confirm" data-id="${id}"
          style="color:var(--danger)">确认</button>
        <button class="btn btn-ghost btn-sm" data-action="sr-cancel" data-id="${id}">取消</button>`;
    } else if (action === 'sr-confirm') {
      await state.db.deleteRecord(numId);
      document.getElementById(`sr-card-${id}`)?.remove();
    } else if (action === 'sr-cancel') {
      const actionsEl = document.getElementById(`sr-actions-${id}`);
      if (actionsEl) actionsEl.innerHTML = `
        <button class="btn btn-ghost btn-sm" data-action="sr-delete" data-id="${id}"
          style="color:var(--danger)">删除</button>`;
    } else if (action === 'sr-load-more' || btn.id === 'sr-load-more') {
      recordsOffset += RECORDS_PAGE_SIZE;
      await renderRecordsList(true);
    }
  });

  // 加载更多按钮（id 匹配）
  body.querySelector('#settings-records-list')?.addEventListener('click', async e => {
    if (e.target.id === 'sr-load-more') {
      recordsOffset += RECORDS_PAGE_SIZE;
      await renderRecordsList(true);
    }
  });

  // ── 自定义活动管理 ─────────────────────────────────────────

  async function renderCustomActsList() {
    const list = body.querySelector('#settings-custom-acts-list');
    if (!list) return;
    const customActs = await state.db.getCustomActivities();
    const DOMAIN_LBL = { sensorial:'感官', practical_life:'日常生活', movement:'运动', language:'语言', emotional_social:'情绪社交' };

    list.innerHTML = customActs.length === 0
      ? `<div class="card"><p class="text-sec" style="text-align:center;padding:12px 0">尚未添加自定义活动</p></div>`
      : customActs.map(act => `
          <div class="card" style="margin-bottom:8px;padding:10px 14px" id="ca-card-${act.id}">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="flex:1;font-size:14px;font-weight:500">${act.title}</span>
              <span style="font-size:12px;color:var(--text-mute)">
                ${DOMAIN_LBL[act.domain] ?? act.domain} · ${act.ageRange[0]}-${act.ageRange[1]}月
              </span>
            </div>
            <div id="ca-actions-${act.id}" style="margin-top:6px;display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" data-action="ca-edit" data-id="${act.id}">编辑</button>
              <button class="btn btn-ghost btn-sm" data-action="ca-delete" data-id="${act.id}"
                style="color:var(--danger)">删除</button>
            </div>
          </div>`).join('');
  }

  await renderCustomActsList();

  body.querySelector('#btn-custom-act-add')?.addEventListener('click', () => {
    showCustomActOverlay();
  });

  body.querySelector('#settings-custom-acts-list')?.addEventListener('click', async e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === 'ca-edit') {
      const customActs = await state.db.getCustomActivities();
      const act = customActs.find(a => a.id === id);
      if (act) showCustomActOverlay({ act });
    } else if (action === 'ca-delete') {
      const actionsEl = document.getElementById(`ca-actions-${id}`);
      if (!actionsEl) return;
      actionsEl.innerHTML = `
        <span style="font-size:13px;color:var(--text-sec)">确认删除？</span>
        <button class="btn btn-ghost btn-sm" data-action="ca-confirm" data-id="${id}"
          style="color:var(--danger)">确认</button>
        <button class="btn btn-ghost btn-sm" data-action="ca-cancel" data-id="${id}">取消</button>`;
    } else if (action === 'ca-confirm') {
      await state.db.deleteCustomActivity(id);
      // 同步 state.activities
      const { ACTIVITIES } = await import('../data/activities.js');
      const remaining = await state.db.getCustomActivities();
      state.activities = [...ACTIVITIES, ...remaining];
      document.getElementById(`ca-card-${id}`)?.remove();
    } else if (action === 'ca-cancel') {
      const actionsEl = document.getElementById(`ca-actions-${id}`);
      if (actionsEl) actionsEl.innerHTML = `
        <button class="btn btn-ghost btn-sm" data-action="ca-edit" data-id="${id}">编辑</button>
        <button class="btn btn-ghost btn-sm" data-action="ca-delete" data-id="${id}"
          style="color:var(--danger)">删除</button>`;
    }
  });

  // 自定义活动保存后刷新列表
  document.addEventListener('customAct:saved', renderCustomActsList);
}
