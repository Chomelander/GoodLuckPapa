/**
 * M1 Onboarding — 孩子档案建立
 * 三步：① 欢迎 → ② 填写档案 → ③ 完成
 */
import { state } from '../app.js';

export function renderOnboarding(onComplete) {
  const body = document.getElementById('onboarding-body');
  body.innerHTML = buildStep1(onComplete);
}

function buildStep1(onComplete) {
  return `
    <div style="padding: 24px 0 16px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🌱</div>
      <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">认识你的孩子</h2>
      <p style="color: var(--text-sec); line-height: 1.6; margin-bottom: 32px;">
        填写孩子的基本信息，<br>起起会根据月龄推荐最适合的观察活动。
      </p>
    </div>

    <form id="onboarding-form">
      <div class="form-group">
        <label class="form-label">孩子的名字（小名也可以）</label>
        <input class="form-input" type="text" id="ob-name" placeholder="例如：小明" maxlength="20" required>
      </div>

      <div class="form-group">
        <label class="form-label">出生日期</label>
        <input class="form-input" type="date" id="ob-birth" required
               max="${new Date().toISOString().slice(0,10)}">
      </div>

      <div class="form-group">
        <label class="form-label">性别</label>
        <div class="seg-control">
          <button type="button" class="seg-btn active" data-gender="male">男孩</button>
          <button type="button" class="seg-btn" data-gender="female">女孩</button>
          <button type="button" class="seg-btn" data-gender="unknown">暂不填写</button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-full" style="margin-top: 24px;">
        开始使用 →
      </button>
    </form>
  `;
}

// 事件委托（在 DOM 插入后立即绑定，仅在浏览器环境中注册）
if (typeof document !== 'undefined') {
document.addEventListener('click', e => {
  // 性别 seg-control
  const genderBtn = e.target.closest('[data-gender]');
  if (genderBtn) {
    genderBtn.closest('.seg-control')?.querySelectorAll('.seg-btn')
      .forEach(b => b.classList.remove('active'));
    genderBtn.classList.add('active');
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id !== 'onboarding-form') return;
  e.preventDefault();

  const name = document.getElementById('ob-name')?.value.trim();
  const birthDate = document.getElementById('ob-birth')?.value;
  const gender = document.querySelector('.seg-control .seg-btn.active')?.dataset.gender ?? 'unknown';

  if (!name || !birthDate) return;

  const profile = { name, birthDate, gender };
  await state.db.saveProfile(profile);
  await state.db.saveSettings({ onboardingComplete: true });
  state.profile = profile;

  // 显示完成页
  const body = document.getElementById('onboarding-body');
  const { calcAgeMonths } = await import('../rules.js');
  const { fmtAge } = await import('../app.js');
  const age = calcAgeMonths(birthDate, new Date().toISOString().slice(0,10));
  body.innerHTML = `
    <div style="padding: 40px 16px; text-align: center;">
      <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
      <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 8px;">你好，${name}！</h2>
      <p style="color: var(--text-sec); margin-bottom: 8px;">
        ${name}现在 <strong style="color: var(--primary)">${fmtAge(age)}</strong>
      </p>
      <p style="color: var(--text-sec); line-height: 1.6; margin-bottom: 40px;">
        起起会根据月龄为你推荐合适的蒙氏观察活动，每次只需几分钟。
      </p>
      <button class="btn btn-primary btn-full" id="ob-start-btn">开始观察</button>
    </div>
  `;

  document.getElementById('ob-start-btn')?.addEventListener('click', () => {
    const { onComplete: _cb } = document.getElementById('onboarding').__callbacks || {};
    // 触发回调（通过自定义事件传递）
    document.dispatchEvent(new CustomEvent('onboarding:complete'));
  });
});
} // end if (typeof document !== 'undefined')

// 完成事件监听（由 renderOnboarding 注册）
export function bindOnboardingComplete(cb) {
  document.addEventListener('onboarding:complete', cb, { once: true });
}
