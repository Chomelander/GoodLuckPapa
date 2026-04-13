import { describe, test, expect } from 'vitest';
import { shouldShowReEntry } from '../js/rules.js';

describe('shouldShowReEntry — 断记重返触发', () => {

  test('从未记录 → 触发（新用户也应欢迎）', () => {
    expect(shouldShowReEntry({ records: [], today: '2026-04-11' })).toBe(true);
  });

  test('今天有记录 → 不触发', () => {
    expect(shouldShowReEntry({
      records: [{ date: '2026-04-11' }],
      today: '2026-04-11',
    })).toBe(false);
  });

  test('昨天有记录（1天） → 不触发', () => {
    expect(shouldShowReEntry({
      records: [{ date: '2026-04-10' }],
      today: '2026-04-11',
    })).toBe(false);
  });

  test('2天前有记录 → 不触发', () => {
    expect(shouldShowReEntry({
      records: [{ date: '2026-04-09' }],
      today: '2026-04-11',
    })).toBe(false);
  });

  test('3天前有记录（距今恰好3天） → 触发', () => {
    expect(shouldShowReEntry({
      records: [{ date: '2026-04-08' }],
      today: '2026-04-11',
    })).toBe(true);
  });

  test('7天前有记录 → 触发', () => {
    expect(shouldShowReEntry({
      records: [{ date: '2026-04-04' }],
      today: '2026-04-11',
    })).toBe(true);
  });

  test('有多条记录时，以最近一条为准', () => {
    expect(shouldShowReEntry({
      records: [
        { date: '2026-03-01' }, // 很久以前
        { date: '2026-04-10' }, // 昨天
      ],
      today: '2026-04-11',
    })).toBe(false);
  });
});
