import { describe, test, expect } from 'vitest';
import { evaluateInterest } from '../js/rules.js';

// F规则（兴趣识别）
// 锚点（必须）：focusSec > typicalSec × 1.5
// 加分项（任意1）：单日重复≥3次 / 连续3天主动 / 有拓展行为
// 结果：锚点 + 任意1加分项 → isCandidate: true

describe('F规则 · 兴趣候选识别', () => {

  // ── 锚点条件 ──────────────────────────────────────────────

  test('专注时长超典型值1.5倍 → 锚点满足', () => {
    const result = evaluateInterest({
      focusSec: 91,        // 91 > 60 × 1.5 = 90 ✓
      typicalSec: 60,
      dailyCount: 1,
      consecutiveDays: 1,
      hasExtension: false,
    });
    expect(result.anchorMet).toBe(true);
  });

  test('专注时长等于典型值1.5倍 → 锚点不满足（必须超过）', () => {
    const result = evaluateInterest({
      focusSec: 90,
      typicalSec: 60,   // 90 / 60 = 1.5，不是 > 1.5
      dailyCount: 3,
      consecutiveDays: 3,
      hasExtension: true,
    });
    expect(result.anchorMet).toBe(false);
    expect(result.isCandidate).toBe(false);
  });

  test('专注时长不足1.5倍 → 锚点不满足，无论加分项多优秀', () => {
    const result = evaluateInterest({
      focusSec: 80,
      typicalSec: 60,   // 80/60 ≈ 1.33
      dailyCount: 5,
      consecutiveDays: 7,
      hasExtension: true,
    });
    expect(result.anchorMet).toBe(false);
    expect(result.isCandidate).toBe(false);
  });

  // ── 加分项 ────────────────────────────────────────────────

  test('锚点满足 + 单日重复≥3次 → 兴趣候选', () => {
    const result = evaluateInterest({
      focusSec: 100,
      typicalSec: 60,   // > 1.5x ✓
      dailyCount: 3,    // ≥3 ✓
      consecutiveDays: 1,
      hasExtension: false,
    });
    expect(result.isCandidate).toBe(true);
    expect(result.bonusReason).toBe('dailyRepeat');
  });

  test('锚点满足 + 连续3天主动 → 兴趣候选', () => {
    const result = evaluateInterest({
      focusSec: 100,
      typicalSec: 60,
      dailyCount: 1,
      consecutiveDays: 3,   // ≥3 ✓
      hasExtension: false,
    });
    expect(result.isCandidate).toBe(true);
    expect(result.bonusReason).toBe('consecutiveDays');
  });

  test('锚点满足 + 有拓展行为 → 兴趣候选', () => {
    const result = evaluateInterest({
      focusSec: 100,
      typicalSec: 60,
      dailyCount: 1,
      consecutiveDays: 1,
      hasExtension: true,   // ✓
    });
    expect(result.isCandidate).toBe(true);
    expect(result.bonusReason).toBe('extension');
  });

  test('锚点满足 + 无任何加分项 → 不是候选（锚点不够）', () => {
    const result = evaluateInterest({
      focusSec: 100,
      typicalSec: 60,
      dailyCount: 1,    // < 3
      consecutiveDays: 1, // < 3
      hasExtension: false,
    });
    expect(result.isCandidate).toBe(false);
    expect(result.anchorMet).toBe(true);
  });

  // ── 多个加分项同时满足时，取第一优先 ────────────────────

  test('多个加分项同时满足 → 取优先级最高的（dailyRepeat > consecutiveDays > extension）', () => {
    const result = evaluateInterest({
      focusSec: 100,
      typicalSec: 60,
      dailyCount: 3,
      consecutiveDays: 3,
      hasExtension: true,
    });
    expect(result.isCandidate).toBe(true);
    expect(result.bonusReason).toBe('dailyRepeat');
  });
});
