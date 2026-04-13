import { describe, test, expect } from 'vitest';
import { getMilestoneStatus } from '../js/rules.js';

// 里程碑状态流转
// pending   → 月龄未进入 windowStart
// watching  → 月龄在 [windowStart, windowEnd] 内
// achieved  → 父母手动标记（不由此函数处理，由外部设置 achieved: true）
// delayed   → 月龄超过 windowEnd 且未达成

describe('里程碑状态机', () => {

  test('月龄未到窗口期 → pending', () => {
    const status = getMilestoneStatus({
      ageMonths: 2,
      windowStart: 3,
      windowEnd: 6,
      achieved: false,
    });
    expect(status).toBe('pending');
  });

  test('月龄进入窗口期开始 → watching', () => {
    const status = getMilestoneStatus({
      ageMonths: 3,
      windowStart: 3,
      windowEnd: 6,
      achieved: false,
    });
    expect(status).toBe('watching');
  });

  test('月龄在窗口期中间 → watching', () => {
    const status = getMilestoneStatus({
      ageMonths: 5,
      windowStart: 3,
      windowEnd: 6,
      achieved: false,
    });
    expect(status).toBe('watching');
  });

  test('月龄在窗口期最后一个月 → watching（还没超出）', () => {
    const status = getMilestoneStatus({
      ageMonths: 6,
      windowStart: 3,
      windowEnd: 6,
      achieved: false,
    });
    expect(status).toBe('watching');
  });

  test('月龄超过窗口期且未达成 → delayed', () => {
    const status = getMilestoneStatus({
      ageMonths: 7,
      windowStart: 3,
      windowEnd: 6,
      achieved: false,
    });
    expect(status).toBe('delayed');
  });

  test('已手动标记达成 → achieved（无论月龄）', () => {
    const status = getMilestoneStatus({
      ageMonths: 5,
      windowStart: 3,
      windowEnd: 6,
      achieved: true,
    });
    expect(status).toBe('achieved');
  });

  test('已达成但月龄超出窗口 → 仍是 achieved（不降级）', () => {
    const status = getMilestoneStatus({
      ageMonths: 10,
      windowStart: 3,
      windowEnd: 6,
      achieved: true,
    });
    expect(status).toBe('achieved');
  });
});
