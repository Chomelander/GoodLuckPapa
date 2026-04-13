// 典型专注时长表（秒）：[月龄段] → { 领域全名 → 秒数 }
const TYPICAL_SEC = {
  '0-3':  { language: 45, sensorial: 60, movement: 30, emotional_social: 30, practical_life: 45, default: 45 },
  '3-6':  { language: 60, sensorial: 90, movement: 60, emotional_social: 45, practical_life: 60, default: 60 },
  '6-12': { language: 90, sensorial: 120, movement: 90, emotional_social: 60, practical_life: 90, default: 90 },
};

// 兼容旧缩写（L/S/M/E），供历史代码使用
const DOMAIN_ALIAS = {
  L: 'language', S: 'sensorial', M: 'movement', E: 'emotional_social', P: 'practical_life',
};

/**
 * 查询典型专注时长
 * @param {{ domain: string, ageMonths: number }} params - domain 支持全名或缩写
 * @returns {number} 秒
 */
export function calcTypicalSec({ domain, ageMonths }) {
  const band = ageMonths < 3 ? '0-3' : ageMonths < 6 ? '3-6' : '6-12';
  const table = TYPICAL_SEC[band];
  const key = DOMAIN_ALIAS[domain] ?? domain;
  return table[key] ?? table.default;
}

/**
 * 计算宝宝完整月龄
 * @param {string} birthDate - 'YYYY-MM-DD'
 * @param {string} today     - 'YYYY-MM-DD'
 * @returns {number} 完整月龄（向下取整）
 */
export function calcAgeMonths(birthDate, today) {
  const b = new Date(birthDate);
  const t = new Date(today);
  let months = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * F规则：兴趣候选识别
 *
 * 锚点（必须）：focusSec > typicalSec × 1.5
 * 加分项（任意1）：
 *   - dailyRepeat: 单日重复 ≥ 3 次
 *   - consecutiveDays: 连续 3 天主动
 *   - extension: 有拓展/迁移行为
 * 结果：锚点 + 任意1加分项 → isCandidate: true，开启4周追踪
 *
 * @param {object} params
 * @param {number} params.focusSec       - 本次专注时长（秒）
 * @param {number} params.typicalSec     - 该活动典型专注时长（秒）
 * @param {number} params.dailyCount     - 今日已完成次数
 * @param {number} params.consecutiveDays - 连续主动天数
 * @param {boolean} params.hasExtension  - 是否有拓展/迁移行为
 * @returns {{ anchorMet: boolean, isCandidate: boolean, bonusReason: string|null }}
 */
export function evaluateInterest({ focusSec, typicalSec, dailyCount, consecutiveDays, hasExtension }) {
  const anchorMet = focusSec > typicalSec * 1.5;

  if (!anchorMet) {
    return { anchorMet: false, isCandidate: false, bonusReason: null };
  }

  // 加分项优先级：dailyRepeat > consecutiveDays > extension
  if (dailyCount >= 3) {
    return { anchorMet: true, isCandidate: true, bonusReason: 'dailyRepeat' };
  }
  if (consecutiveDays >= 3) {
    return { anchorMet: true, isCandidate: true, bonusReason: 'consecutiveDays' };
  }
  if (hasExtension) {
    return { anchorMet: true, isCandidate: true, bonusReason: 'extension' };
  }

  return { anchorMet: true, isCandidate: false, bonusReason: null };
}

/**
 * 里程碑状态机
 *
 * @param {object} params
 * @param {number} params.ageMonths     - 宝宝当前月龄
 * @param {number} params.windowStart   - 里程碑窗口期开始月龄
 * @param {number} params.windowEnd     - 里程碑窗口期结束月龄
 * @param {boolean} params.achieved     - 是否已手动标记达成
 * @returns {'pending' | 'watching' | 'achieved' | 'delayed'}
 */
/**
 * M3 今日推荐引擎
 * 规则：① 按月龄过滤 → ② 以最近完成日期排序（越久没做越优先）→ ③ 保证领域多样性
 *
 * @param {{ activities: object[], records: object[], ageMonths: number, today: string }} params
 * @returns {{ main: object|null, backups: object[] }}
 */
export function getRecommendations({ activities, records, ageMonths, today }) {
  // ① 按月龄过滤（支持 ageRange:[min,max] 或旧 minAge/maxAge）
  const eligible = activities.filter(a => {
    const min = a.ageRange ? a.ageRange[0] : a.minAge;
    const max = a.ageRange ? a.ageRange[1] : a.maxAge;
    return ageMonths >= min && ageMonths <= max;
  });
  if (eligible.length === 0) return { main: null, backups: [] };

  // ② 计算每个活动距上次完成的天数（未做过 = 9999，最高优先级）
  const daysBetween = (d1, d2) => {
    const ms = new Date(d2) - new Date(d1);
    return Math.round(ms / 86400000);
  };

  const scored = eligible.map(act => {
    const actRecords = records.filter(r => r.actId === act.id);
    const lastDate = actRecords.length
      ? actRecords.map(r => r.date).sort().at(-1)
      : null;
    const daysSince = lastDate ? daysBetween(lastDate, today) : 9999;
    return { act, daysSince };
  });

  // ③ 排序：未做 > 久未做 > 近期做过
  scored.sort((a, b) => b.daysSince - a.daysSince);

  // ④ 贪心选出领域多样的3个
  const selected = [];
  const usedDomains = new Set();

  // 优先不重复领域
  for (const item of scored) {
    if (selected.length >= 3) break;
    if (!usedDomains.has(item.act.domain)) {
      selected.push(item.act);
      usedDomains.add(item.act.domain);
    }
  }
  // 若不足3个，用剩余补充（可重复领域）
  for (const item of scored) {
    if (selected.length >= 3) break;
    if (!selected.includes(item.act)) {
      selected.push(item.act);
    }
  }

  return { main: selected[0] ?? null, backups: selected.slice(1) };
}

/**
 * 判断是否触发 M_ReEntry 欢迎回来卡
 * 规则：距最近一次记录 ≥ 3 天，或从未记录
 * @param {{ records: {date:string}[], today: string }} params
 * @returns {boolean}
 */
export function shouldShowReEntry({ records, today }) {
  if (records.length === 0) return true;
  const lastDate = records.map(r => r.date).sort().at(-1);
  const ms = new Date(today) - new Date(lastDate);
  const days = Math.round(ms / 86400000);
  return days >= 3;
}

export function getMilestoneStatus({ ageMonths, windowStart, windowEnd, achieved }) {
  if (achieved) return 'achieved';
  if (ageMonths < windowStart) return 'pending';
  if (ageMonths <= windowEnd) return 'watching';
  return 'delayed';
}
