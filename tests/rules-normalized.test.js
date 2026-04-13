/**
 * rules.js 规范化接口测试
 * calcTypicalSec 接受全名 domain（非缩写）
 * getRecommendations 接受 ageRange 格式
 */
import { describe, test, expect } from 'vitest';
import { calcTypicalSec, getRecommendations } from '../js/rules.js';

describe('calcTypicalSec — 全名 domain 接口', () => {
  test('language, 1个月 → 45秒', () => {
    expect(calcTypicalSec({ domain: 'language', ageMonths: 1 })).toBe(45);
  });

  test('sensorial, 2个月 → 60秒', () => {
    expect(calcTypicalSec({ domain: 'sensorial', ageMonths: 2 })).toBe(60);
  });

  test('sensorial, 4个月 → 90秒', () => {
    expect(calcTypicalSec({ domain: 'sensorial', ageMonths: 4 })).toBe(90);
  });

  test('movement, 5个月 → 60秒', () => {
    expect(calcTypicalSec({ domain: 'movement', ageMonths: 5 })).toBe(60);
  });

  test('emotional_social, 3个月 → 45秒', () => {
    expect(calcTypicalSec({ domain: 'emotional_social', ageMonths: 3 })).toBe(45);
  });

  test('sensorial, 8个月 → 120秒', () => {
    expect(calcTypicalSec({ domain: 'sensorial', ageMonths: 8 })).toBe(120);
  });

  test('language, 10个月 → 90秒', () => {
    expect(calcTypicalSec({ domain: 'language', ageMonths: 10 })).toBe(90);
  });

  test('未知 domain → 返回该月龄段默认值', () => {
    expect(calcTypicalSec({ domain: 'unknown', ageMonths: 4 })).toBe(60);
  });
});

describe('getRecommendations — ageRange 接口', () => {
  const ACT_L = { id: 'L-0-01', domain: 'language',         ageRange: [0, 12] };
  const ACT_S = { id: 'S-0-02', domain: 'sensorial',        ageRange: [0, 6] };
  const ACT_E = { id: 'E-0-01', domain: 'emotional_social', ageRange: [0, 6] };
  const ACT_M = { id: 'M-3-01', domain: 'movement',         ageRange: [3, 6] };

  test('按 ageRange 过滤月龄不匹配的活动', () => {
    // ACT_M ageRange [3,6]，月龄2时不应出现
    const result = getRecommendations({
      activities: [ACT_M, ACT_L],
      records: [],
      ageMonths: 2,
      today: '2026-04-11',
    });
    expect(result.main?.id).toBe('L-0-01');
    const allIds = [result.main?.id, ...result.backups.map(b => b.id)];
    expect(allIds).not.toContain('M-3-01');
  });

  test('无活动时返回 null + 空数组', () => {
    const result = getRecommendations({ activities: [], records: [], ageMonths: 3, today: '2026-04-11' });
    expect(result.main).toBeNull();
    expect(result.backups).toHaveLength(0);
  });

  test('充足活动时返回1主2备', () => {
    const result = getRecommendations({
      activities: [ACT_L, ACT_S, ACT_E, ACT_M],
      records: [],
      ageMonths: 4,
      today: '2026-04-11',
    });
    expect(result.main).not.toBeNull();
    expect(result.backups).toHaveLength(2);
  });

  test('最近未做的活动排最前', () => {
    const records = [{ actId: 'L-0-01', date: '2026-04-11' }];
    const result = getRecommendations({
      activities: [ACT_L, ACT_S],
      records,
      ageMonths: 2,
      today: '2026-04-11',
    });
    expect(result.main?.id).toBe('S-0-02');
  });
});
