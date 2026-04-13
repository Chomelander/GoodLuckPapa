/**
 * M5 七步心跳 SOP 测试
 */
import { describe, it, expect } from 'vitest';
import { buildSopHTML } from '../js/ui/sop.js';

describe('buildSopHTML — M5 七步心跳', () => {
  it('light 模式下返回空字符串（不显示）', () => {
    const html = buildSopHTML({ guideIntensity: 'light' });
    expect(html).toBe('');
  });

  it('normal 模式下返回可折叠区块', () => {
    const html = buildSopHTML({ guideIntensity: 'normal' });
    expect(html.length).toBeGreaterThan(0);
    // 折叠状态：details 元素无 open 属性
    expect(html).toContain('<details');
    expect(html).not.toContain('<details open');
  });

  it('heavy 模式下 details 默认展开', () => {
    const html = buildSopHTML({ guideIntensity: 'heavy' });
    expect(html).toContain('<details open');
  });

  it('包含7步内容', () => {
    const html = buildSopHTML({ guideIntensity: 'normal' });
    // 应包含关键步骤关键词
    expect(html).toContain('环境');
    expect(html).toContain('观察');
    expect(html).toContain('记录');
  });

  it('包含可折叠的 summary 标题', () => {
    const html = buildSopHTML({ guideIntensity: 'normal' });
    expect(html).toContain('<summary');
    expect(html).toContain('七步');
  });

  it('默认 guideIntensity 为 normal（不传参时）', () => {
    const html = buildSopHTML({});
    expect(html).toContain('<details');
    expect(html).not.toContain('<details open');
  });
});
