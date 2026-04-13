/**
 * M5 七步心跳 SOP
 * 折叠式引导区块，受 guideIntensity 控制
 * light  → 不显示
 * normal → 折叠（默认收起）
 * heavy  → 默认展开
 */

const SOP_STEPS = [
  {
    num: 1,
    title: '环境准备',
    desc: '从活动库选一个当前月龄适合的活动，按材料清单备好物品，清理多余干扰物。',
  },
  {
    num: 2,
    title: '观察者准备',
    desc: '告诉自己：我今天是观察者，不是老师。把手放在背后——只看，不干预。',
  },
  {
    num: 3,
    title: '邀请宝宝',
    desc: '自然地呈现材料，等待宝宝主动靠近。无需强迫，宝宝有权拒绝。',
  },
  {
    num: 4,
    title: '计时观察',
    desc: '点击「开始计时」，记录宝宝与材料的互动。跟随观察锚点，留意专注时长。',
  },
  {
    num: 5,
    title: '记录4字段',
    desc: '完成后填写：专注时长 / 孩子状态 / 发起方式 / 观察备注（选填）。',
  },
  {
    num: 6,
    title: '即时正向反馈',
    desc: '不评价「做得好/不好」，只陈述事实：「你今天自己拿起了环。」',
  },
  {
    num: 7,
    title: '下次预备',
    desc: '看成长页的里程碑，考虑下次换一个维度的活动，或挑战当前活动的进阶版。',
  },
];

/**
 * 生成 M5 七步心跳 HTML
 * @param {{ guideIntensity?: 'light' | 'normal' | 'heavy' }} params
 * @returns {string} HTML 字符串，light 模式返回空字符串
 */
export function buildSopHTML({ guideIntensity = 'normal' } = {}) {
  if (guideIntensity === 'light') return '';

  const isOpen = guideIntensity === 'heavy';
  const openAttr = isOpen ? ' open' : '';

  const stepsHTML = SOP_STEPS.map(s => `
    <div style="display:flex;gap:10px;margin-bottom:12px">
      <div style="min-width:24px;height:24px;border-radius:50%;background:var(--primary);color:#fff;
                  display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;
                  flex-shrink:0;margin-top:1px">${s.num}</div>
      <div>
        <div style="font-size:14px;font-weight:600;margin-bottom:2px">${s.title}</div>
        <div style="font-size:13px;color:var(--text-sec);line-height:1.5">${s.desc}</div>
      </div>
    </div>`).join('');

  return `
    <div class="section" id="sop-section">
      <details${openAttr}>
        <summary style="cursor:pointer;list-style:none;display:flex;align-items:center;gap:6px;
                         font-size:14px;font-weight:600;color:var(--text-sec);padding:4px 0;
                         user-select:none">
          <span style="font-size:16px">▸</span>
          七步心跳观察流程
        </summary>
        <div style="margin-top:12px">
          ${stepsHTML}
        </div>
      </details>
    </div>`;
}
