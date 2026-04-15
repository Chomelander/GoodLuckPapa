import { describe, it, expect } from 'vitest';
import { buildTimerHTML } from '../js/ui/timer.js';

const sampleActivity = {
  id: 'S-0-01',
  title: '触觉感官板',
  domain: 'sensorial',
  ageRange: [0, 6],
  typicalSec: 120,
  observeAnchor: '孩子手部接触板面时的专注程度',
  observeFocus: ['手部动作是否主动', '眼神是否跟随手部'],
};

describe('buildTimerHTML', () => {
  it('renders activity title', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('触觉感官板');
  });

  it('renders elapsed time as mm:ss', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 75, running: true });
    expect(html).toContain('01:15');
  });

  it('renders 00:00 at start', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('00:00');
  });

  it('renders observeAnchor text', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('renders observeFocus items', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('手部动作是否主动');
    expect(html).toContain('眼神是否跟随手部');
  });

  it('shows 开始 button when not running', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('开始');
  });

  it('shows 暂停 button when running', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 10, running: true });
    expect(html).toContain('暂停');
  });

  it('shows 完成观察 button when elapsed > 0 and not running', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 30, running: false });
    expect(html).toContain('完成观察');
  });

  it('renders typical time reference', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    // typicalSec=120 → shows "2分钟" reference
    expect(html).toContain('2');
  });
});

describe('buildTimerHTML — 跳过计时按钮', () => {
  it('renders skip-timer button when elapsed is 0', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('data-action="skip-timer"');
  });

  it('renders skip-timer button when timer is running', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 15, running: true });
    expect(html).toContain('data-action="skip-timer"');
  });

  it('skip-timer button contains 直接填写 text', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('直接填写');
  });
});

describe('buildTimerHTML — guideIntensity 条件渲染', () => {
  it('light 模式下不显示 observeAnchor', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false, guideIntensity: 'light' });
    expect(html).not.toContain('孩子手部接触板面时的专注程度');
  });

  it('light 模式下不显示 observeFocus', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false, guideIntensity: 'light' });
    expect(html).not.toContain('手部动作是否主动');
  });

  it('normal 模式下显示 observeAnchor', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false, guideIntensity: 'normal' });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('heavy 模式下显示 observeAnchor 和 observeFocus', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false, guideIntensity: 'heavy' });
    expect(html).toContain('孩子手部接触板面时的专注程度');
    expect(html).toContain('手部动作是否主动');
  });

  it('不传 guideIntensity 默认为 normal（向后兼容）', () => {
    const html = buildTimerHTML({ activity: sampleActivity, elapsed: 0, running: false });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });
});
