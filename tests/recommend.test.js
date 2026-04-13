import { describe, test, expect } from 'vitest';
import { getRecommendations } from '../js/rules.js';

// 测试数据：活动库样本
const ACT_L = { id: 'L-0-01', domain: 'L', minAge: 0, maxAge: 12 };
const ACT_S = { id: 'S-0-02', domain: 'S', minAge: 0, maxAge: 6 };
const ACT_E = { id: 'E-0-01', domain: 'E', minAge: 0, maxAge: 6 };
const ACT_M = { id: 'M-3-01', domain: 'M', minAge: 3, maxAge: 6 };
const ACT_S2 = { id: 'S-3-01', domain: 'S', minAge: 3, maxAge: 6 };

describe('getRecommendations — 今日推荐', () => {

  test('无活动 → main 为 null，backups 为空', () => {
    const result = getRecommendations({ activities: [], records: [], ageMonths: 3, today: '2026-04-11' });
    expect(result.main).toBeNull();
    expect(result.backups).toHaveLength(0);
  });

  test('返回1主2备（活动数量充足时）', () => {
    const acts = [ACT_L, ACT_S, ACT_E, ACT_M, ACT_S2];
    const result = getRecommendations({ activities: acts, records: [], ageMonths: 4, today: '2026-04-11' });
    expect(result.main).not.toBeNull();
    expect(result.backups).toHaveLength(2);
  });

  test('按月龄过滤：不返回月龄范围外的活动', () => {
    // ACT_M minAge:3 → ageMonths:2 时不应出现
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

  test('最近未做的活动排在最前（今天刚做的排后）', () => {
    const records = [
      { actId: 'L-0-01', date: '2026-04-11' }, // 今天做了
    ];
    const result = getRecommendations({
      activities: [ACT_L, ACT_S],
      records,
      ageMonths: 2,
      today: '2026-04-11',
    });
    // S-0-02 从未做过，应排第一
    expect(result.main?.id).toBe('S-0-02');
  });

  test('活动数量少于3时，backups 返回剩余全部', () => {
    const result = getRecommendations({
      activities: [ACT_L, ACT_S],
      records: [],
      ageMonths: 2,
      today: '2026-04-11',
    });
    expect(result.main).not.toBeNull();
    expect(result.backups).toHaveLength(1);
  });

  test('主推与备选的领域不同（多样性保证）', () => {
    const acts = [ACT_L, ACT_S, ACT_E, ACT_S2];
    const result = getRecommendations({ activities: acts, records: [], ageMonths: 4, today: '2026-04-11' });
    const mainDomain = result.main?.domain;
    const backupDomains = result.backups.map(b => b.domain);
    // 至少一个 backup 与 main 领域不同
    expect(backupDomains.some(d => d !== mainDomain)).toBe(true);
  });
});
