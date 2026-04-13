/**
 * M_ReEntry — 欢迎回来卡
 * 触发条件：距最近一次记录 ≥ 3 天，或从未记录
 */
export function showReEntry(totalRecords) {
  const backdrop = document.getElementById('reentry-backdrop');
  const overlay = document.getElementById('reentry-overlay');
  const body = document.getElementById('reentry-body');

  const isNewUser = totalRecords === 0;
  body.innerHTML = `
    <div class="overlay-title">${isNewUser ? '准备好开始了吗？' : '好久不见 👋'}</div>
    <p style="color:var(--text-sec); line-height:1.6; margin-bottom:20px;">
      ${isNewUser
        ? '起起已经为你的孩子准备好了第一个观察活动。每次只需几分钟，你会开始看到不一样的东西。'
        : '有段时间没有记录了。不用担心，从今天重新开始就好。孩子每天都在变化，记录下来的每一次都有意义。'
      }
    </p>
    <button class="btn btn-primary btn-full" id="reentry-cta">
      ${isNewUser ? '开始第一次观察' : '继续观察'}
    </button>
    <button class="btn btn-ghost btn-full mt-8" id="reentry-dismiss" style="margin-top:8px">
      稍后再说
    </button>
  `;

  backdrop.classList.add('open');
  overlay.removeAttribute('hidden');

  const close = () => {
    backdrop.classList.remove('open');
    overlay.setAttribute('hidden', '');
  };

  document.getElementById('reentry-cta')?.addEventListener('click', () => {
    close();
    // 切换到今日Tab
    document.querySelector('[data-tab="today"]')?.click();
  });
  document.getElementById('reentry-dismiss')?.addEventListener('click', close);
  backdrop.addEventListener('click', close, { once: true });
}
