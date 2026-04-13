import { describe, it, expect } from 'vitest';
import { buildTodayHTML, buildTodayCompletedHTML } from '../js/ui/today.js';

const sampleMain = {
  id: 'S-0-01',
  title: '触觉感官板',
  domain: 'sensorial',
  ageRange: [0, 6],
  typicalSec: 120,
  observeAnchor: '孩子手部接触板面时的专注程度',
  materials: ['木质感官板', '防滑垫'],
  environment: '安静地板区域',
  errorControl: '材质对比自行感知',
};

const sampleBackup = {
  id: 'S-0-02',
  title: '声音瓶配对',
  domain: 'sensorial',
  ageRange: [3, 9],
  typicalSec: 90,
  observeAnchor: '摇晃瓶子时的反应',
  materials: ['音乐瓶', '托盘'],
};

describe('buildTodayHTML', () => {
  it('renders main activity title', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).toContain('触觉感官板');
  });

  it('renders 开始计时 button on main card', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).toContain('开始计时');
  });

  it('renders observeAnchor on main card', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).toContain('孩子手部接触板面时的专注程度');
  });

  it('shows 首次 when daysSince is null', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).toContain('首次');
  });

  it('shows days count when daysSince is a number', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: 5 });
    expect(html).toContain('5');
  });

  it('shows 今天 when daysSince is 0', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: 0 });
    expect(html).toContain('今天');
  });

  it('renders backup activities section when backups provided', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [sampleBackup], daysSince: null });
    expect(html).toContain('声音瓶配对');
  });

  it('does not render backup section when backups is empty', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).not.toContain('备选');
  });

  it('renders empty state when main is null', () => {
    const html = buildTodayHTML({ main: null, backups: [], daysSince: null });
    expect(html).toContain('暂无推荐');
  });

  it('includes data-id attribute with activity id', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).toContain('data-id="S-0-01"');
  });

  it('renders materials list on main card when present', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [], daysSince: null });
    expect(html).toContain('木质感官板');
    expect(html).toContain('防滑垫');
  });

  it('does not render materials block on main card when materials absent', () => {
    const mainNoMat = { ...sampleMain, materials: undefined };
    const html = buildTodayHTML({ main: mainNoMat, backups: [], daysSince: null });
    expect(html).not.toContain('需要准备');
  });

  it('backup card has 详情 button linking to activity detail', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [sampleBackup], daysSince: null });
    expect(html).toContain('data-action="view-detail"');
    expect(html).toContain('data-id="S-0-02"');
  });

  it('backup card renders its own materials list', () => {
    const html = buildTodayHTML({ main: sampleMain, backups: [sampleBackup], daysSince: null });
    expect(html).toContain('音乐瓶');
  });
});

const completedActivities = [
  { id: 'S-0-01', title: '触觉感官板', domain: 'sensorial', ageRange: [0, 6] },
];

describe('buildTodayCompletedHTML', () => {
  it('returns empty string when no records today', () => {
    const html = buildTodayCompletedHTML({ records: [], activities: completedActivities, today: '2026-04-11' });
    expect(html).toBe('');
  });

  it('shows section title 今日记录 when records exist', () => {
    const records = [{ actId: 'S-0-01', date: '2026-04-11', focusSec: 90, emotion: 'happy' }];
    const html = buildTodayCompletedHTML({ records, activities: completedActivities, today: '2026-04-11' });
    expect(html).toContain('今日记录');
  });

  it('shows activity title for each completed record', () => {
    const records = [{ actId: 'S-0-01', date: '2026-04-11', focusSec: 90, emotion: 'happy' }];
    const html = buildTodayCompletedHTML({ records, activities: completedActivities, today: '2026-04-11' });
    expect(html).toContain('触觉感官板');
  });

  it('shows formatted duration (90s → 01:30)', () => {
    const records = [{ actId: 'S-0-01', date: '2026-04-11', focusSec: 90, emotion: 'happy' }];
    const html = buildTodayCompletedHTML({ records, activities: completedActivities, today: '2026-04-11' });
    expect(html).toContain('01:30');
  });

  it('only shows records for today, not older dates', () => {
    const records = [
      { actId: 'S-0-01', date: '2026-04-11', focusSec: 90, emotion: 'happy' },
      { actId: 'S-0-01', date: '2026-04-10', focusSec: 60, emotion: 'calm' },
    ];
    const html = buildTodayCompletedHTML({ records, activities: completedActivities, today: '2026-04-11' });
    // 只应出现1次 01:30（今天），不含 01:00（昨天）
    expect(html).toContain('01:30');
    expect(html).not.toContain('01:00');
  });
});
