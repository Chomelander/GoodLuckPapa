import { describe, test, expect } from 'vitest';
import { calcTypicalSec } from '../js/rules.js';

// 典型专注时长：供 F规则计算 typicalSec * 1.5 阈值
// 按月龄段（0-3月/3-6月/6-12月）和领域（L/S/M/E）区分

describe('calcTypicalSec — 典型专注时长', () => {

  test('0-3月 语言类(L) → 45秒', () => {
    expect(calcTypicalSec({ domain: 'L', ageMonths: 1 })).toBe(45);
  });

  test('0-3月 感官类(S) → 60秒', () => {
    expect(calcTypicalSec({ domain: 'S', ageMonths: 2 })).toBe(60);
  });

  test('3-6月 感官类(S) → 90秒', () => {
    expect(calcTypicalSec({ domain: 'S', ageMonths: 4 })).toBe(90);
  });

  test('3-6月 运动类(M) → 60秒', () => {
    expect(calcTypicalSec({ domain: 'M', ageMonths: 5 })).toBe(60);
  });

  test('6-12月 感官类(S) → 120秒', () => {
    expect(calcTypicalSec({ domain: 'S', ageMonths: 8 })).toBe(120);
  });

  test('6-12月 语言类(L) → 90秒', () => {
    expect(calcTypicalSec({ domain: 'L', ageMonths: 10 })).toBe(90);
  });

  test('未知领域 → 返回该月龄段默认值', () => {
    expect(calcTypicalSec({ domain: 'X', ageMonths: 4 })).toBe(60);
  });
});
