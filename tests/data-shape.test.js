/**
 * 数据形状验证测试
 * 确保 ACTIVITIES 和 MILESTONES 的字段与 UI 期望一致
 */
import { describe, it, expect } from 'vitest';
import { ACTIVITIES } from '../js/data/activities.js';
import { MILESTONES } from '../js/data/milestones.js';

describe('ACTIVITIES 数据形状', () => {
  it('每条活动有 title 字段（string）', () => {
    for (const a of ACTIVITIES) {
      expect(typeof a.title, `${a.id} 缺少 title`).toBe('string');
      expect(a.title.length, `${a.id}.title 为空`).toBeGreaterThan(0);
    }
  });

  it('每条活动有 ageRange: [min, max] 数组', () => {
    for (const a of ACTIVITIES) {
      expect(Array.isArray(a.ageRange), `${a.id} 缺少 ageRange`).toBe(true);
      expect(a.ageRange).toHaveLength(2);
      expect(typeof a.ageRange[0]).toBe('number');
      expect(typeof a.ageRange[1]).toBe('number');
    }
  });

  it('每条活动 domain 为全名（非缩写）', () => {
    const VALID_DOMAINS = ['language', 'sensorial', 'movement', 'practical_life', 'emotional_social'];
    for (const a of ACTIVITIES) {
      expect(VALID_DOMAINS, `${a.id}.domain="${a.domain}" 不是有效全名`).toContain(a.domain);
    }
  });

  it('每条活动 observeFocus 为字符串数组', () => {
    for (const a of ACTIVITIES) {
      expect(Array.isArray(a.observeFocus), `${a.id} 缺少 observeFocus 数组`).toBe(true);
      for (const f of a.observeFocus) {
        expect(typeof f, `${a.id}.observeFocus 元素不是字符串`).toBe('string');
      }
    }
  });

  it('每条活动有 typicalSec（正整数）', () => {
    for (const a of ACTIVITIES) {
      expect(typeof a.typicalSec, `${a.id} 缺少 typicalSec`).toBe('number');
      expect(a.typicalSec, `${a.id}.typicalSec 必须大于 0`).toBeGreaterThan(0);
    }
  });

  it('phases 每项有 label 和 desc 字段（非 tip）', () => {
    for (const a of ACTIVITIES) {
      for (const p of (a.phases ?? [])) {
        expect(typeof p.label, `${a.id} phase 缺少 label`).toBe('string');
        expect(typeof p.desc, `${a.id} phase 缺少 desc`).toBe('string');
      }
    }
  });
});

describe('MILESTONES 数据形状', () => {
  it('每条里程碑有 title 字段（string）', () => {
    for (const m of MILESTONES) {
      expect(typeof m.title, `${m.id} 缺少 title`).toBe('string');
      expect(m.title.length).toBeGreaterThan(0);
    }
  });

  it('每条里程碑 domain 为全名', () => {
    const VALID_DOMAINS = ['cognitive', 'motor', 'language', 'emotional_social', 'self_care'];
    for (const m of MILESTONES) {
      expect(VALID_DOMAINS, `${m.id}.domain="${m.domain}" 不是有效全名`).toContain(m.domain);
    }
  });

  it('每条里程碑有 windowStart 和 windowEnd', () => {
    for (const m of MILESTONES) {
      expect(typeof m.windowStart).toBe('number');
      expect(typeof m.windowEnd).toBe('number');
    }
  });
});
