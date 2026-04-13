import { describe, test, expect } from 'vitest';
import { calcAgeMonths } from '../js/rules.js';

describe('calcAgeMonths — 月龄计算', () => {

  test('出生当天 → 0个月', () => {
    expect(calcAgeMonths('2026-04-11', '2026-04-11')).toBe(0);
  });

  test('整整6个月 → 6', () => {
    expect(calcAgeMonths('2025-10-11', '2026-04-11')).toBe(6);
  });

  test('5个月29天 → 5（未满6个月）', () => {
    expect(calcAgeMonths('2025-10-15', '2026-04-11')).toBe(5);
  });

  test('6个月1天 → 6', () => {
    expect(calcAgeMonths('2025-10-10', '2026-04-11')).toBe(6);
  });

  test('跨年计算正确', () => {
    expect(calcAgeMonths('2025-01-15', '2026-04-11')).toBe(14);
  });

  test('月份边界：出生日在月底，当月最后一天 → 正确计算', () => {
    // 出生 1月31日，今日3月31日 → 2个月
    expect(calcAgeMonths('2026-01-31', '2026-03-31')).toBe(2);
  });
});
