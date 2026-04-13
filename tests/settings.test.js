import { describe, it, expect } from 'vitest';
import { buildSettingsHTML, getPositiveTip } from '../js/ui/settings.js';

const sampleProfile = {
  name: '小明',
  birthDate: '2026-01-01',
  gender: 'male',
};

describe('getPositiveTip', () => {
  it('returns a string tip for a known domain', () => {
    const tip = getPositiveTip('sensorial');
    expect(typeof tip).toBe('string');
    expect(tip.length).toBeGreaterThan(0);
  });

  it('returns a string tip for movement domain', () => {
    const tip = getPositiveTip('movement');
    expect(typeof tip).toBe('string');
  });

  it('returns a fallback tip for unknown domain', () => {
    const tip = getPositiveTip('unknown_domain');
    expect(typeof tip).toBe('string');
    expect(tip.length).toBeGreaterThan(0);
  });

  it('returns different tips for different domains', () => {
    const sensorial = getPositiveTip('sensorial');
    const language = getPositiveTip('language');
    expect(sensorial).not.toBe(language);
  });
});

describe('buildSettingsHTML', () => {
  it('renders child name in profile section', () => {
    const html = buildSettingsHTML({ profile: sampleProfile, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('小明');
  });

  it('renders birth date', () => {
    const html = buildSettingsHTML({ profile: sampleProfile, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('2026-01-01');
  });

  it('renders guide intensity selector', () => {
    const html = buildSettingsHTML({ profile: sampleProfile, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('引导强度');
  });

  it('marks current intensity as active', () => {
    const html = buildSettingsHTML({ profile: sampleProfile, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('data-intensity="normal"');
  });

  it('renders data export button', () => {
    const html = buildSettingsHTML({ profile: sampleProfile, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('导出数据');
  });

  it('renders data import button', () => {
    const html = buildSettingsHTML({ profile: sampleProfile, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('导入数据');
  });

  it('renders empty state gracefully when profile is null', () => {
    const html = buildSettingsHTML({ profile: null, settings: { guideIntensity: 'normal' } });
    expect(html).toContain('设置');
  });
});
