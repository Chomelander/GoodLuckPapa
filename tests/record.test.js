import { describe, it, expect } from 'vitest';
import { buildRecordHTML, buildSessionHTML } from '../js/ui/record.js';

const sampleActivity = {
  id: 'S-0-01',
  title: '触觉感官板',
  domain: 'sensorial',
  ageRange: [0, 6],
  typicalSec: 120,
  observeAnchor: '孩子手部接触板面时的专注程度',
};

describe('buildRecordHTML', () => {
  it('renders activity title', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('触觉感官板');
  });

  it('renders focusSec pre-filled in hidden field', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('90');
  });

  it('renders emotion options', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    // Should contain at least some emotion options
    expect(html).toContain('专注');
    expect(html).toContain('愉悦');
  });

  it('renders initType options', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('孩子主导');
    expect(html).toContain('成人引导');
  });

  it('renders note textarea', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('textarea');
  });

  it('renders submit button', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('保存记录');
  });
});

describe('buildRecordHTML — observeAnchor 引导', () => {
  it('renders observeAnchor text in record form', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90 });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('renders obs-guide-card wrapper when observeAnchor present', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('obs-guide-card');
  });

  it('does not render obs-guide-card when activity has no observeAnchor', () => {
    const actNoAnchor = { ...sampleActivity, observeAnchor: undefined };
    const html = buildRecordHTML({ activity: actNoAnchor, focusSec: 0 });
    expect(html).not.toContain('obs-guide-card');
  });

  it('note textarea placeholder references observeAnchor guidance', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0 });
    expect(html).toContain('结合以上锚点');
  });
});

describe('buildRecordHTML — manualEntry 时长编辑', () => {
  it('manualEntry=true renders time input fields instead of static display', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0, manualEntry: true });
    expect(html).toContain('id="focus-min"');
    expect(html).toContain('id="focus-sec"');
  });

  it('manualEntry=false renders time as static display with edit hint', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 90, manualEntry: false });
    expect(html).toContain('01:30');
    expect(html).toContain('data-action="edit-focussec"');
  });

  it('manualEntry=true stores time in hidden field after input', () => {
    const html = buildRecordHTML({ activity: sampleActivity, focusSec: 0, manualEntry: true });
    // 隐藏字段 data-focussec 用于 submit 时读取
    expect(html).toContain('id="focussec-hidden"');
  });
});

describe('buildSessionHTML', () => {
  it('renders positive feedback', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 90,
      anchorMet: false,
    });
    expect(html).toContain('记录完成');
  });

  it('renders elapsed time in session card', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 75,
      anchorMet: false,
    });
    expect(html).toContain('01:15');
  });

  it('renders anchor met message when anchor is satisfied', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 200,
      anchorMet: true,
    });
    expect(html).toContain('专注超过');
  });

  it('renders activity title in session card', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 60,
      anchorMet: false,
    });
    expect(html).toContain('触觉感官板');
  });

  it('renders continue button', () => {
    const html = buildSessionHTML({
      activity: sampleActivity,
      focusSec: 60,
      anchorMet: false,
    });
    expect(html).toContain('查看今日');
  });
});
